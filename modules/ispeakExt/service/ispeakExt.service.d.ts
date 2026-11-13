import * as mongoose from 'mongoose';
import { Connection } from 'mongoose';
import { IspeakDocument } from '../../ispeak/schema/ispeak.schema';
import { IspeakFavoriteService } from './ispeakFavorite.service';
import { IspeakLikeService } from './ispeakLike.service';
import { IspeakMetaService } from './ispeakMeta.service';
export interface DetailResult {
    error?: string;
    data?: any;
    isAuthor?: boolean;
}
export declare class IspeakExtService {
    private readonly connection;
    private readonly metaService;
    private readonly likeService;
    private readonly favoriteService;
    constructor(connection: Connection, metaService: IspeakMetaService, likeService: IspeakLikeService, favoriteService: IspeakFavoriteService);
    private get ispeakModel();
    createOne(payload: Record<string, any>): Promise<mongoose.Document<unknown, any, IspeakDocument> & import("../../ispeak/schema/ispeak.schema").Ispeak & Document & {
        _id: mongoose.Types.ObjectId;
    }>;
    findRaw(speakId: string): Promise<import("../../ispeak/schema/ispeak.schema").Ispeak & Document & {
        _id: mongoose.Types.ObjectId;
    }>;
    checkVisible(raw: any, viewerId?: string): string | null;
    getDetail(speakId: string, viewerId?: string): Promise<DetailResult>;
}
