"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toPositiveInt = void 0;
function toPositiveInt(value, fallback, max = 100) {
    const num = Number(value);
    if (!Number.isFinite(num) || num <= 0)
        return fallback;
    return Math.min(Math.floor(num), max);
}
exports.toPositiveInt = toPositiveInt;
//# sourceMappingURL=pagination.js.map