import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { jwtSign, jwtVerify } from './jwt-tools';

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
