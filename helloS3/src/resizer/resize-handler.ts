import sharp from 'sharp';
import { s3Handler } from './s3Handler';

class ResizerHandler {
  public async process(event) {
    const { image, size } = event.pathParameters;

    return await this.resize(size, image);
  }

  private async resize(size, path) {
    try {
      const sizeArray = size.split('x');
      const [width, height] = sizeArray;
      const newKey = `${width}x${height}/${path}`;

      const bucket = process.env.BUCKET;
      const streamResize = sharp()
        .resize(width, height)
        .toFormat('png');

      const readStream = s3Handler.readStream({ Bucket: bucket, Key: path });
      const { writeStream, uploaded } = s3Handler.writeStream({ Bucket: bucket, Key: newKey });

      readStream.pipe(streamResize).pipe(writeStream);

      await uploaded;

      return newKey;
    } catch (error) {
      throw new Error(error);
    }
  }
}

export const resizeHandler = new ResizerHandler();
