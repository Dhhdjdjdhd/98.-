import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { StorageService } from '../../common/storage/storage.interface';
import { COLLECTIONS, Role, WorkerStatus } from '../../common/enums';
import { User, ParentProfile, WorkerProfile } from '../../common/models';
import { genId } from '../../common/util/id.util';
import { nowKst } from '../../common/util/kst.util';
import { RegisterParentDto } from './dto/register-parent.dto';
import { RegisterWorkerDto } from './dto/register-worker.dto';

@Injectable()
export class UsersService {
  constructor(private readonly db: StorageService) {}

  // 로그인용: 휴대폰으로 사용자 조회(비밀번호 해시 포함)
  async findByPhone(phone: string): Promise<User | undefined> {
    return this.db.findOne<User>(COLLECTIONS.USERS, (u) => u.phone === phone);
  }

  // ---- 조회 헬퍼 ----
  async getUser(userId: string): Promise<User> {
    const user = await this.db.findById<User>(COLLECTIONS.USERS, userId);
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');
    return user;
  }

  async getWorkerByUserId(userId: string): Promise<WorkerProfile> {
    const worker = await this.db.findOne<WorkerProfile>(
      COLLECTIONS.WORKERS,
      (w) => w.userId === userId,
    );
    if (!worker) throw new NotFoundException('근무자 프로필을 찾을 수 없습니다.');
    return worker;
  }

  async getParentDetail(userId: string) {
    const user = await this.getUser(userId);
    const profile = await this.db.findOne<ParentProfile>(
      COLLECTIONS.PARENTS,
      (p) => p.userId === userId,
    );
    const safeUser = { ...user };
    delete (safeUser as any).passwordHash; // 비밀번호 해시 응답 제외
    return { ...safeUser, profile };
  }

  async getWorkerDetail(userId: string) {
    const user = await this.getUser(userId);
    const profile = await this.getWorkerByUserId(userId);
    return { ...user, profile };
  }

  private async assertPhoneUnique(phone: string) {
    const exists = await this.db.findOne<User>(COLLECTIONS.USERS, (u) => u.phone === phone);
    if (exists) throw new ConflictException('이미 가입된 휴대폰 번호입니다.');
  }

  // ---- 부모 가입 ----
  async registerParent(dto: RegisterParentDto) {
    await this.assertPhoneUnique(dto.phone);
    const now = nowKst();

    const user: User = {
      id: genId('usr'),
      role: Role.PARENT,
      phone: dto.phone,
      name: dto.name,
      passwordHash: bcrypt.hashSync(dto.password, 10),
      createdAt: now,
    };
    await this.db.insert(COLLECTIONS.USERS, user);

    const profile: ParentProfile = {
      id: genId('par'),
      userId: user.id,
      address: dto.address,
      paymentMethod: '미등록',
      createdAt: now,
    };
    await this.db.insert(COLLECTIONS.PARENTS, profile);

    return { ...user, profile };
  }

  // ---- 근무자 가입 (승인 대기) ----
  async registerWorker(dto: RegisterWorkerDto) {
    await this.assertPhoneUnique(dto.phone);
    const now = nowKst();

    const user: User = {
      id: genId('usr'),
      role: Role.WORKER,
      phone: dto.phone,
      name: dto.name,
      passwordHash: bcrypt.hashSync(dto.password, 10),
      createdAt: now,
    };
    await this.db.insert(COLLECTIONS.USERS, user);

    const profile: WorkerProfile = {
      id: genId('wrk'),
      userId: user.id,
      licenseType: dto.licenseType,
      grade: dto.grade,
      careerYears: dto.careerYears,
      careerNote: dto.careerNote ?? '',
      docs: {
        license: false,
        career: false,
        idCard: false,
        criminalCheck: false,
        childAbuseCheck: false,
        healthCert: false,
      },
      status: WorkerStatus.PENDING,
      ratingAvg: 0,
      ratingCount: 0,
      careCount: 0,
      bankName: dto.bankName,
      accountNumber: dto.accountNumber,
      accountHolder: dto.accountHolder,
      createdAt: now,
    };
    await this.db.insert(COLLECTIONS.WORKERS, profile);

    return { ...user, profile };
  }

  // ---- 근무자 목록 (관리자용, 상태 필터) ----
  async listWorkers(status?: WorkerStatus) {
    const workers = status
      ? await this.db.find<WorkerProfile>(COLLECTIONS.WORKERS, (w) => w.status === status)
      : await this.db.all<WorkerProfile>(COLLECTIONS.WORKERS);

    return Promise.all(
      workers.map(async (w) => {
        const user = await this.db.findById<User>(COLLECTIONS.USERS, w.userId);
        return { ...w, name: user?.name, phone: user?.phone };
      }),
    );
  }

  // ---- 매칭용: 특정 등급의 승인된 근무자 ----
  async findApprovedWorkersByGrade(grade: string): Promise<WorkerProfile[]> {
    return this.db.find<WorkerProfile>(
      COLLECTIONS.WORKERS,
      (w) => w.status === WorkerStatus.APPROVED && w.grade === grade,
    );
  }

  // ---- 평점 반영 ----
  async applyRating(targetUserId: string, rating: number) {
    const worker = await this.db.findOne<WorkerProfile>(
      COLLECTIONS.WORKERS,
      (w) => w.userId === targetUserId,
    );
    if (!worker) return;

    const count = worker.ratingCount + 1;
    const avg = Number(
      ((worker.ratingAvg * worker.ratingCount + rating) / count).toFixed(2),
    );
    await this.db.update<WorkerProfile>(COLLECTIONS.WORKERS, worker.id, {
      ratingAvg: avg,
      ratingCount: count,
    });
  }

  // ---- 돌봄 완료 횟수 증가 ----
  async incrementCareCount(workerUserId: string) {
    const worker = await this.db.findOne<WorkerProfile>(
      COLLECTIONS.WORKERS,
      (w) => w.userId === workerUserId,
    );
    if (!worker) return;
    await this.db.update<WorkerProfile>(COLLECTIONS.WORKERS, worker.id, {
      careCount: worker.careCount + 1,
    });
  }
}
