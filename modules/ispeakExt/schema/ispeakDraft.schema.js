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
exports.IspeakDraftSchema = exports.IspeakDraft = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose = require("mongoose");
const model_name_1 = require("../../../constant/model-name");
let IspeakDraft = class IspeakDraft {
    user;
    title;
    content;
    type;
    tag;
    showComment;
    theme;
    mdc;
};
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose.Schema.Types.ObjectId, ref: model_name_1.UserModelName.User, required: true }),
    __metadata("design:type", mongoose.Schema.Types.ObjectId)
], IspeakDraft.prototype, "user", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: '' }),
    __metadata("design:type", String)
], IspeakDraft.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: '' }),
    __metadata("design:type", String)
], IspeakDraft.prototype, "content", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: '0' }),
    __metadata("design:type", String)
], IspeakDraft.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose.Schema.Types.ObjectId, ref: model_name_1.ISpeakModelName.ISpeakTagList }),
    __metadata("design:type", mongoose.Schema.Types.ObjectId)
], IspeakDraft.prototype, "tag", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: '1' }),
    __metadata("design:type", String)
], IspeakDraft.prototype, "showComment", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: 'default' }),
    __metadata("design:type", String)
], IspeakDraft.prototype, "theme", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose.Schema.Types.Mixed, default: null }),
    __metadata("design:type", Object)
], IspeakDraft.prototype, "mdc", void 0);
IspeakDraft = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], IspeakDraft);
exports.IspeakDraft = IspeakDraft;
exports.IspeakDraftSchema = mongoose_1.SchemaFactory.createForClass(IspeakDraft);
exports.IspeakDraftSchema.index({ user: 1, updatedAt: -1 });
//# sourceMappingURL=ispeakDraft.schema.js.map