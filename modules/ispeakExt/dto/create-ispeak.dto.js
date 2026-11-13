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
exports.CreateIspeakDto = void 0;
const class_validator_1 = require("class-validator");
class CreateIspeakDto {
    content;
    title;
    tag;
    visibility;
    showComment;
    theme;
    mdc;
    mediaIds;
    location;
    client;
}
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: '内容为必填项目哦！' }),
    (0, class_validator_1.IsString)({ message: '内容格式不正确' }),
    __metadata("design:type", String)
], CreateIspeakDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '标题格式不正确' }),
    __metadata("design:type", String)
], CreateIspeakDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: '标签为必填项目' }),
    (0, class_validator_1.IsString)({ message: '请传入标签的id' }),
    __metadata("design:type", String)
], CreateIspeakDto.prototype, "tag", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['public', 'private'], { message: '可见性取值不合法' }),
    __metadata("design:type", String)
], CreateIspeakDto.prototype, "visibility", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['0', '1'], { message: '评论开关取值不合法' }),
    __metadata("design:type", String)
], CreateIspeakDto.prototype, "showComment", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '主题标识格式不正确' }),
    __metadata("design:type", String)
], CreateIspeakDto.prototype, "theme", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)({ message: 'mdc 必须是对象' }),
    __metadata("design:type", Object)
], CreateIspeakDto.prototype, "mdc", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)({ message: 'mediaIds 必须是数组' }),
    __metadata("design:type", Array)
], CreateIspeakDto.prototype, "mediaIds", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)({ message: 'location 必须是对象' }),
    __metadata("design:type", Object)
], CreateIspeakDto.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)({ message: 'client 必须是对象' }),
    __metadata("design:type", Object)
], CreateIspeakDto.prototype, "client", void 0);
exports.CreateIspeakDto = CreateIspeakDto;
//# sourceMappingURL=create-ispeak.dto.js.map