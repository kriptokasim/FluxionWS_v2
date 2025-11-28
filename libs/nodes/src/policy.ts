const DEFAULT_ALLOWLIST = [
  'https://api.github.com/',
  'https://api.openai.com/',
  'https://generativelanguage.googleapis.com/'
];

function loadAllowlist(): string[] {
  const fromEnv = process.env.FLUXION_HTTP_ALLOWLIST;
  if (!fromEnv) return DEFAULT_ALLOWLIST;
  return fromEnv
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

const HTTP_ALLOWLIST = loadAllowlist();

export function enforceHttpEgress(url: string) {
  const trimmed = url.trim();
  if (!trimmed.startsWith('http')) {
    throw new Error(`Blocked egress: invalid protocol for ${url}`);
  }
  const parsed = new URL(trimmed);
  const host = parsed.hostname;
  const ok = HTTP_ALLOWLIST.some((entry) => {
    if (entry.includes('://')) {
      return trimmed.startsWith(entry);
    }
    return host === entry || host.endsWith(`.${entry}`);
  });
  if (!ok) {
    throw new Error(`Blocked egress: ${parsed.hostname} not in allowlist`);
  }
}
