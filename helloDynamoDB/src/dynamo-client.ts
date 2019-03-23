import { DynamoDB } from 'aws-sdk';

export const dynamoDBClient = (event, port = 8000, region = 'localhost') => {
  if (event.isOffline) {
    return new DynamoDB({ endpoint: `http://localhost:${port}`, region });
  }
  return new DynamoDB();
};

export const dynamoDBDocumentClient = (event, port = 8000, region = 'localhost') => {
  if (event.isOffline) {
    return new DynamoDB.DocumentClient({ endpoint: `http://localhost:${port}`, region });
  }
  return new DynamoDB.DocumentClient();
};
