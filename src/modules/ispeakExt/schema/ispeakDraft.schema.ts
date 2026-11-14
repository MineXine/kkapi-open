import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ISpeakModelName, UserModelName } from 'src/constant/model-name';

export type IspeakDraftDocument = IspeakDraft & mongoose.Document;

/**
 * 说说草稿
 *
 * 独立于 kkapi_ispeak_list：
 * 草稿不参与可见性规则、不进列表、不该被公开接口读到，
 * 混在正式表里会给既有查询增加一个必须永远记得加的过滤条件。
 */
@Schema({ timestamps: true })
export class IspeakDraft {
  /**
   * 归属用户
   */
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: UserModelName.User, required: true })
  user: mongoose.Schema.Types.ObjectId;

  @Prop({ type: String, default: '' })
  title: string;

  /**
   * 允许为空：新建后立刻自动保存时正文可能还是空的
   */
  @Prop({ type: String, default: '' })
  content: string;

  @Prop({ type: String, default: '0' })
  type: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: ISpeakModelName.ISpeakTagList })
  tag: mongoose.Schema.Types.ObjectId;

  @Prop({ type: String, default: '1' })
  showComment: string;

  @Prop({ type: String, default: 'default' })
  theme: string;

  @Prop({ type: mongoose.Schema.Types.Mixed, default: null })
  mdc: any;
}

export const IspeakDraftSchema = SchemaFactory.createForClass(IspeakDraft);

// 草稿箱按更新时间倒序
IspeakDraftSchema.index({ user: 1, updatedAt: -1 });
