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
exports.IspeakDraftService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const mongoose_3 = require("mongoose");
const model_name_1 = require("../../../constant/model-name");
let IspeakDraftService = class IspeakDraftService {
    draftModel;
    constructor(draftModel) {
        this.draftModel = draftModel;
    }
    async save(userId, draftId, payload) {
        if (draftId) {
            if (!(0, mongoose_2.isValidObjectId)(draftId))
                return null;
            return this.draftModel
                .findOneAndUpdate({ _id: draftId, user: userId }, { $set: payload }, { new: true })
                .lean()
                .exec();
        }
        return this.draftModel.create({ ...payload, user: userId });
    }
    async list(userId, page = 1, limit = 20) {
        const filter = { user: userId };
        const [total, items] = await Promise.all([
            this.draftModel.countDocuments(filter).exec(),
            this.draftModel
                .find(filter)
                .sort({ updatedAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean()
                .exec(),
        ]);
        return { total, items };
    }
    async findOne(userId, draftId) {
        if (!(0, mongoose_2.isValidObjectId)(draftId))
            return null;
        return this.draftModel.findOne({ _id: draftId, user: userId }).lean().exec();
    }
    async remove(userId, draftId) {
        if (!(0, mongoose_2.isValidObjectId)(draftId))
            return null;
        return this.draftModel.findOneAndDelete({ _id: draftId, user: userId }).exec();
    }
    async countByUser(userId) {
        return this.draftModel.countDocuments({ user: userId }).exec();
    }
};
IspeakDraftService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(model_name_1.ISpeakModelName.ISpeakDraft)),
    __metadata("design:paramtypes", [mongoose_3.Model])
], IspeakDraftService);
exports.IspeakDraftService = IspeakDraftService;
//# sourceMappingURL=ispeakDraft.service.js.map