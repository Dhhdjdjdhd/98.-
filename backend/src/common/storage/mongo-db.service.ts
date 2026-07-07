// MongoDB Atlas 저장소 (배포용 · MONGODB_URI 설정 시 사용)
// - 도메인 서비스의 JS 술어(predicate) 인터페이스를 그대로 지원하기 위해,
//   조회 시 컬렉션을 읽어 메모리에서 필터링한다(프로토타입 규모 전제).
// - 문서의 Mongo 내부 _id는 응답에서 제외해 JSON 저장소와 형태를 맞춘다.

import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { MongoClient, Db, Collection } from 'mongodb';
import { StorageService } from './storage.interface';

@Injectable()
export class MongoDbService
  extends StorageService
  implements OnModuleInit, OnModuleDestroy
{
  private client: MongoClient;
  private db: Db;
  private readonly logger = new Logger('MongoDbService');

  async onModuleInit(): Promise<void> {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI 환경변수가 설정되지 않았습니다.');
    this.client = new MongoClient(uri);
    await this.client.connect();
    this.db = this.client.db(process.env.MONGODB_DB || 'momcare');
    this.logger.log('MongoDB 연결 완료');
  }

  async onModuleDestroy(): Promise<void> {
    await this.client?.close();
  }

  private col(name: string): Collection {
    return this.db.collection(name);
  }

  // Mongo 내부 _id 제거 (JSON 저장소와 동일한 반환 형태 유지)
  private strip<T = any>(doc: any): T | undefined {
    if (!doc) return undefined;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...rest } = doc;
    return rest as T;
  }

  async all<T = any>(name: string): Promise<T[]> {
    return (await this.col(name)
      .find({}, { projection: { _id: 0 } })
      .toArray()) as T[];
  }
  async find<T = any>(name: string, predicate: (item: T) => boolean): Promise<T[]> {
    return (await this.all<T>(name)).filter(predicate);
  }
  async findOne<T = any>(
    name: string,
    predicate: (item: T) => boolean,
  ): Promise<T | undefined> {
    return (await this.all<T>(name)).find(predicate);
  }
  async findById<T = any>(name: string, id: string): Promise<T | undefined> {
    return this.strip<T>(await this.col(name).findOne({ id }, { projection: { _id: 0 } }));
  }
  async insert<T = any>(name: string, item: T): Promise<T> {
    // 스프레드 복사본을 넣어 호출자 객체에 _id가 붙지 않게 한다.
    await this.col(name).insertOne({ ...(item as any) });
    return item;
  }
  async update<T = any>(name: string, id: string, patch: Partial<T>): Promise<T | undefined> {
    const r: any = await this.col(name).findOneAndUpdate(
      { id },
      { $set: patch as any },
      { returnDocument: 'after', projection: { _id: 0 } },
    );
    // 드라이버 버전에 따라 문서 또는 { value } 형태 → 모두 처리
    return (r && 'value' in r ? r.value : r) as T | undefined;
  }
  async remove(name: string, id: string): Promise<boolean> {
    const r = await this.col(name).deleteOne({ id });
    return r.deletedCount > 0;
  }
  async replaceAll<T = any>(name: string, items: T[]): Promise<void> {
    await this.col(name).deleteMany({});
    if (items.length) {
      await this.col(name).insertMany(items.map((i) => ({ ...(i as any) })));
    }
  }
}
