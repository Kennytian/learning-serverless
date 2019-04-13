import { S3, config } from 'aws-sdk';
import stream from 'stream';

config.region = 'ap-northeast-2';
const s3 = new S3();

class S3Handler {
  public readStream({ Bucket, Key }) {
    return s3.getObject({ Bucket, Key }).createReadStream();
  }

  public writeStream({ Bucket, Key }) {
    const passThrough = new stream.PassThrough();
    return {
      writeStream: passThrough,
      uploaded: s3
        .upload({
          ContentType: 'image/png',
          Body: passThrough,
          Bucket,
          Key,
        })
        .promise(),
    };
  }
}

export const s3Handler = new S3Handler();
