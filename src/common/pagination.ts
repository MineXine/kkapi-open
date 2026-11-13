/**
 * 分页参数归一化
 *
 * 既有接口对 page/pageSize 不做校验，Number('abc') 会得到 NaN 并导致 $skip:NaN 报错。
 * 新接口统一走这里，避免把该问题复制到扩展模块。
 */
export function toPositiveInt(value: any, fallback: number, max = 100): number {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return fallback;
  return Math.min(Math.floor(num), max);
}
