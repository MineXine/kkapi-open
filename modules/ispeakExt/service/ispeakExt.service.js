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
exports.IspeakExtService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const mongoose = require("mongoose");
const mongoose_3 = require("mongoose");
const ua_1 = require("../../../common/ua");
const model_name_1 = require("../../../constant/model-name");
const ispeakFavorite_service_1 = require("./ispeakFavorite.service");
const ispeakLike_service_1 = require("./ispeakLike.service");
const ispeakMeta_service_1 = require("./ispeakMeta.service");
let IspeakExtService = class IspeakExtService {
    connection;
    metaService;
    likeService;
    favoriteService;
    constructor(connection, metaService, likeService, favoriteService) {
        this.connection = connection;
        this.metaService = metaService;
        this.likeService = likeService;
        this.favoriteService = favoriteService;
    }
    get ispeakModel() {
        return this.connection.model(model_name_1.ISpeakModelName.ISpeakList);
    }
    async createOne(payload) {
        return this.ispeakModel.create(payload);
    }
    async findRaw(speakId) {
        if (!(0, mongoose_2.isValidObjectId)(speakId))
            return null;
        return this.ispeakModel.findOne({ _id: speakId }).lean().exec();
    }
    checkVisible(raw, viewerId) {
        if (!raw)
            return '内容不存在';
        const isAuthor = !!viewerId && String(raw.author) === String(viewerId);
        if (raw.archivedAt && !isAuthor)
            return '内容不存在';
        if (raw.type === '2' && !isAuthor)
            return '该内容仅作者可见';
        if (raw.type === '1' && !viewerId)
            return '该内容需登录后查看';
        return null;
    }
    async getDetail(speakId, viewerId) {
        if (!(0, mongoose_2.isValidObjectId)(speakId))
            return { error: 'id不合法' };
        const rows = await this.ispeakModel
            .aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(speakId) } },
            {
                $lookup: {
                    from: model_name_1.ISpeakModelName.ISpeakTagList,
                    localField: 'tag',
                    foreignField: '_id',
                    as: 'tag',
                },
            },
            {
                $lookup: {
                    from: model_name_1.UserModelName.User,
                    localField: 'author',
                    foreignField: '_id',
                    as: 'author',
                },
            },
            {
                $project: {
                    title: 1,
                    content: 1,
                    type: 1,
                    showComment: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    tag: 1,
                    author: 1,
                    archivedAt: { $ifNull: ['$archivedAt', null] },
                    theme: { $ifNull: ['$theme', 'default'] },
                    mdc: { $ifNull: ['$mdc', null] },
                    client: { $ifNull: ['$client', null] },
                    location: { $ifNull: ['$location', null] },
                    mediaIds: { $ifNull: ['$mediaIds', []] },
                },
            },
        ])
            .exec();
        const doc = rows && rows[0];
        if (!doc)
            return { error: '内容不存在' };
        const author = Array.isArray(doc.author) ? doc.author[0] : doc.author;
        const tag = Array.isArray(doc.tag) ? doc.tag[0] : doc.tag;
        const isAuthor = !!viewerId && !!author && String(author._id) === String(viewerId);
        const invisible = this.checkVisible({ ...doc, author: author ? author._id : null }, viewerId);
        if (invisible)
            return { error: invisible };
        let meta = await this.metaService.get(speakId);
        if (!isAuthor) {
            try {
                meta = (await this.metaService.inc(speakId, 'readCount', 1));
            }
            catch (error) {
            }
        }
        const [liked, favorited] = await Promise.all([
            this.likeService.isLiked(speakId, viewerId),
            this.favoriteService.isFavorited(speakId, viewerId),
        ]);
        const data = {
            _id: doc._id,
            title: doc.title || '',
            content: doc.content,
            theme: doc.theme,
            type: doc.type,
            showComment: doc.showComment,
            author: author
                ? {
                    _id: author._id,
                    userName: author.userName,
                    nickName: author.nickName,
                    avatar: author.avatar,
                    link: author.link,
                }
                : null,
            tag: tag
                ? {
                    _id: tag._id,
                    name: tag.name,
                    bgColor: tag.bgColor,
                    description: tag.description,
                }
                : null,
            media: [],
            mediaIds: doc.mediaIds || [],
            mdc: doc.mdc || null,
            location: doc.location || null,
            client: isAuthor ? doc.client || null : (0, ua_1.toPublicClientInfo)(doc.client),
            counts: {
                like: this.metaService.pickCount(meta, 'likeCount'),
                favorite: this.metaService.pickCount(meta, 'favoriteCount'),
                share: this.metaService.pickCount(meta, 'shareCount'),
                read: this.metaService.pickCount(meta, 'readCount'),
            },
            liked,
            favorited,
            archivedAt: doc.archivedAt || null,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        };
        return { data, isAuthor };
    }
};
IspeakExtService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectConnection)()),
    __metadata("design:paramtypes", [mongoose_3.Connection,
        ispeakMeta_service_1.IspeakMetaService,
        ispeakLike_service_1.IspeakLikeService,
        ispeakFavorite_service_1.IspeakFavoriteService])
], IspeakExtService);
exports.IspeakExtService = IspeakExtService;
//# sourceMappingURL=ispeakExt.service.js.map