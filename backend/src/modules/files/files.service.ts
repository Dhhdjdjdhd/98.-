import { Injectable, NotFoundException } from '@nestjs/common';
import { StorageService } from '../../common/storage/storage.interface';
import { COLLECTIONS, Role } from '../../common/enums';
import { FileDoc, WorkerProfile } from '../../common/models';
import { genId } from '../../common/util/id.util';
import { nowKst } from '../../common/util/kst.util';
import { UploadFileDto } from './dto/upload-file.dto';

@Injectable()
export class FilesService {
  constructor(private readonly db: StorageService) {}

  // 파일 업로드 + (근무자면) 프로필 서류에 자동 연결
  async upload(ownerId: string, role: string, dto: UploadFileDto) {
    const file: FileDoc = {
      id: genId('file'),
      ownerId,
      kind: dto.kind,
      mimeType: dto.mimeType || 'image/jpeg',
      dataUrl: dto.dataUrl,
      createdAt: nowKst(),
    };
    await this.db.insert(COLLECTIONS.FILES, file);

    if (role === Role.WORKER) {
      const worker = await this.db.findOne<WorkerProfile>(
        COLLECTIONS.WORKERS,
        (w) => w.userId === ownerId,
      );
      if (worker) {
        await this.db.update<WorkerProfile>(COLLECTIONS.WORKERS, worker.id, {
          docs: { ...worker.docs, [dto.kind]: true } as WorkerProfile['docs'],
          docFiles: { ...(worker.docFiles || {}), [dto.kind]: file.id },
        });
      }
    }

    return { id: file.id, kind: file.kind };
  }

  async get(id: string): Promise<FileDoc> {
    const file = await this.db.findById<FileDoc>(COLLECTIONS.FILES, id);
    if (!file) throw new NotFoundException('파일을 찾을 수 없습니다.');
    return file;
  }
}
