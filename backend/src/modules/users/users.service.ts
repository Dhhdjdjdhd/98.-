import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { JsonDbService } from '../../common/storage/json-db.service';
import {
  COLLECTIONS,
  Role,
  WorkerStatus,
} from '../../common/enums';
import {
  User,
  ParentProfile,
  WorkerProfile,
} from '../../common/models';
import { genId } from '../../common/util/id.util';
import { nowKst } from '../../common/util/kst.util';
import { RegisterParentDto } from './dto/register-parent.dto';
import { RegisterWorkerDto } from './dto/register-worker.dto';

@Injectable()
export class UsersService {
  constructor(private readonly db: JsonDbService) {}

  // ---- 조회 헬퍼 ----
  getUser(userId: string): User {
    const user = this.db.findById<User>(COLLECTIONS.USERS, userId);
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');
    return user;
  }

  // 근무자 프로필 조회 (userId 기준)
  getWorkerByUserId(userId: string): WorkerProfile {
    const worker = this.db.findOne<WorkerProfile>(
      COLLECTIONS.WORKERS,
      (w) => w.userId === userId,
    );
    if (!worker) throw new NotFoundException('근무자 프로필을 찾을 수 없습니다.');
    return worker;
  }

  // 부모 + 프로필 결합 조회
  getParentDetail(userId: string) {
    const user = this.getUser(userId);
    const profile = this.db.findOne<ParentProfile>(
      COLLECTIONS.PARENTS,
      (p) => p.userId === userId,
    );
    return { ...user, profile };
  }

  getWorkerDetail(userId: string) {
    const user = this.getUser(userId);
    const profile = this.getWorkerByUserId(userId);
    return { ...user, profile };
  }

  private assertPhoneUnique(phone: string) {
    const exists = this.db.findOne<User>(COLLECTIONS.USERS, (u) => u.phone === phone);
    if (exists) throw new ConflictException('이미 가입된 휴대폰 번호입니다.');
  }

  // ---- 부모 가입 ----
  registerParent(dto: RegisterParentDto) {
    this.assertPhoneUnique(dto.phone);
    const now = nowKst();

    const user: User = {
      id: genId('usr'),
      role: Role.PARENT,
      phone: dto.phone,
      name: dto.name,
      createdAt: now,
    };
    this.db.insert(COLLECTIONS.USERS, user);

    const profile: ParentProfile = {
      id: genId('par'),
      userId: user.id,
      address: dto.address,
      paymentMethod: '미등록',
      createdAt: now,
    };
    this.db.insert(COLLECTIONS.PARENTS, profile);

    return { ...user, profile };
  }

  // ---- 근무자 가입 (승인 대기 상태) ----
  registerWorker(dto: RegisterWorkerDto) {
    this.assertPhoneUnique(dto.phone);
    const now = nowKst();

    const user: User = {
      id: genId('usr'),
      role: Role.WORKER,
      phone: dto.phone,
      name: dto.name,
      createdAt: now,
    };
    this.db.insert(COLLECTIONS.USERS, user);

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
      createdAt: now,
    };
    this.db.insert(COLLECTIONS.WORKERS, profile);

    return { ...user, profile };
  }

  // ---- 근무자 목록 (관리자용, 상태 필터) ----
  listWorkers(status?: WorkerStatus) {
    const workers = status
      ? this.db.find<WorkerProfile>(COLLECTIONS.WORKERS, (w) => w.status === status)
      : this.db.all<WorkerProfile>(COLLECTIONS.WORKERS);

    // 근무자 이름 등 기본 정보 결합
    return workers.map((w) => {
      const user = this.db.findById<User>(COLLECTIONS.USERS, w.userId);
      return { ...w, name: user?.name, phone: user?.phone };
    });
  }

  // ---- 매칭용: 특정 등급의 승인된 근무자 조회 ----
  findApprovedWorkersByGrade(grade: string): WorkerProfile[] {
    return this.db.find<WorkerProfile>(
      COLLECTIONS.WORKERS,
      (w) => w.status === WorkerStatus.APPROVED && w.grade === grade,
    );
  }

  // ---- 평점 반영 (리뷰 등록 시 호출) ----
  applyRating(targetUserId: string, rating: number) {
    const worker = this.db.findOne<WorkerProfile>(
      COLLECTIONS.WORKERS,
      (w) => w.userId === targetUserId,
    );
    if (!worker) return; // 부모 대상 평가는 별도 집계 없음(프로토타입)

    const count = worker.ratingCount + 1;
    const avg = Number(
      ((worker.ratingAvg * worker.ratingCount + rating) / count).toFixed(2),
    );
    this.db.update<WorkerProfile>(COLLECTIONS.WORKERS, worker.id, {
      ratingAvg: avg,
      ratingCount: count,
    });
  }

  // ---- 돌봄 완료 횟수 증가 ----
  incrementCareCount(workerUserId: string) {
    const worker = this.db.findOne<WorkerProfile>(
      COLLECTIONS.WORKERS,
      (w) => w.userId === workerUserId,
    );
    if (!worker) return;
    this.db.update<WorkerProfile>(COLLECTIONS.WORKERS, worker.id, {
      careCount: worker.careCount + 1,
    });
  }
}
