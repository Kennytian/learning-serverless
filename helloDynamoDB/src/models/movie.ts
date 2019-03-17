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
    // DynamoDB 吞吐量配置
    ReadCapacityUnits: 20,
    WriteCapacityUnits: 20,
  },
  TableName: 'Movies', // 表名
};

export const dropTable = {
  TableName: 'Movies',
};
