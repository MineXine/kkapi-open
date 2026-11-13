import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ISpeakModelName } from 'src/constant/model-name';
import { IspeakMeta, IspeakMetaDocument } from '../schema/ispeakMeta.schema';

type CounterField = 'likeCount' | 'favoriteCount' | 'shareCount' | 'readCount';

@Injectable()
export class IspeakMetaService {
  constructor(
    @InjectModel(ISpeakModelName.ISpeakMeta)
    private readonly metaModel: Model<IspeakMetaDocument>,
  ) {}

  /**
   * 计数字段的初始值。$setOnInsert 与 $inc 不能作用于同一路径，
   * 因此要把本次变更的字段从初始值里剔除，否则 Mongo 会报 field conflict。
   */
  private counterDefaults(except?: CounterField): Record<string, number> {
    const base: Record<string, number> = {
      likeCount: 0,
      favoriteCount: 0,
      shareCount: 0,
      readCount: 0,
    };
    if (except) delete base[except];
    return base;
  }

  /**
   * 确保计数文档存在（不存在则创建全 0 记录）
   */
  async ensure(speakId: string) {
    return this.metaModel
      .findOneAndUpdate(
        { speakId },
        { $setOnInsert: this.counterDefaults() },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .lean()
      .exec();
  }

  /**
   * 读取计数（不写库），不存在时由调用方按 0 处理
   */
  async get(speakId: string) {
    return this.metaModel.findOne({ speakId }).lean().exec();
  }

  /**
   * 原子增减计数；并发安全，且保证结果不会为负
   */
  async inc(speakId: string, field: CounterField, delta: number) {
    const doc = await this.metaModel
      .findOneAndUpdate(
        { speakId },
        { $inc: { [field]: delta }, $setOnInsert: this.counterDefaults(field) },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .lean()
      .exec();

    const current = doc ? (doc as Record<string, any>)[field] : 0;
    if (typeof current === 'number' && current < 0) {
      // 历史脏数据或并发删除可能导致负数，回写 0 兜底
      return this.metaModel
        .findOneAndUpdate({ speakId }, { $set: { [field]: 0 } }, { new: true })
        .lean()
        .exec();
    }
    return doc;
  }

  /**
   * 把可能缺失的计数归一化为数字，供响应组装使用
   */
  pickCount(doc: IspeakMeta | null | undefined, field: CounterField): number {
    if (!doc) return 0;
    const value = (doc as Record<string, any>)[field];
    return typeof value === 'number' && value > 0 ? value : 0;
  }
}
