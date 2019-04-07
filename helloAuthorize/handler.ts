import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';

export const hello: APIGatewayProxyHandler = async event => {
  // Enter the following code into Header
  // customHeader:{"name":"Kenny", "age": 50}
  // Authorization: Beaar 2323
  const { headers = {} } = event;
  const { customHeader = {} } = headers;
  return {
    statusCode: 200,
    body: JSON.stringify({
      input1: typeof customHeader,
      input2: customHeader,
      message: 'Go Serverless Webpack (Typescript) v1.0! Your function executed successfully!',
      input: event,
    }),
  };
};
