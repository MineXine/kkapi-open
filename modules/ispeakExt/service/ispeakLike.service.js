"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IspeakLikeService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose = require("mongoose");
const mongoose_2 = require("mongoose");
const model_name_1 = require("../../../constant/model-name");
const ispeakMeta_service_1 = require("./ispeakMeta.service");
let IspeakLikeService = class IspeakLikeService {
    likeModel;
    metaService;
    constructor(likeModel, metaService) {
        this.likeModel = likeModel;
        this.metaService = metaService;
    }
    async toggle(speakId, userId) {
        const removed = await this.likeModel.findOneAndDelete({ speakId, userId }).lean().exec();
        if (removed) {
            const meta = await this.metaService.inc(speakId, 'likeCount', -1);
            return {
                liked: false,
                likeCount: this.metaService.pickCount(meta, 'likeCount'),
            };
        }
        let created = false;
        try {
            await this.likeModel.create({ speakId, userId });
            created = true;
        }
        catch (error) {
            if (error?.code !== 11000)
                throw error;
        }
        if (!created) {
            const current = await this.metaService.get(speakId);
            return {
                liked: true,
                likeCount: this.metaService.pickCount(current, 'likeCount'),
            };
        }
        const meta = await this.metaService.inc(speakId, 'likeCount', 1);
        return {
            liked: true,
            likeCount: this.metaService.pickCount(meta, 'likeCount'),
        };
    }
    async isLiked(speakId, userId) {
        if (!userId)
            return false;
        const doc = await this.likeModel.findOne({ speakId, userId }).lean().exec();
        return !!doc;
    }
    async listBySpeak(speakId, page = 1, limit = 20) {
        const result = await this.likeModel
            .aggregate([
            { $match: { speakId: new mongoose.Types.ObjectId(speakId) } },
            { $sort: { createdAt: -1 } },
            {
                $facet: {
                    total: [{ $count: 'total' }],
                    items: [
                        { $skip: (page - 1) * limit },
                        { $limit: limit },
                        {
                            $lookup: {
                                from: model_name_1.UserModelName.User,
                                localField: 'userId',
                                foreignField: '_id',
                                as: 'user',
                            },
                        },
                        {
                            $project: {
                                _id: 1,
                                userId: 1,
                                createdAt: 1,
                                nickName: { $arrayElemAt: ['$user.nickName', 0] },
                                avatar: { $arrayElemAt: ['$user.avatar', 0] },
                                link: { $arrayElemAt: ['$user.link', 0] },
                            },
                        },
                    ],
                },
            },
        ])
            .exec();
        return this.shapeFacet(result);
    }
    async listByUser(userId, page = 1, limit = 10) {
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const result = await this.likeModel
            .aggregate([
            { $match: { userId: userObjectId } },
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: model_name_1.ISpeakModelName.ISpeakList,
                    localField: 'speakId',
                    foreignField: '_id',
                    as: 'speak',
                },
            },
            { $unwind: '$speak' },
            {
                $match: {
                    'speak.archivedAt': null,
                    $or: [
                        { 'speak.type': { $in: ['0', '1'] } },
                        { 'speak.type': '2', 'speak.author': userObjectId },
                    ],
                },
            },
            {
                $facet: {
                    total: [{ $count: 'total' }],
                    items: [
                        { $skip: (page - 1) * limit },
                        { $limit: limit },
                        {
                            $lookup: {
                                from: model_name_1.ISpeakModelName.ISpeakTagList,
                                localField: 'speak.tag',
                                foreignField: '_id',
                                as: 'tag',
                            },
                        },
                        {
                            $project: {
                                _id: 0,
                                speakId: '$speak._id',
                                title: '$speak.title',
                                content: '$speak.content',
                                type: '$speak.type',
                                createdAt: '$speak.createdAt',
                                likedAt: '$createdAt',
                                tag: { $arrayElemAt: ['$tag', 0] },
                            },
                        },
                    ],
                },
            },
        ])
            .exec();
        return this.shapeFacet(result);
    }
    shapeFacet(result) {
        const faced = result && result[0] ? result[0] : null;
        const total = faced && faced.total && faced.total[0] ? faced.total[0].total : 0;
        return { total, items: faced ? faced.items : [] };
    }
};
IspeakLikeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(model_name_1.ISpeakModelName.ISpeakLike)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        ispeakMeta_service_1.IspeakMetaService])
], IspeakLikeService);
exports.IspeakLikeService = IspeakLikeService;
//# sourceMappingURL=ispeakLike.service.js.map