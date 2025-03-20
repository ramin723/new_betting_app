import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

export async function uploadToS3(file: Buffer, key: string, contentType: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME || '',
    Key: key,
    Body: file,
    ContentType: contentType
  });

  await s3Client.send(command);

  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

export async function getSignedUrlForUpload(key: string, contentType: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME || '',
    Key: key,
    ContentType: contentType
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
} 