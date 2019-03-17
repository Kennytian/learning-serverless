import { APIGatewayProxyHandler } from 'aws-lambda';
import { readFileSync } from "fs";
import 'source-map-support/register';
import { dynamoDBClient, dynamoDBDocumentClient } from "./dynamo-client";
import { createTable, dropTable } from "./models/movie";

export const create: APIGatewayProxyHandler = async (event) => {
  const dynamodb = dynamoDBClient(event);
  try {
    const { TableDescription = {} } = await dynamodb.createTable(createTable).promise();
    return getCorrectBody(TableDescription, 'create');
  } catch (e) {
    return getExceptionBody(e);
  }
};

export const drop: APIGatewayProxyHandler = async (event) => {
  const dynamodb = dynamoDBClient(event);
  try {
    const { TableDescription = {} } = await dynamodb.deleteTable(dropTable).promise();
    return getCorrectBody(TableDescription, 'drop');
  } catch (e) {
    return getExceptionBody(e);
  }
};

export const importData: APIGatewayProxyHandler = async (event) => {
  const dynamoDBDoc = dynamoDBDocumentClient(event);
  try {
    const allMovies = JSON.parse( readFileSync('movie.json', 'utf-8'));
    allMovies.forEach(async (movie) => {
      const params = {
        TableName: 'Movies',
        Item: {
          year: movie.year,
          title: movie.title,
          info: movie.info,
        },
      };
      await dynamoDBDoc.put(params).promise();
    });
    return {
      body: JSON.stringify({
        message: `Table import successfully!`,
      }),
      statusCode: 200,
    };
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
