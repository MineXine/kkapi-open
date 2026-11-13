import * as mongoose from 'mongoose';
export declare type IspeakFavoriteDocument = IspeakFavorite & mongoose.Document;
export declare class IspeakFavorite {
    speakId: mongoose.Schema.Types.ObjectId;
    userId: mongoose.Schema.Types.ObjectId;
}
export declare const IspeakFavoriteSchema: mongoose.Schema<mongoose.Document<IspeakFavorite, any, any>, mongoose.Model<mongoose.Document<IspeakFavorite, any, any>, any, any, any>, any, any>;
