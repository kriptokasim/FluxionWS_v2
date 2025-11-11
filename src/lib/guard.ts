// src/lib/guard.ts
export function allowHttp(url: string) {
  const allow = [
    'https://api.github.com/',
    'https://api.openai.com/',
    'https://generativelanguage.googleapis.com/'
  ];
  if (!allow.some(p => url.startsWith(p))) throw new Error(`Blocked egress: ${url}`);
}
