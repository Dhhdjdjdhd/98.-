// 저장소 공통 인터페이스 (비동기)
// JsonDbService(로컬 파일)와 MongoDbService(클라우드)가 동일하게 구현한다.
// 도메인 서비스는 이 추상 타입에만 의존 → 저장 방식 교체 시 도메인 코드 불변.

export abstract class StorageService {
  abstract all<T = any>(name: string): Promise<T[]>;
  abstract find<T = any>(name: string, predicate: (item: T) => boolean): Promise<T[]>;
  abstract findOne<T = any>(
    name: string,
    predicate: (item: T) => boolean,
  ): Promise<T | undefined>;
  abstract findById<T = any>(name: string, id: string): Promise<T | undefined>;
  abstract insert<T = any>(name: string, item: T): Promise<T>;
  abstract update<T = any>(
    name: string,
    id: string,
    patch: Partial<T>,
  ): Promise<T | undefined>;
  abstract remove(name: string, id: string): Promise<boolean>;
  abstract replaceAll<T = any>(name: string, items: T[]): Promise<void>;
}
