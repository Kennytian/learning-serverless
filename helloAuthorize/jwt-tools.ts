import { sign, SignOptions, verify } from 'jsonwebtoken';

const saltSecret: string | Buffer = '1234567890';

const jwtSign = (payload: object) => {
  const secretOrPrivateKey: string | Buffer | { key: string; passphrase: string } = saltSecret;
  const options: SignOptions = { expiresIn: 60 };
  const result: string = sign(payload, secretOrPrivateKey, options);
  return result;
};

const jwtVerify = (token: string) => {
  const secretOrPrivateKey: string | Buffer | { key: string; passphrase: string } = saltSecret;
  const result = verify(token, secretOrPrivateKey);
  return result;
};

export { jwtSign, jwtVerify };
