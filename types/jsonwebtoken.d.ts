declare module 'jsonwebtoken' {
  export function sign(payload: string | object | Buffer, secretOrPrivateKey: string, options?: Record<string, unknown>): string;
  export function verify(token: string, secretOrPublicKey: string): string | object;
}
