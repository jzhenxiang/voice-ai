export interface ParameterLinkedField {
  key: string;
  sourceField: string;
}

export interface ParameterShowWhen {
  key: string;
  pattern: string;
}

export interface ParameterChoice {
  label: string;
  value: string;
}

export interface ParameterConfig {
  key: string;
  label: string;
  type: 'dropdown' | 'slider' | 'number' | 'input' | 'textarea' | 'select' | 'json';
  required?: boolean;
  default?: string;
  errorMessage?: string;
  helpText?: string;
  colSpan?: 1 | 2;
  advanced?: boolean;
  showWhen?: ParameterShowWhen;
  linkedField?: ParameterLinkedField;
  // dropdown
  data?: string;
  valueField?: string;
  searchable?: boolean;
  strict?: boolean;
  // slider / number
  min?: number;
  max?: number;
  step?: number;
  // textarea / input
  placeholder?: string;
  rows?: number;
  // select
  choices?: ParameterChoice[];
}

export interface CategoryConfig {
  preservePrefix?: string;
  parameters: ParameterConfig[];
}

export interface ProviderConfig {
  stt?: CategoryConfig;
  tts?: CategoryConfig;
  text?: CategoryConfig;
}

const configCache: Record<string, ProviderConfig | null> = {};
const dataCache: Record<string, any[]> = {};

export function loadProviderConfig(provider: string): ProviderConfig | null {
  if (provider in configCache) {
    return configCache[provider];
  }
  try {
    const config = require(`./${provider}/config.json`) as ProviderConfig;
    configCache[provider] = config;
    return config;
  } catch {
    configCache[provider] = null;
    return null;
  }
}

export function loadProviderData(provider: string, filename: string): any[] {
  const cacheKey = `${provider}/${filename}`;
  if (cacheKey in dataCache) {
    return dataCache[cacheKey];
  }
  try {
    const data = require(`./${provider}/${filename}`);
    dataCache[cacheKey] = data;
    return data;
  } catch {
    dataCache[cacheKey] = [];
    return [];
  }
}
