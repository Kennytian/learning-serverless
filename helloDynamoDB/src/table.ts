import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import getDynamoClient from "./dynamo-client";

export const create: APIGatewayProxyHandler = async (event) => {
  const dynamodb = getDynamoClient(event);
  const params = {
    AttributeDefinitions: [ // 主键数据类型
      { AttributeName: "year", AttributeType: "N" }, // N Number
      { AttributeName: "title", AttributeType: "S" },   // S String
    ],
    KeySchema: [       // 主键
      { AttributeName: "year", KeyType: "HASH" },  // Partition key 分区键
      { AttributeName: "title", KeyType: "RANGE" },  // Sort key 排序键
    ],
    ProvisionedThroughput: { // DynamoDB 吞吐量配置
      ReadCapacityUnits: 20,
      WriteCapacityUnits: 20,
    },
    TableName: "Movies", // 表名
  };
  try {
    const { TableDescription = {} } = await dynamodb.createTable(params).promise();
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
