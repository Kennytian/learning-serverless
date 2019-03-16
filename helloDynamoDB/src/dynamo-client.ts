import { DynamoDB } from "aws-sdk";

const getDynamoClient = (event, port = 8000) => {
  if ("isOffline" in event && event.isOffline) {
    return new DynamoDB({ endpoint: `http://localhost:${port}` });
  }
  return new DynamoDB();
};

export default getDynamoClient;
