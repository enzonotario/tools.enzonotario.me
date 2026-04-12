import { md5 } from 'js-md5'

async function sha(algorithm: 'SHA-1' | 'SHA-256' | 'SHA-512', data: string): Promise<string> {
  const buffer = new TextEncoder().encode(data)
  const hashBuffer = await crypto.subtle.digest(algorithm, buffer)
  const arr = Array.from(new Uint8Array(hashBuffer))
  return arr.map(b => b.toString(16).padStart(2, '0')).join('')
}

export function hashMd5(data: string): string {
  return md5(data)
}

export async function hashSha1(data: string): Promise<string> {
  return sha('SHA-1', data)
}

export async function hashSha256(data: string): Promise<string> {
  return sha('SHA-256', data)
}

export async function hashSha512(data: string): Promise<string> {
  return sha('SHA-512', data)
}

export async function computeAll(data: string): Promise<{ md5: string, sha1: string, sha256: string, sha512: string }> {
  const [sha1, sha256, sha512] = await Promise.all([
    hashSha1(data),
    hashSha256(data),
    hashSha512(data)
  ])
  return {
    md5: hashMd5(data),
    sha1,
    sha256,
    sha512
  }
}
