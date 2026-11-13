import { Model } from 'mongoose';
import { IspeakLikeDocument } from '../schema/ispeakLike.schema';
import { IspeakMetaService } from './ispeakMeta.service';
export declare class IspeakLikeService {
    private readonly likeModel;
    private readonly metaService;
    constructor(likeModel: Model<IspeakLikeDocument>, metaService: IspeakMetaService);
    toggle(speakId: string, userId: string): Promise<{
        liked: boolean;
        likeCount: number;
    }>;
    isLiked(speakId: string, userId: string): Promise<boolean>;
    listBySpeak(speakId: string, page?: number, limit?: number): Promise<{
        total: any;
        items: any;
    }>;
    listByUser(userId: string, page?: number, limit?: number): Promise<{
        total: any;
        items: any;
    }>;
    private shapeFacet;
}
