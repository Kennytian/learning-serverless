import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import getDynamoClient from "./dynamo-client";
import { createTable, dropTable } from "./models/movie";

export const create: APIGatewayProxyHandler = async (event) => {
  const dynamodb = getDynamoClient(event);
  try {
    const { TableDescription = {} } = await dynamodb.createTable(createTable).promise();
    return getCorrectBody(TableDescription, 'create');
  } catch (e) {
    return getExceptionBody(e);
  }
};

export const drop: APIGatewayProxyHandler = async (event) => {
  const dynamodb = getDynamoClient(event);
  try {
    const { TableDescription = {} } = await dynamodb.deleteTable(dropTable).promise();
    return getCorrectBody(TableDescription, 'drop');
  } catch (e) {
    return getExceptionBody(e);
  }
};

const getCorrectBody = (TableDescription, action) => {
  return {
    body: JSON.stringify({
      creationDateTime: TableDescription.CreationDateTime,
      tableStatus: TableDescription.TableStatus,
      tableName: TableDescription.TableName,
      message: `Table ${action} successfully!`,
    }),
    statusCode: 200,
  };
};

const getExceptionBody = (e) => {
  return {
    body: JSON.stringify(e),
    statusCode: 500,
  };
};
