// 로컬 JSON 파일 저장소 (개발용 · MONGODB_URI 미설정 시 사용)
// - 컬렉션(=파일) 단위 메모리 캐시 + 변경 시 원자적(tmp→rename) 디스크 반영
// - 내부는 동기 fs를 쓰되, 인터페이스는 비동기(StorageService)에 맞춘다.

import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { StorageService } from './storage.interface';

@Injectable()
export class JsonDbService extends StorageService {
  private readonly dir = process.env.DATA_DIR
    ? path.resolve(process.env.DATA_DIR)
    : path.resolve(process.cwd(), 'data');

  private readonly cache = new Map<string, any[]>();

  constructor() {
    super();
    if (!fs.existsSync(this.dir)) fs.mkdirSync(this.dir, { recursive: true });
  }

  private file(name: string): string {
    return path.join(this.dir, `${name}.json`);
  }

  private load(name: string): any[] {
    const cached = this.cache.get(name);
    if (cached) return cached;
    let data: any[] = [];
    const f = this.file(name);
    if (fs.existsSync(f)) {
      try {
        data = JSON.parse(fs.readFileSync(f, 'utf-8')) || [];
      } catch {
        data = [];
      }
    }
    this.cache.set(name, data);
    return data;
  }

  private persist(name: string): void {
    const f = this.file(name);
    const tmp = `${f}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(this.cache.get(name) ?? [], null, 2), 'utf-8');
    fs.renameSync(tmp, f);
  }

  async all<T = any>(name: string): Promise<T[]> {
    return this.load(name).slice();
  }
  async find<T = any>(name: string, predicate: (item: T) => boolean): Promise<T[]> {
    return this.load(name).filter(predicate);
  }
  async findOne<T = any>(
    name: string,
    predicate: (item: T) => boolean,
  ): Promise<T | undefined> {
    return this.load(name).find(predicate);
  }
  async findById<T = any>(name: string, id: string): Promise<T | undefined> {
    return this.load(name).find((x: any) => x.id === id);
  }
  async insert<T = any>(name: string, item: T): Promise<T> {
    const arr = this.load(name);
    arr.push(item);
    this.persist(name);
    return item;
  }
  async update<T = any>(name: string, id: string, patch: Partial<T>): Promise<T | undefined> {
    const arr = this.load(name);
    const i = arr.findIndex((x: any) => x.id === id);
    if (i < 0) return undefined;
    arr[i] = { ...arr[i], ...patch };
    this.persist(name);
    return arr[i];
  }
  async remove(name: string, id: string): Promise<boolean> {
    const arr = this.load(name);
    const i = arr.findIndex((x: any) => x.id === id);
    if (i < 0) return false;
    arr.splice(i, 1);
    this.persist(name);
    return true;
  }
  async replaceAll<T = any>(name: string, items: T[]): Promise<void> {
    this.cache.set(name, items as any[]);
    this.persist(name);
  }
}
