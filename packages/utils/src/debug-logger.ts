// Tiny, configurable debug logging

function ymdhms(timestamp: Date) {
  return (
    timestamp.getFullYear().toString().padStart(4, "0") +
    ":" +
    (timestamp.getMonth() + 1).toString().padStart(2, "0") +
    ":" +
    timestamp.getDate().toString().padStart(2, "0") +
    " " +
    timestamp.getHours().toString().padStart(2, "0") +
    ":" +
    timestamp.getMinutes().toString().padStart(2, "0") +
    ":" +
    timestamp.getSeconds().toString().padStart(2, "0") +
    "." +
    timestamp.getMilliseconds().toString().padStart(3, "0")
  );
}

const LogLevel = {
  DISABLED: -1,
  SILENT: 0,
  TRACE: 1,
  DEBUG: 2,
  INFO: 3,
  WARN: 4,
  ERROR: 5,
} as const;

function levelToNumber(level: string | number): number {
  if (typeof level === "number") return level;
  switch (level?.toLowerCase()) {
    case "trace":
      return LogLevel.TRACE;
    case "debug":
      return LogLevel.DEBUG;
    case "info":
      return LogLevel.INFO;
    case "warn":
      return LogLevel.WARN;
    case "error":
      return LogLevel.ERROR;
  }
  return LogLevel.INFO;
}

type WildcardSearchConfig = {
  prefix: string;
  forceAllow: boolean;
  forceDisallow: boolean;
  level?: number;
};

type ExactSearchConfig = {
  forceAllow: boolean;
  forceDisallow: boolean;
  level?: number;
};

type ParsedConfig = {
  defaultLevel: number;
  defaultAllow: boolean;
  wildcards: WildcardSearchConfig[];
  exacts: Map<string, ExactSearchConfig>;
};

