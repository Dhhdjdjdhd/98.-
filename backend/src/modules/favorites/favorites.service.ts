import { Injectable, NotFoundException } from '@nestjs/common';
import { StorageService } from '../../common/storage/storage.interface';
import { COLLECTIONS } from '../../common/enums';
import { ParentProfile, User, WorkerProfile } from '../../common/models';

@Injectable()
export class FavoritesService {
  constructor(private readonly db: StorageService) {}

  private async getParent(userId: string): Promise<ParentProfile> {
    const p = await this.db.findOne<ParentProfile>(
      COLLECTIONS.PARENTS,
      (x) => x.userId === userId,
    );
    if (!p) throw new NotFoundException('부모 프로필을 찾을 수 없습니다.');
    return p;
  }

  async add(parentUserId: string, workerId: string) {
    const p = await this.getParent(parentUserId);
    const set = new Set(p.favorites || []);
    set.add(workerId);
    await this.db.update<ParentProfile>(COLLECTIONS.PARENTS, p.id, {
      favorites: [...set],
    });
    return { favorites: [...set] };
  }

  async remove(parentUserId: string, workerId: string) {
    const p = await this.getParent(parentUserId);
    const favorites = (p.favorites || []).filter((id) => id !== workerId);
    await this.db.update<ParentProfile>(COLLECTIONS.PARENTS, p.id, { favorites });
    return { favorites };
  }

  // 즐겨찾기한 근무자들의 표시용 정보
  async list(parentUserId: string) {
    const p = await this.getParent(parentUserId);
    const ids = p.favorites || [];
    return Promise.all(
      ids.map(async (id) => {
        const user = await this.db.findById<User>(COLLECTIONS.USERS, id);
        const worker = await this.db.findOne<WorkerProfile>(
          COLLECTIONS.WORKERS,
          (w) => w.userId === id,
        );
        return {
          userId: id,
          name: user?.name,
          licenseType: worker?.licenseType,
          grade: worker?.grade,
          ratingAvg: worker?.ratingAvg,
          careerNote: worker?.careerNote,
        };
      }),
    );
  }
}
