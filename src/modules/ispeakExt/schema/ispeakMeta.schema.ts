import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ISpeakModelName } from 'src/constant/model-name';

export type IspeakMetaDocument = IspeakMeta & mongoose.Document;

/**
 * 说说附属计数表（与 kkapi_ispeak_list 一对一）
 *
 * 为什么单独建表而不放在 Ispeak 文档里：
 * PATCH /ispeak/update 是「body 全字段透传」的实现，任何加到 Ispeak schema 上的字段
 * 都会被作者直接改写。计数属于系统托管数据，必须隔离到独立集合。
 */
@Schema({ timestamps: true })
export class IspeakMeta {
  /**
   * 关联的说说 id
   */
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: ISpeakModelName.ISpeakList, required: true })
  speakId: mongoose.Schema.Types.ObjectId;

  /**
   * 点赞数
   */
  @Prop({ type: Number, default: 0 })
  likeCount: number;

  /**
   * 收藏数
   */
  @Prop({ type: Number, default: 0 })
  favoriteCount: number;

  /**
   * 分享数
   */
  @Prop({ type: Number, default: 0 })
  shareCount: number;

  /**
   * 阅读数（详情页访问次数，作者本人访问不计入）
   */
  @Prop({ type: Number, default: 0 })
  readCount: number;
}

export const IspeakMetaSchema = SchemaFactory.createForClass(IspeakMeta);

// 一个说说只有一条计数记录
IspeakMetaSchema.index({ speakId: 1 }, { unique: true });
