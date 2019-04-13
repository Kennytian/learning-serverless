import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';

import { resizeHandler } from './resize-handler';

export const handler: APIGatewayProxyHandler = async event => {
  try {
    const imagePath = await resizeHandler.process(event);
    const URL = `http://${process.env.BUCKET}.s3-website.${process.env.REGION}.amazonaws.com`;
    return {
      handler: { location: `${URL}/${imagePath}` },
      statusCode: 301,
      body: JSON.stringify({
        message: 'ResizeHandler function executed successfully!',
        input: event,
      }),
    };
  } catch (error) {
    console.log(error);
    return new Error(error);
  }
};
