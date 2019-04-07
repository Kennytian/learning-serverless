import { dynamoDBClient, dynamoDBDocumentClient } from '../utils/dynamo-client';
import { orderTable } from '../models/movie';

const TABLE_NAME = 'zlxg_subscribe';

export const saveOrder = async event => {
  const { body = '{}' } = event;
  let data = JSON.parse(body);
  const params = {
    TableName: TABLE_NAME,
    Item: { orderId: data.orderId || -1, name: data.name || 'no name', detail: data.info },
  };
  try {
    const dynamoDBDoc = dynamoDBDocumentClient(event);
    await dynamoDBDoc.put(params).promise();
    return { body: JSON.stringify({ message: '', code: 200 }), statusCode: 200 };
  } catch (e) {
    const dynamoDB = dynamoDBClient(event);
    return await dynamoDB.createTable(orderTable(TABLE_NAME)).promise();
  }
};
