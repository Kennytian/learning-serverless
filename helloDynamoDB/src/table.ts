import { APIGatewayProxyHandler } from 'aws-lambda';
import { readFileSync } from 'fs';
import 'source-map-support/register';
import { dynamoDBClient, dynamoDBDocumentClient } from './dynamo-client';
import { createTable, dropTable } from './models/movie';

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

const getExceptionBody = e => {
  return {
    body: JSON.stringify(e),
    statusCode: 500,
  };
};

export const create: APIGatewayProxyHandler = async event => {
  const dynamodb = dynamoDBClient(event);
  try {
    const { TableDescription = {} } = await dynamodb.createTable(createTable).promise();
    return getCorrectBody(TableDescription, 'create');
  } catch (e) {
    return getExceptionBody(e);
  }
};

export const drop: APIGatewayProxyHandler = async event => {
  const dynamodb = dynamoDBClient(event);
  try {
    const { TableDescription = {} } = await dynamodb.deleteTable(dropTable).promise();
    return getCorrectBody(TableDescription, 'drop');
  } catch (e) {
    return getExceptionBody(e);
  }
};

export const importData: APIGatewayProxyHandler = async event => {
  const dynamodbDoc = dynamoDBDocumentClient(event);
  const table = 'Movies';
  try {
    const allMovies = JSON.parse(readFileSync('movie.json', 'utf-8'));
    allMovies.forEach(async movie => {
      const params = {
        TableName: table,
        Item: { year: movie.year, title: movie.title, info: movie.info },
      };
      await dynamodbDoc.put(params).promise();
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

export const saveData: APIGatewayProxyHandler = async event => {
  const params = {
    TableName: 'Movies',
    Item: {
      year: 2015,
      title: 'The Big New Movie',
      info: {
        plot: 'Nothing happens at all.',
        rating: 0,
      },
    },
  };
  try {
    const dynamodbDoc = dynamoDBDocumentClient(event);
    const result = await dynamodbDoc.put(params).promise();
    return {
      body: JSON.stringify({ ...result, message: `Table save data successfully!` }),
      statusCode: 200,
    };
  } catch (e) {
    return getExceptionBody(e);
  }
};

export const getData: APIGatewayProxyHandler = async event => {
  const dynamodbDoc = dynamoDBDocumentClient(event);
  const params = { TableName: 'Movies', Key: { year: 2013, title: 'Rush' } };
  try {
    const result = await dynamodbDoc.get(params).promise();
    return {
      body: JSON.stringify(result),
      statusCode: 200,
    };
  } catch (e) {
    return getExceptionBody(e);
  }
};

export const updateData: APIGatewayProxyHandler = async event => {
  const dynamodbDoc = dynamoDBDocumentClient(event);
  const params = {
    TableName: 'Movies',
    Key: { year: 2015, title: 'The Big New Movie' },
    UpdateExpression: 'set info.rating=:r, info.plot=:p, info.actors=:a',
    ExpressionAttributeValues: {
      ':r': 5.5,
      ':p': 'Everything happens all at once.',
      ':a': ['Larry', 'Moe', 'Curly']
    },
    ReturnValues: 'UPDATE_NEW',
  };
  try {
    const result = await dynamodbDoc.update(params).promise();
    return {
      body: JSON.stringify(result),
      statusCode: 200,
    };
  } catch (e) {
    return getExceptionBody(e);
  }
};
