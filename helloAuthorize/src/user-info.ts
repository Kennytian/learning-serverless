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
