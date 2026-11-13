/// <reference types="mongoose/types/PipelineStage" />
/// <reference types="mongoose/types/Error" />
import { Model } from 'mongoose';
import { IspeakMeta, IspeakMetaDocument } from '../schema/ispeakMeta.schema';
declare type CounterField = 'likeCount' | 'favoriteCount' | 'shareCount' | 'readCount';
export declare class IspeakMetaService {
    private readonly metaModel;
    constructor(metaModel: Model<IspeakMetaDocument>);
    private counterDefaults;
    ensure(speakId: string): Promise<import("mongoose").LeanDocument<IspeakMeta & import("mongoose").Document<any, any, any> & {
        _id: any;
    }>>;
    get(speakId: string): Promise<import("mongoose").LeanDocument<IspeakMeta & import("mongoose").Document<any, any, any> & {
        _id: any;
    }>>;
    inc(speakId: string, field: CounterField, delta: number): Promise<import("mongoose").LeanDocument<IspeakMeta & import("mongoose").Document<any, any, any> & {
        _id: any;
    }>>;
    pickCount(doc: IspeakMeta | null | undefined, field: CounterField): number;
}
export {};
