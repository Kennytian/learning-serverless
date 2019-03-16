import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import getDynamoClient from "./dynamo-client";
import { modelsMovie } from "./models/movie";

export const create: APIGatewayProxyHandler = async (event) => {
  const dynamodb = getDynamoClient(event);
  try {
    const { TableDescription = {} } = await dynamodb.createTable(modelsMovie).promise();
    return {
      body: JSON.stringify({
        creationDateTime: TableDescription.CreationDateTime,
        tableStatus: TableDescription.TableStatus,
        tableName: TableDescription.TableName,
        message: 'Table create successfully!',
      }),
      statusCode: 200,
    };
  } catch (e) {
    return {
      body: JSON.stringify(e),
      statusCode: 500,
    };
  }
};
