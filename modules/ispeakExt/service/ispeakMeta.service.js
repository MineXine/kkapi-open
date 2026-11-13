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
exports.IspeakMetaService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const model_name_1 = require("../../../constant/model-name");
let IspeakMetaService = class IspeakMetaService {
    metaModel;
    constructor(metaModel) {
        this.metaModel = metaModel;
    }
    counterDefaults(except) {
        const base = {
            likeCount: 0,
            favoriteCount: 0,
            shareCount: 0,
            readCount: 0,
        };
        if (except)
            delete base[except];
        return base;
    }
    async ensure(speakId) {
        return this.metaModel
            .findOneAndUpdate({ speakId }, { $setOnInsert: this.counterDefaults() }, { upsert: true, new: true, setDefaultsOnInsert: true })
            .lean()
            .exec();
    }
    async get(speakId) {
        return this.metaModel.findOne({ speakId }).lean().exec();
    }
    async inc(speakId, field, delta) {
        const doc = await this.metaModel
            .findOneAndUpdate({ speakId }, { $inc: { [field]: delta }, $setOnInsert: this.counterDefaults(field) }, { upsert: true, new: true, setDefaultsOnInsert: true })
            .lean()
            .exec();
        const current = doc ? doc[field] : 0;
        if (typeof current === 'number' && current < 0) {
            return this.metaModel
                .findOneAndUpdate({ speakId }, { $set: { [field]: 0 } }, { new: true })
                .lean()
                .exec();
        }
        return doc;
    }
    pickCount(doc, field) {
        if (!doc)
            return 0;
        const value = doc[field];
        return typeof value === 'number' && value > 0 ? value : 0;
    }
};
IspeakMetaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(model_name_1.ISpeakModelName.ISpeakMeta)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], IspeakMetaService);
exports.IspeakMetaService = IspeakMetaService;
//# sourceMappingURL=ispeakMeta.service.js.map