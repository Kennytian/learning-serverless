const AWS = require('aws-sdk');
const fs = require('fs');

const importData = () => {
  const dynamoDBDoc = new AWS.DynamoDB.DocumentClient({
    region: 'localhost',
    endpoint: `http://localhost:8000`,
  });
  const dataContent = fs.readFileSync('movie-data.json', 'utf-8');
  if (!dataContent) {
    console.error('movie-data.json format is incorrect');
    return '';
  }
  try {
    const allMovies = JSON.parse(dataContent);
    allMovies.forEach(async movie => {
      const params = {
        TableName: 'Movies',
        Item: {
          year: movie.year,
          title: movie.title,
          info: movie.info,
        },
      };
      // put data one by one
      await dynamoDBDoc.put(params).promise();
    });
    console.log('All movies data import to DynamoDB');
  } catch (e) {
    console.error(e);
  }
};

importData();
