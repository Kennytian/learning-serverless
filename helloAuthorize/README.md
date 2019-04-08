## Serverless authorize with Json Web Token(JWT) 

[![LICENSE](https://img.shields.io/badge/license-Anti%20996-blue.svg)](https://github.com/996icu/996.ICU/blob/master/LICENSE)

Serverless 的权限设计跟 Node.js 项目权限大同小异，比如：AWS 的 Cognito，OAuth2、Cookies 和今天主要讲的 JWT。

JWT 是 `JSON Web Token` 缩写，详细解释请见 [JSON Web Token 入门教程](http://www.ruanyifeng.com/blog/2018/07/json_web_token-tutorial.html)

#### 一、安装
`yarn add jsonwebtoken`，安装好后，package.json 中添加如下依赖：
```
  "dependencies": {
    ...
   "jsonwebtoken": "^8.5.1",
    ...
  },

```

#### 二、封装 JWT
jwt-tools.ts
```
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

```

#### 三、引用

```
import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { jwtVerify } from './jwt-tools';
```

###### 3.1 获取 Token
```
// post
// {"name": "Kenny锅","password": "123456"}
export const login: APIGatewayProxyHandler = async event => {
  const { body = '' } = event;
  if (!body) {
    return { statusCode: 400, body: JSON.stringify({ token: '', message: 'body is empty' }) };
  }

  const { name, password } = JSON.parse(body);
  if (!(name === 'Kenny锅' && password === '123456')) {
    return { statusCode: 403, body: JSON.stringify({ token: '', message: 'name, password is invalid' }) };
  }

  const token = jwtSign({ name, password });
  return {
    statusCode: 200,
    body: JSON.stringify({ token }),
  };
};
```
###### 3.2  刷新 Token
```
// post
// {"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiS2VubnnplIUiLCJwYXNzd29yZCI6IjEyMzQ1NiIsImlhdCI6MTU1NDYzNDA4MywiZXhwIjoxNTU1MjM4ODgzfQ.5cAjWkM39t5XbWX-b0HxfzbqE0kTP2Zg4BYMUD-VegA"}
export const refresh: APIGatewayProxyHandler = async event => {
  const { body = '' } = event;
  if (!body) {
    return { statusCode: 400, body: JSON.stringify({ token: '', message: 'body is empty' }) };
  }

  const { token } = JSON.parse(body);
  if (!token) {
    return { statusCode: 401, body: JSON.stringify({ token: '', message: 'token is empty' }) };
  }

  const result: object | string = jwtVerify(token);
  if (!result) {
    return { statusCode: 403, body: JSON.stringify({ token: '', message: 'original token expire' }) };
  }

  const { name, password } = result;
  if (!name || !password) {
    return { statusCode: 403, body: JSON.stringify({ token: '', message: 'original data unavailable' }) };
  }

  const newToken = jwtSign({ name, password });
  return { statusCode: 200, body: JSON.stringify({ token: newToken }) };
};
```

#### 四、获取「用户信息」

```
import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { jwtVerify } from './jwt-tools';

// post
// {"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiS2VubnnplIUiLCJwYXNzd29yZCI6IjEyMzQ1NiIsImlhdCI6MTU1NDYzNDA4MywiZXhwIjoxNTU1MjM4ODgzfQ.5cAjWkM39t5XbWX-b0HxfzbqE0kTP2Zg4BYMUD-VegA"}
export const useInfo: APIGatewayProxyHandler = async event => {
  const { body } = event;
  if (!body) {
    return { statusCode: 400, body: JSON.stringify({ data: null, message: 'body is empty' }) };
  }

  const { token } = JSON.parse(body);
  if (!token) {
    return {
      statusCode: 401,
      body: JSON.stringify({ data: null, message: 'token is unavailable' }),
    };
  }

  const result = jwtVerify(token);
  if (!result) {
    return {
      statusCode: 403,
      body: JSON.stringify({ data: null, message: 'token expire' }),
    };
  }

  const { name, exp } = result;
  const data = name ? { name, expired: exp } : null;
  return {
    statusCode: 200,
    body: JSON.stringify({ data }),
  };
};

```

#### 五、配置 serverless.yml
```yml
functions:
  hello:
    handler: handler.hello
    events:
      - http:
          method: get
          path: hello
  login:
    handler: src/auth.login
    events:
      - http:
          method: post
          path: login
  refresh:
    handler: src/auth.refresh
    events:
      - http:
          method: post
          path: refresh-token
  userInfo:
    handler: src/user-info.useInfo
    events:
      - http:
          method: post
          path: user-info
```
#### 六、 调试代码
###### 6.1 登录

![](https://upload-images.jianshu.io/upload_images/16119129-b2496aef897ff580.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

###### 6.2 获取用户信息

![](https://upload-images.jianshu.io/upload_images/16119129-f7fb1aff82a0e6a1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

###### 6.3 用户快过期了，就调用 refresh 方法

![](https://upload-images.jianshu.io/upload_images/16119129-4f8d9f2d0b2d0abc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#### 七、完整代码
https://github.com/Kennytian/learning-serverless/tree/master/helloAuthorize

#####  相关文章
- Serverless 入门（一） - 创建 IAM https://www.jianshu.com/p/9fb731a799e2
- Serverless 入门（二） - HelloWord https://www.jianshu.com/p/ddf2ffda5f63
- Serverless 入门（三）- 初始项目解读 https://www.jianshu.com/p/8baba2a8fe9f
- Serverless 入门（四）- 如何调试 https://www.jianshu.com/p/58d30915de8a
- Serverless 入门（五）- 常用命令 https://www.jianshu.com/p/28f001ea9d9d
- Serverless 入门（六）- DynamoDB 数据库（上） https://www.jianshu.com/p/c313b61d1cbf
- Serverless 入门（七）- DynamoDB 数据库（中） https://www.jianshu.com/p/05e7f4ccd6fe
- Serverless 入门（八）- DynamoDB 数据库（下） https://www.jianshu.com/p/0f9f1561ec46
- Serverless 入门（九）- 权限 https://www.jianshu.com/p/97228749d761



