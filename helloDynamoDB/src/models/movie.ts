export const createTable = {
  AttributeDefinitions: [
    // 主键数据类型
    { AttributeName: 'year', AttributeType: 'N' }, // N Number
    { AttributeName: 'title', AttributeType: 'S' }, // S String
  ],
  KeySchema: [
    // 主键
    { AttributeName: 'year', KeyType: 'HASH' }, // Partition key 分区键
    { AttributeName: 'title', KeyType: 'RANGE' }, // Sort key 排序键
  ],
  ProvisionedThroughput: {
    // DynamoDB 预分配的吞吐量
    ReadCapacityUnits: 20,
    WriteCapacityUnits: 20,
  },
  TableName: 'Movies', // 表名
};

export const orderTable = name => {
  return {
    TableName: name, // 表名
    AttributeDefinitions: [
      // 主键数据类型
      { AttributeName: 'orderId', AttributeType: 'N' }, // N Number
      { AttributeName: 'name', AttributeType: 'S' }, // S String
    ],
    KeySchema: [
      // 主键
      { AttributeName: 'orderId', KeyType: 'HASH' }, // Partition key 分区键
      { AttributeName: 'name', KeyType: 'RANGE' }, // Sort key 排序键
    ],
    ProvisionedThroughput: {
      // DynamoDB 预分配的吞吐量
      ReadCapacityUnits: 20,
      WriteCapacityUnits: 20,
    },
  };
};

export const dropTable = {
  TableName: 'Movies',
};
