import { Injectable, NotFoundException } from '@nestjs/common';
import { StorageService } from '../../common/storage/storage.interface';
import { COLLECTIONS, WorkerStatus, Grade } from '../../common/enums';
import { WorkerProfile } from '../../common/models';

@Injectable()
export class AdminService {
  constructor(private readonly db: StorageService) {}

  private async getWorker(userId: string): Promise<WorkerProfile> {
    const worker = await this.db.findOne<WorkerProfile>(
      COLLECTIONS.WORKERS,
      (w) => w.userId === userId,
    );
    if (!worker) throw new NotFoundException('근무자 프로필을 찾을 수 없습니다.');
    return worker;
  }

  // 자격 검수: 서류 확인 결과 반영 + 등급 조정(선택)
  async reviewDocs(userId: string, docs: Partial<WorkerProfile['docs']>, grade?: Grade) {
    const worker = await this.getWorker(userId);
    return this.db.update<WorkerProfile>(COLLECTIONS.WORKERS, worker.id, {
      docs: { ...worker.docs, ...docs },
      ...(grade ? { grade } : {}),
    });
  }

  // 승인 → 활동 가능
  async approve(userId: string) {
    const worker = await this.getWorker(userId);
    return this.db.update<WorkerProfile>(COLLECTIONS.WORKERS, worker.id, {
      status: WorkerStatus.APPROVED,
      rejectReason: undefined,
    });
  }

  // 반려
  async reject(userId: string, reason: string) {
    const worker = await this.getWorker(userId);
    return this.db.update<WorkerProfile>(COLLECTIONS.WORKERS, worker.id, {
      status: WorkerStatus.REJECTED,
      rejectReason: reason,
    });
  }

  // 관리자 대시보드 요약
  async summary() {
    const workers = await this.db.all<WorkerProfile>(COLLECTIONS.WORKERS);
    const bookings = await this.db.all(COLLECTIONS.BOOKINGS);
    return {
      pending: workers.filter((w) => w.status === WorkerStatus.PENDING).length,
      approved: workers.filter((w) => w.status === WorkerStatus.APPROVED).length,
      rejected: workers.filter((w) => w.status === WorkerStatus.REJECTED).length,
      totalBookings: bookings.length,
    };
  }
}
