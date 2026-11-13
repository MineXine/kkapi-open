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
Object.defineProperty(exports, "__esModule", { value: true });
exports.IspeakFavoriteSchema = exports.IspeakFavorite = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose = require("mongoose");
const model_name_1 = require("../../../constant/model-name");
let IspeakFavorite = class IspeakFavorite {
    speakId;
    userId;
};
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose.Schema.Types.ObjectId, ref: model_name_1.ISpeakModelName.ISpeakList, required: true }),
    __metadata("design:type", mongoose.Schema.Types.ObjectId)
], IspeakFavorite.prototype, "speakId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose.Schema.Types.ObjectId, ref: model_name_1.UserModelName.User, required: true }),
    __metadata("design:type", mongoose.Schema.Types.ObjectId)
], IspeakFavorite.prototype, "userId", void 0);
IspeakFavorite = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], IspeakFavorite);
exports.IspeakFavorite = IspeakFavorite;
exports.IspeakFavoriteSchema = mongoose_1.SchemaFactory.createForClass(IspeakFavorite);
exports.IspeakFavoriteSchema.index({ speakId: 1, userId: 1 }, { unique: true });
exports.IspeakFavoriteSchema.index({ userId: 1, createdAt: -1 });
//# sourceMappingURL=ispeakFavorite.schema.js.map