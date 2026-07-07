// 로컬 JSON 파일 기반 저장소
// - 컬렉션(=파일) 단위로 배열을 메모리에 캐시하고, 변경 시 디스크에 즉시 반영
// - 쓰기는 '임시파일 작성 → rename'으로 원자적 교체 → 파일 깨짐 방지
// - 동기(sync) I/O 사용: 저트래픽 전제에서 동시 쓰기 경합을 원천 차단(가장 단순·안전)
//
// ⚠️ 확장 시: 이 서비스만 SQLite/Prisma 또는 TypeORM 구현으로 교체하면
//    상위 도메인 서비스 코드는 대부분 그대로 재사용 가능하도록 인터페이스를 유지한다.

import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class JsonDbService implements OnModuleInit {
  private readonly dir = process.env.DATA_DIR
    ? path.resolve(process.env.DATA_DIR)
    : path.resolve(process.cwd(), 'data');

  private readonly cache = new Map<string, any[]>();

  onModuleInit(): void {
    if (!fs.existsSync(this.dir)) fs.mkdirSync(this.dir, { recursive: true });
  }

  private file(name: string): string {
    return path.join(this.dir, `${name}.json`);
  }

  // 컬렉션을 메모리에 로드(최초 1회 파일 읽기)
  private load(name: string): any[] {
    const cached = this.cache.get(name);
    if (cached) return cached;

    let data: any[] = [];
    const f = this.file(name);
    if (fs.existsSync(f)) {
      try {
        data = JSON.parse(fs.readFileSync(f, 'utf-8')) || [];
      } catch {
        data = []; // 손상 시 빈 배열로 시작(원자적 쓰기로 재생성)
      }
    }
    this.cache.set(name, data);
    return data;
  }

  // 원자적 저장: tmp 작성 후 rename
  private persist(name: string): void {
    const f = this.file(name);
    const tmp = `${f}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(this.cache.get(name) ?? [], null, 2), 'utf-8');
    fs.renameSync(tmp, f);
  }

  // ---- 조회 ----
  all<T = any>(name: string): T[] {
    return this.load(name).slice();
  }

  find<T = any>(name: string, predicate: (item: T) => boolean): T[] {
    return this.load(name).filter(predicate);
  }

  findOne<T = any>(name: string, predicate: (item: T) => boolean): T | undefined {
    return this.load(name).find(predicate);
  }

  findById<T = any>(name: string, id: string): T | undefined {
    return this.load(name).find((x: any) => x.id === id);
  }

  // ---- 변경 ----
  insert<T = any>(name: string, item: T): T {
    const arr = this.load(name);
    arr.push(item);
    this.persist(name);
    return item;
  }

  update<T = any>(name: string, id: string, patch: Partial<T>): T | undefined {
    const arr = this.load(name);
    const i = arr.findIndex((x: any) => x.id === id);
    if (i < 0) return undefined;
    arr[i] = { ...arr[i], ...patch };
    this.persist(name);
    return arr[i];
  }

  remove(name: string, id: string): boolean {
    const arr = this.load(name);
    const i = arr.findIndex((x: any) => x.id === id);
    if (i < 0) return false;
    arr.splice(i, 1);
    this.persist(name);
    return true;
  }

  // 시드/초기화용: 컬렉션 전체 교체
  replaceAll<T = any>(name: string, items: T[]): void {
    this.cache.set(name, items);
    this.persist(name);
  }
}
