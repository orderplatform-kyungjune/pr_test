/* eslint-disable import/no-extraneous-dependencies */
// eslint-disable-next-line import/no-extraneous-dependencies
import mime from 'mime';
import {
  ListObjectsCommand,
  S3Client,
  DeleteObjectsCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from '@aws-sdk/client-cloudfront';

const {
  AWS_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_BUCKET_NAME,
} = process.env;

const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

export function getObjects() {
  const getCommand = new ListObjectsCommand({ Bucket: AWS_BUCKET_NAME });
  return s3Client.send(getCommand);
}

export function putObject(dirName, fileName, data) {
  const putCommand = new PutObjectCommand({
    Bucket: AWS_BUCKET_NAME,
    Key: dirName ? `${dirName}/${fileName}` : fileName,
    Body: data,
    ContentType: mime.getType(fileName),
  });
  return s3Client.send(putCommand);
}

export function deleteObjects(contents) {
  const deleteCommand = new DeleteObjectsCommand({
    Bucket: AWS_BUCKET_NAME,
    Delete: { Objects: contents },
  });
  s3Client.send(deleteCommand);
}

export async function invalidateCloudFrontCache(tryCount, cloudFrontId) {
  const cloudfront = new CloudFrontClient({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
  });

  const command = new CreateInvalidationCommand({
    DistributionId: cloudFrontId,
    InvalidationBatch: {
      CallerReference: `${+new Date()}`,
      Paths: {
        Items: ['/*'],
        Quantity: 1,
      },
    },
  });

  try {
    await cloudfront.send(command);
  } catch (error) {
    if (tryCount > 0) {
      invalidateCloudFrontCache(tryCount - 1, cloudFrontId);
    } else {
      throw new Error(error);
    }
  }
}