function parseConfig(string: string): ParsedConfig {
  const wildcards = new Map<string, WildcardSearchConfig>();
  const exacts = new Map<string, ExactSearchConfig>();

  let defaultAllow = false;
  let defaultLevel = "info";
  const lines = string
    .replaceAll("\n", "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const lineCount = lines.length;

  for (let linei = 0; linei < lineCount; linei++) {
    const line = lines[linei].trim();
    if (line === "*") {
      defaultAllow = true;
    } else if (/^\([a-zA-Z]\)$/i.test(line)) {
      defaultLevel = line.slice(1, -1).trim().toLowerCase() || defaultLevel;
    } else {
      let lineWithoutLevel: string;
      const levelmatch = line.match(/\([a-zA-Z]+\)/i);
      let level: undefined | string;
      if (levelmatch) {
        const levelRaw = levelmatch[0];
        const leveli = line.indexOf(levelRaw);
        lineWithoutLevel = (
          line.slice(0, leveli) + line.slice(leveli + levelRaw.length)
        ).trim();
        level = levelRaw.slice(1, -1).trim().toLowerCase() || undefined;
      } else {
        lineWithoutLevel = defaultLevel;
      }

      let prefixi = 0;
      let forceDisallow = false;
      let forceAllow = false;
      if (lineWithoutLevel.startsWith("-")) {
        forceDisallow = true;
        prefixi = 1;
      }
      if (lineWithoutLevel.startsWith("+")) {
        forceAllow = true;
        prefixi = 1;
      }

      const lineWithoutPrefix = line.slice(prefixi).trim();

      const wildcardi = lineWithoutPrefix.indexOf("*");
      let lineWithoutWildcard: string;
      if (wildcardi === -1) {
        lineWithoutWildcard = lineWithoutPrefix;
      } else {
        lineWithoutWildcard = lineWithoutPrefix.slice(0, wildcardi);
      }

      if (wildcardi === -1) {
        exacts.set(lineWithoutWildcard, {
          forceAllow,
          forceDisallow,
          level: levelToNumber(level),
        });
      } else {
        wildcards.set(lineWithoutWildcard, {
          prefix: lineWithoutWildcard,
          forceAllow,
          forceDisallow,
          level: levelToNumber(level),
        });
      }
    }
  }

  return {
    defaultAllow: defaultAllow,
    wildcards: Array.from(wildcards.values()),
    exacts,
    defaultLevel: levelToNumber(defaultLevel),
  };
}

const defaultParsedConfig: ParsedConfig = {
  defaultLevel: LogLevel.INFO,
  defaultAllow: false,
  wildcards: [],
  exacts: new Map(),
};

function getDebugConfigString(): undefined | string {
  // Load from global
  if (typeof globalThis !== "undefined") {
    const confString = globalThis?.__ENKRYPT_DEBUG_LOG_CONF__;
    if (typeof confString === "string") return confString;
  }
  return undefined;
}

class DebugLogEnabler {
  _cache: Map<string, number>;
  _config: Readonly<ParsedConfig>;

  constructor() {
    this._cache = new Map();
    this._config = parseConfig(getDebugConfigString() ?? "");
  }

  clear() {
    this._cache.clear();
    this._cache = new Map();
    this._config = defaultParsedConfig;
  }

  refresh() {
    this._cache.clear();
    this._config = parseConfig(getDebugConfigString() ?? "");
  }

  level(name: string): number {
    const cached = this._cache.get(name);
    if (cached !== undefined) return cached;
    const exact = this._config.exacts.get(name);
    if (exact) {
      let level: number;
      if (exact.forceAllow) level = exact.level ?? this._config.defaultLevel;
      else if (exact.forceDisallow) level = LogLevel.DISABLED;
      else level = this._config.defaultLevel;
      this._cache.set(name, level);
      return level;
    }
    for (const wildcard of this._config.wildcards) {
      if (name.startsWith(wildcard.prefix)) {
        let level: number;
        if (wildcard.forceAllow)
          level = wildcard.level ?? this._config.defaultLevel;
        else if (wildcard.forceDisallow) level = LogLevel.DISABLED;
        else level = this._config.defaultLevel;
        this._cache.set(name, level);
        return level;
      }
    }
    let level: number;
    if (this._config.defaultAllow) level = this._config.defaultLevel;
    else level = LogLevel.DISABLED;
    this._cache.set(name, level);
    return level;
  }
}

// Initialise this before creating a DebugLogEnabler instance
let currentConfString = globalThis.__ENKRYPT_DEBUG_LOG_CONF__;
Object.defineProperty(globalThis, "__ENKRYPT_DEBUG_LOG_CONF__", {
  get() {
    return currentConfString;
  },
  set(value) {
    currentConfString = value;
    (globalThis.__ENKRYPT_DEBUG_LOG_ENABLER__ as DebugLogEnabler)?.refresh?.();
  },
});

// Parses the debug logger configuration string, provides
// log levels and caches results
globalThis.__ENKRYPT_DEBUG_LOG_ENABLER__ = new DebugLogEnabler();
globalThis.__ENKRYPT_DEBUG_LOG_ENABLER__.refresh();

function getEnabler(): DebugLogEnabler {
  return globalThis.__ENKRYPT_DEBUG_LOG_ENABLER__;
}

/**
 * Configurable debug logging
 *
 * ## Usage
 *
 * Envfile:
 * ```.env
 * VITE_DEBUG_LOG= # Log nothing
 * VITE_DEBUG_LOG='*'                                 # Log everything
 * VITE_DEBUG_LOG='swap:jupiter'                      # Log only contexts name "swap:jupiter"
 * VITE_DEBUG_LOG='swap:*'                            # Log contexts starting with "swap:*"
 * VITE_DEBUG_LOG='(warn)'                            # Set the log level to trace
 * VITE_DEBUG_LOG='(warn),swap:jupiter(trace)'        # Set the log level to warn but jupiter contexts to trace
 * VITE_DEBUG_LOG='(warn),swap:jupiter(trace),swap:*'
 * VITE_DEBUG_LOG='-swap:jupiter,swap:*'              # Log swap: context's except jupiter
 * ```
 *
 * TypeScript files:
 * ```ts
 * // jupiter/index.ts
 * import { DebugLogger } from '@enkryptcom/utils'
 * cosnt logger = new DebugLogger('swap:jupiter')
 *
 * // Logging at different levels
 * logger.silent('Hello!') // (Always dropped)
 * logger.trace('Hello!')  // 2024-11-25T04:22:16Z [swap:jupiter] TRACE: Hello!
 * logger.trace('Hello!')  // 2024-11-25T04:22:16Z [swap:jupiter] DEBUG: Hello!
 * logger.info('Hello!')   // 2024-11-25T04:22:16Z [swap:jupiter] INFO: Hello!
 * logger.warn('Hello!')   // 2024-11-25T04:22:16Z [swap:jupiter] WARN: Hello!
 * logger.error('Hello!')  // 2024-11-25T04:22:16Z [swap:jupiter] ERROR: Hello!
 *
 * // Execute heavy conditional logic only when logging is enabled
 * if (logger.enabled()) {
 *   logger.info('Hi!', heavyCalculation())
 * }
 * ```
 *
 * Browser developer console:
 * ```
 * // Configure logging
 * __ENKRYPT_DEBUG_LOG_CONF__ = 'swap:jupiter'
 * __ENKRYPT_DEBUG_LOG_CONF__ = 'swap:*'
 * // ...etc. Same as envfiles
 * ```
 */
export class DebugLogger {
  _name: string;
  _color: boolean;
  _level?: number;

  constructor(name: string, opts?: { level?: string | number }) {
    this._name = name;
    this._color = true;
    this._level =
      typeof opts?.level === "string" ? levelToNumber(opts.level) : opts?.level;
  }

  enabled(): boolean {
    return this.level() > LogLevel.DISABLED;
  }

  level(): number {
    if (this._level !== undefined) return this._level;
    return getEnabler().level(this._name);
  }

  _formatHeader(levelNumber: number): string {
    const timestamp = new Date();
    let timestampStr = ymdhms(timestamp);
    if (this._color) timestampStr = `\x1b[90m${timestampStr}\x1b[0m`;

    let levelStr: string;
    switch (levelNumber) {
      case LogLevel.DISABLED:
        levelStr = "DISABLED";
        if (this._color) levelStr = `\x1b[90m${levelStr}\x1b[0m`;
        break;
      case LogLevel.SILENT:
        levelStr = "SILENT";
        if (this._color) levelStr = `\x1b[90m${levelStr}\x1b[0m`;
        break;
      case LogLevel.TRACE:
        levelStr = "TRACE";
        if (this._color) levelStr = `\x1b[90m${levelStr}\x1b[0m`;
        break;
      case LogLevel.DEBUG:
        levelStr = "DEBUG";
        if (this._color) levelStr = `\x1b[36m${levelStr}\x1b[0m`;
        break;
      case LogLevel.INFO:
        levelStr = "INFO";
        if (this._color) levelStr = `\x1b[32m${levelStr}\x1b[0m`;
        break;
      case LogLevel.WARN:
        levelStr = "WARN";
        if (this._color) levelStr = `\x1b[33m${levelStr}\x1b[0m`;
        break;
      case LogLevel.ERROR:
        levelStr = "ERROR";
        if (this._color) levelStr = `\x1b[31m${levelStr}\x1b[0m`;
        break;
      default:
        levelStr = "UNKNOWN";
        if (this._color) levelStr = `\x1b[35m${levelStr}\x1b[0m`;
    }

    let msgHeader = `${timestampStr}`;

    let contextStr = "";
    if (this._name) {
      let nameStr = this._name;
      if (this._color && nameStr) nameStr = `\x1b[90m${nameStr}\x1b[0m`;
      contextStr += nameStr;
    }
    if (contextStr) {
      msgHeader += ` [${contextStr}]`;
    }

    msgHeader += ` ${levelStr}:`;

    return msgHeader;
  }

  silent(..._args: any[]): void {
    // Drop
  }

  trace(...args: any[]): void {
    const level = this.level();
    if (level < LogLevel.TRACE) return;
    console.debug(this._formatHeader(LogLevel.TRACE), ...args);
  }

  debug(...args: any[]): void {
    const level = this.level();
    if (level < LogLevel.DEBUG) return;
    console.debug(this._formatHeader(LogLevel.DEBUG), ...args);
  }

  info(...args: any[]): void {
    const level = this.level();
    if (level < LogLevel.INFO) return;
    console.info(this._formatHeader(LogLevel.INFO), ...args);
  }

  warn(...args: any[]): void {
    const level = this.level();
    if (level < LogLevel.WARN) return;
    console.warn(this._formatHeader(LogLevel.WARN), ...args);
  }

  error(...args: any[]): void {
    const level = this.level();
    if (level < LogLevel.ERROR) return;
    console.error(this._formatHeader(LogLevel.ERROR), ...args);
  }
}
