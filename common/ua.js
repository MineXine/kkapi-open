"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toPublicClientInfo = exports.mergeClientInfo = exports.parseUserAgent = void 0;
const BROWSER_RULES = [
    ['微信', /MicroMessenger\/([\d.]+)/i],
    ['QQ', /(?:MQQBrowser|QQBrowser)\/([\d.]+)/i],
    ['Edge', /Edg(?:e|A|iOS)?\/([\d.]+)/i],
    ['Opera', /(?:OPR|Opera)\/([\d.]+)/i],
    ['Chrome', /(?:Chrome|CriOS)\/([\d.]+)/i],
    ['Firefox', /(?:Firefox|FxiOS)\/([\d.]+)/i],
    ['Safari', /Version\/([\d.]+).*Safari/i],
    ['IE', /(?:MSIE |Trident\/.*rv:)([\d.]+)/i],
];
const WINDOWS_VERSION = {
    '10.0': '10/11',
    '6.3': '8.1',
    '6.2': '8',
    '6.1': '7',
    '6.0': 'Vista',
    '5.1': 'XP',
};
function matchBrowser(ua) {
    for (const [name, rule] of BROWSER_RULES) {
        const matched = ua.match(rule);
        if (matched)
            return [name, matched[1] || ''];
    }
    return ['未知', ''];
}
function matchOs(ua) {
    const ios = ua.match(/(?:iPhone|iPad|iPod).*?OS ([\d_]+)/i);
    if (ios)
        return ['iOS', ios[1].replace(/_/g, '.')];
    const android = ua.match(/Android\s([\d.]+)/i);
    if (android)
        return ['Android', android[1]];
    const windows = ua.match(/Windows NT ([\d.]+)/i);
    if (windows)
        return ['Windows', WINDOWS_VERSION[windows[1]] || windows[1]];
    const mac = ua.match(/Mac OS X ([\d_.]+)/i);
    if (mac)
        return ['macOS', mac[1].replace(/_/g, '.')];
    if (/CrOS/i.test(ua))
        return ['ChromeOS', ''];
    if (/Linux/i.test(ua))
        return ['Linux', ''];
    return ['未知', ''];
}
function matchDevice(ua) {
    if (/iPad|Tablet|PlayBook|Silk/i.test(ua))
        return 'tablet';
    if (/Mobile|iPhone|iPod|Android.*Mobile|Windows Phone/i.test(ua))
        return 'mobile';
    if (/Android/i.test(ua))
        return 'tablet';
    return 'desktop';
}
function parseUserAgent(ua = '') {
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
exports.parseUserAgent = parseUserAgent;
function mergeClientInfo(ua, reported) {
    const parsed = parseUserAgent(ua);
    if (!reported || typeof reported !== 'object')
        return parsed;
    const merged = { ...parsed };
    ['browser', 'browserVersion', 'os', 'osVersion', 'device'].forEach((key) => {
        const value = reported[key];
        if (typeof value === 'string' && value)
            merged[key] = value.slice(0, 64);
    });
    return merged;
}
exports.mergeClientInfo = mergeClientInfo;
function toPublicClientInfo(client) {
    if (!client)
        return null;
    const { ua, ...rest } = client;
    return rest;
}
exports.toPublicClientInfo = toPublicClientInfo;
//# sourceMappingURL=ua.js.map