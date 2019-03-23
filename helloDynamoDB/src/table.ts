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
  const params = { TableName: 'Movies', Key: { year: 2015, title: 'The Big New Movie' } };
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
      ':a': ['Larry', 'Moe', 'Curly'],
    },
    // ReturnValues 有如下几种：NONE, ALL_OLD, UPDATED_OLD, ALL_NEW, UPDATED_NEW
    ReturnValues: 'UPDATED_NEW',
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

// 每次请求这个接口，就将这条记录的 info.rating 值加 1
export const updateStepData: APIGatewayProxyHandler = async event => {
  const dynamodbDoc = dynamoDBDocumentClient(event);
  const params = {
    TableName: 'Movies',
    Key: { year: 1940, title: 'Fantasia' },
    UpdateExpression: 'set info.rating = info.rating + :value',
    ExpressionAttributeValues: { ':value': 1 },
    ReturnValues: 'UPDATED_NEW',
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

// 根据条件更新
export const updateDataByConditional: APIGatewayProxyHandler = async event => {
  const dynamodbDoc = dynamoDBDocumentClient(event);
  const params = {
    TableName: 'Movies',
    Key: { year: 2015, title: 'The Big New Movie' },
    // 删除第 0 位演员（只删除字段里的某个属性）
    UpdateExpression: 'remove info.actors[0]',
    // 演员数大于等于 3 位时
    ConditionExpression: 'size(info.actors) >= :num',
    ExpressionAttributeValues: { ':num': 3 },
    ReturnValues: 'UPDATED_NEW',
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

// 删除数据
export const deleteData: APIGatewayProxyHandler = async event => {
  const dynamodbDoc = dynamoDBDocumentClient(event);
  const params = {
    TableName: 'Movies',
    Key: { year: 2015, title: 'The Big New Movie' },
    ConditionExpression: 'info.rating >= :value',
    ExpressionAttributeValues: { ':value': 5.0 },
  };
  try {
    const result = await dynamodbDoc.delete(params).promise();
    return {
      body: JSON.stringify(result),
      statusCode: 200,
    };
  } catch (e) {
    return getExceptionBody(e);
  }
};

// 根据条件查询数据
export const queryData: APIGatewayProxyHandler = async event => {
  const dynamodbDoc = dynamoDBDocumentClient(event);
  let defaultYear = 1983;
  const { queryStringParameters = {} } = event;
  if (queryStringParameters) {
    const { year = '1984' } = queryStringParameters;
    defaultYear = Number.parseInt(year, 10);
  }
  const params = {
    TableName: 'Movies',
    KeyConditionExpression: '#year=:yyyy',
    ExpressionAttributeNames: { '#year': 'year' },
    ExpressionAttributeValues: { ':yyyy': defaultYear },
  };
  try {
    const result = await dynamodbDoc.query(params).promise();
    return {
      body: JSON.stringify({ code: 200, data: result.Items }),
      statusCode: 200,
    };
  } catch (e) {
    return getExceptionBody(e);
  }
};

// 根据多个条件查询数据
export const queryDataByConditional: APIGatewayProxyHandler = async event => {
  const dynamodbDoc = dynamoDBDocumentClient(event);
  let defaultYear = 1983;
  const { queryStringParameters = {} } = event;
  if (queryStringParameters) {
    const { year = '1984' } = queryStringParameters;
    defaultYear = Number.parseInt(year, 10);
  }
  const params = {
    TableName: 'Movies',
    // 只查询如下 4 个「字段」
    ProjectionExpression: '#year, title, info.genres, info.actors[0]',
    // 键条件表达式
    KeyConditionExpression: '#year = :yyyy and title between :letter1 and :letter2',
    ExpressionAttributeNames: { '#year': 'year' },
    ExpressionAttributeValues: { ':yyyy': defaultYear, ':letter1': 'C', ':letter2': 'K' },
  };
  try {
    const result = await dynamodbDoc.query(params).promise();
    return {
      body: JSON.stringify({ code: 200, data: result.Items }),
      statusCode: 200,
    };
  } catch (e) {
    return getExceptionBody(e);
  }
};

// 根据多个条件查询数据，如：http://localhost:3000/scan?start=1980&end=1989
export const scanData: APIGatewayProxyHandler = async event => {
  const dynamodbDoc = dynamoDBDocumentClient(event);
  let startYear = 1983;
  let endYear = 1986;
  const { queryStringParameters = {} } = event;
  if (queryStringParameters) {
    const { start = '1983', end = '1986' } = queryStringParameters;
    startYear = Number.parseInt(start, 10);
    endYear = Number.parseInt(end, 10);
  }
  const params = {
    TableName: 'Movies',
    // 只查询如下 3 个「字段」
    ProjectionExpression: '#year, title, info.rating',
    // 过虑器表达式
    FilterExpression: '#year between :start and :end',
    ExpressionAttributeNames: { '#year': 'year' },
    ExpressionAttributeValues: { ':start': startYear, ':end': endYear },
  };
  try {
    const result = await dynamodbDoc.scan(params).promise();
    return {
      body: JSON.stringify({ code: 200, data: result.Items }),
      statusCode: 200,
    };
  } catch (e) {
    return getExceptionBody(e);
  }
};
