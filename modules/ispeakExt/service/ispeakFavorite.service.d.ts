import { Model } from 'mongoose';
import { IspeakFavoriteDocument } from '../schema/ispeakFavorite.schema';
import { IspeakMetaService } from './ispeakMeta.service';
export declare class IspeakFavoriteService {
    private readonly favoriteModel;
    private readonly metaService;
    constructor(favoriteModel: Model<IspeakFavoriteDocument>, metaService: IspeakMetaService);
    toggle(speakId: string, userId: string): Promise<{
        favorited: boolean;
        favoriteCount: number;
    }>;
    isFavorited(speakId: string, userId: string): Promise<boolean>;
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
