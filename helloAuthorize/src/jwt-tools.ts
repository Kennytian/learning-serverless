import { sign, SignOptions, verify } from 'jsonwebtoken';

const saltSecret: string | Buffer = '1234567890';

const jwtSign = (payload: object) => {
  const secretOrPrivateKey: string | Buffer | { key: string; passphrase: string } = saltSecret;
  // Eg: 60, "2 days", "10h", "7d" */
  const options: SignOptions = { expiresIn: '7d' };
  const result: string = sign(payload, secretOrPrivateKey, options);
  return result;
};

const jwtVerify = (token: string) => {
  const secretOrPrivateKey: string | Buffer | { key: string; passphrase: string } = saltSecret;
  try {
    const result: object | string = verify(token, secretOrPrivateKey);
    return result;
  } catch (e) {
    console.error('jwtVerify error:', e);
    return null;
  }
};

export { jwtSign, jwtVerify };
