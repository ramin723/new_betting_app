import { createHmac } from 'crypto'

export function generateTOTP(): string {
  const secret = createHmac('sha256', Math.random().toString())
    .update(Date.now().toString())
    .digest('hex')
  
  return secret
}

export function verifyTOTP(secret: string, token: string): boolean {
  const now = Math.floor(Date.now() / 1000)
  const timeStep = 30 // 30 seconds per token
  
  // Check current token and adjacent tokens (for clock drift)
  for (let i = -1; i <= 1; i++) {
    const timestamp = now + (i * timeStep)
    const expectedToken = generateToken(secret, timestamp)
    
    if (expectedToken === token) {
      return true
    }
  }
  
  return false
}

function generateToken(secret: string, timestamp: number): string {
  const timeBuffer = Buffer.alloc(8)
  timeBuffer.writeBigUInt64BE(BigInt(timestamp))
  
  const hmac = createHmac('sha1', Buffer.from(secret, 'hex'))
  hmac.update(timeBuffer)
  const hash = hmac.digest()
  
  const offset = hash[hash.length - 1] & 0xf
  const token = ((hash[offset] & 0x7f) << 24) |
                ((hash[offset + 1] & 0xff) << 16) |
                ((hash[offset + 2] & 0xff) << 8) |
                (hash[offset + 3] & 0xff)
  
  return (token % 1000000).toString().padStart(6, '0')
} 