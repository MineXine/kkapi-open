import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ISpeakModelName } from 'src/constant/model-name';
import { IspeakModule } from '../ispeak/ispeak.module';
import { IspeakExtController } from './controller/ispeakExt.controller';
import { IspeakFavoriteController } from './controller/ispeakFavorite.controller';
import { IspeakLikeController } from './controller/ispeakLike.controller';
import { IspeakFavoriteSchema } from './schema/ispeakFavorite.schema';
import { IspeakLikeSchema } from './schema/ispeakLike.schema';
import { IspeakMetaSchema } from './schema/ispeakMeta.schema';
import { IspeakExtService } from './service/ispeakExt.service';
import { IspeakFavoriteService } from './service/ispeakFavorite.service';
import { IspeakLikeService } from './service/ispeakLike.service';
import { IspeakMetaService } from './service/ispeakMeta.service';

/**
 * 说说扩展模块
 *
 * 设计约束（详见 ispeak-功能扩展API设计.md）：
 * 1. 只 import IspeakModule 复用其 Service 与已注册的 model，不重复 forFeature ISpeakList
 *    （同名 model 二次注册会编译出另一个 Model 实例并覆盖 connection.models）；
 * 2. 新集合独立建表，计数不落到 Ispeak 文档上（防止经 PATCH /update 被作者篡改）；
 * 3. 所有路由 ≥2 段，避免与既有 /ispeak/:id 之类的通配参数路由竞争。
 */
@Module({
  imports: [
    IspeakModule,
    MongooseModule.forFeature([
      {
        name: ISpeakModelName.ISpeakMeta,
        schema: IspeakMetaSchema,
        collection: ISpeakModelName.ISpeakMeta,
      },
      {
        name: ISpeakModelName.ISpeakLike,
        schema: IspeakLikeSchema,
        collection: ISpeakModelName.ISpeakLike,
      },
      {
        name: ISpeakModelName.ISpeakFavorite,
        schema: IspeakFavoriteSchema,
        collection: ISpeakModelName.ISpeakFavorite,
      },
    ]),
  ],
  controllers: [IspeakExtController, IspeakLikeController, IspeakFavoriteController],
  providers: [IspeakExtService, IspeakMetaService, IspeakLikeService, IspeakFavoriteService],
  exports: [IspeakExtService, IspeakMetaService, IspeakLikeService, IspeakFavoriteService],
})
export class IspeakExtModule {}
