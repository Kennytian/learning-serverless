import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';

export const hello: APIGatewayProxyHandler = async event => {
  const { queryStringParameters = {} } = event;
  return {
    body: JSON.stringify({
      name: queryStringParameters && queryStringParameters.name,
      message: 'Go Serverless Webpack (Typescript) v1.0! Your function executed successfully!',
      input: event,
    }),
    statusCode: 200,
  };
};
