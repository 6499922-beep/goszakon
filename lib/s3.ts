import { S3Client } from "@aws-sdk/client-s3";

const region = process.env.S3_REGION;
const endpoint = process.env.S3_ENDPOINT;
const accessKeyId = process.env.S3_ACCESS_KEY_ID;
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

export const s3Enabled = Boolean(
  region && endpoint && accessKeyId && secretAccessKey
);

export const s3 = s3Enabled
  ? new S3Client({
      region,
      endpoint,
      credentials: {
        accessKeyId: accessKeyId as string,
        secretAccessKey: secretAccessKey as string,
      },
      forcePathStyle: true,
    })
  : null;