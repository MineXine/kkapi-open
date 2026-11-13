/**
 * 极简 User-Agent 解析（浏览器 / 系统 / 设备）
 *
 * 设计取舍：
 * 1. 不引入 ua-parser-js 等依赖，避免为"显示一行设备信息"增加部署风险；
 * 2. 只识别主流浏览器与系统，识别不出时返回「未知」，不抛异常；
 * 3. 规则顺序敏感：微信/QQ/Edge/Opera 的 UA 都内嵌 Chrome，必须先于 Chrome 匹配。
 */
export interface ClientInfo {
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  device: string;
  ua: string;
}

/** 顺序即优先级，不可随意调整 */
const BROWSER_RULES: Array<[string, RegExp]> = [
  ['微信', /MicroMessenger\/([\d.]+)/i],
  ['QQ', /(?:MQQBrowser|QQBrowser)\/([\d.]+)/i],
  ['Edge', /Edg(?:e|A|iOS)?\/([\d.]+)/i],
  ['Opera', /(?:OPR|Opera)\/([\d.]+)/i],
  ['Chrome', /(?:Chrome|CriOS)\/([\d.]+)/i],
  ['Firefox', /(?:Firefox|FxiOS)\/([\d.]+)/i],
  ['Safari', /Version\/([\d.]+).*Safari/i],
  ['IE', /(?:MSIE |Trident\/.*rv:)([\d.]+)/i],
];

const WINDOWS_VERSION: Record<string, string> = {
  '10.0': '10/11',
  '6.3': '8.1',
  '6.2': '8',
  '6.1': '7',
  '6.0': 'Vista',
  '5.1': 'XP',
};

function matchBrowser(ua: string): [string, string] {
  for (const [name, rule] of BROWSER_RULES) {
    const matched = ua.match(rule);
    if (matched) return [name, matched[1] || ''];
  }
  return ['未知', ''];
}

function matchOs(ua: string): [string, string] {
  // iPhone / iPad 的 UA 里含有 "like Mac OS X"，必须先于 macOS 判断
  const ios = ua.match(/(?:iPhone|iPad|iPod).*?OS ([\d_]+)/i);
  if (ios) return ['iOS', ios[1].replace(/_/g, '.')];

  const android = ua.match(/Android\s([\d.]+)/i);
  if (android) return ['Android', android[1]];

  const windows = ua.match(/Windows NT ([\d.]+)/i);
  if (windows) return ['Windows', WINDOWS_VERSION[windows[1]] || windows[1]];

  const mac = ua.match(/Mac OS X ([\d_.]+)/i);
  if (mac) return ['macOS', mac[1].replace(/_/g, '.')];

  if (/CrOS/i.test(ua)) return ['ChromeOS', ''];
  if (/Linux/i.test(ua)) return ['Linux', ''];

  return ['未知', ''];
}

function matchDevice(ua: string): string {
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua)) return 'tablet';
  if (/Mobile|iPhone|iPod|Android.*Mobile|Windows Phone/i.test(ua)) return 'mobile';
  if (/Android/i.test(ua)) return 'tablet';
  return 'desktop';
}

/**
 * 解析 UA 字符串；入参为空时返回全「未知」的结构，保证字段恒存在
 */
export function parseUserAgent(ua = ''): ClientInfo {
  const safeUa = typeof ua === 'string' ? ua : '';
  const [browser, browserVersion] = matchBrowser(safeUa);
  const [os, osVersion] = matchOs(safeUa);
  return {
    browser,
    browserVersion,
    os,
    osVersion,
    device: matchDevice(safeUa),
    ua: safeUa.slice(0, 512),
  };
}

/**
 * 合并客户端上报的设备信息与服务端解析结果。
 * 客户端已知的字段优先（例如 App 内可拿到更精确的机型），未知字段回落到服务端解析。
 */
export function mergeClientInfo(ua: string, reported?: Partial<ClientInfo>): ClientInfo {
  const parsed = parseUserAgent(ua);
  if (!reported || typeof reported !== 'object') return parsed;
  const merged = { ...parsed };
  (['browser', 'browserVersion', 'os', 'osVersion', 'device'] as const).forEach((key) => {
    const value = reported[key];
    if (typeof value === 'string' && value) merged[key] = value.slice(0, 64);
  });
  return merged;
}

/**
 * 对外暴露设备信息时脱敏：原始 UA 串仅作者本人可见
 */
export function toPublicClientInfo(client?: ClientInfo | null) {
  if (!client) return null;
  const { ua, ...rest } = client as ClientInfo;
  return rest;
}
