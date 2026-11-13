import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ISpeakModelName, UserModelName } from 'src/constant/model-name';

export type IspeakLikeDocument = IspeakLike & mongoose.Document;

/**
 * 说说点赞关系表
 *
 * 去重完全依赖 { speakId, userId } 唯一索引：
 * serverless 多实例 / pm2 cluster 下不存在可靠的进程内状态，不能靠内存判重。
 */
@Schema({ timestamps: true })
export class IspeakLike {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: ISpeakModelName.ISpeakList, required: true })
  speakId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: UserModelName.User, required: true })
  userId: mongoose.Schema.Types.ObjectId;
}

export const IspeakLikeSchema = SchemaFactory.createForClass(IspeakLike);

// 同一用户对同一说说只能有一条点赞记录
IspeakLikeSchema.index({ speakId: 1, userId: 1 }, { unique: true });
// 「我赞过的」按时间倒序分页
IspeakLikeSchema.index({ userId: 1, createdAt: -1 });
