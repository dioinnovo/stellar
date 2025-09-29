import { Storage } from '@google-cloud/storage';
import { Readable } from 'stream';

// Initialize Google Cloud Storage client
let storage: Storage | null = null;

// Get storage instance (singleton pattern)
function getStorage(): Storage {
  if (!storage) {
    const projectId = process.env.GCS_PROJECT_ID;
    const keyFilename = process.env.GCS_KEY_FILE; // Path to service account key file
    const credentials = process.env.GCS_SERVICE_ACCOUNT_KEY
      ? JSON.parse(Buffer.from(process.env.GCS_SERVICE_ACCOUNT_KEY, 'base64').toString())
      : undefined;

    if (!projectId) {
      throw new Error('GCS_PROJECT_ID environment variable is not set');
    }

    storage = new Storage({
      projectId,
      ...(keyFilename && { keyFilename }),
      ...(credentials && { credentials }),
    });
  }
  return storage;
}

// Get bucket instance
function getBucket() {
  const bucketName = process.env.GCS_BUCKET_NAME;
  if (!bucketName) {
    throw new Error('GCS_BUCKET_NAME environment variable is not set');
  }
  return getStorage().bucket(bucketName);
}

export interface UploadOptions {
  fileName: string;
  file: Buffer | Readable;
  contentType?: string;
  metadata?: Record<string, string>;
  isPublic?: boolean;
}

export interface DocumentMetadata {
  id: string;
  fileName: string;
  url: string;
  contentType: string;
  size: number;
  uploadedAt: Date;
  claimId: string;
}

/**
 * Upload a file to Google Cloud Storage
 */
export async function uploadFile({
  fileName,
  file,
  contentType = 'application/octet-stream',
  metadata = {},
  isPublic = false,
}: UploadOptions): Promise<string> {
  try {
    const bucket = getBucket();
    const blob = bucket.file(fileName);

    const stream = blob.createWriteStream({
      resumable: false,
      metadata: {
        contentType,
        metadata,
      },
    });

    return new Promise((resolve, reject) => {
      stream.on('error', (error) => {
        console.error('Error uploading file:', error);
        reject(error);
      });

      stream.on('finish', async () => {
        try {
          // Make the file public if requested
          if (isPublic) {
            await blob.makePublic();
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
            resolve(publicUrl);
          } else {
            // Generate a signed URL for private files (expires in 7 days)
            const [signedUrl] = await blob.getSignedUrl({
              version: 'v4',
              action: 'read',
              expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
            });
            resolve(signedUrl);
          }
        } catch (error) {
          reject(error);
        }
      });

      // Handle Buffer or Readable stream
      if (Buffer.isBuffer(file)) {
        stream.end(file);
      } else if (file instanceof Readable) {
        file.pipe(stream);
      } else {
        reject(new Error('File must be a Buffer or Readable stream'));
      }
    });
  } catch (error) {
    console.error('Error in uploadFile:', error);
    throw error;
  }
}

/**
 * Delete a file from Google Cloud Storage
 */
export async function deleteFile(fileName: string): Promise<void> {
  try {
    const bucket = getBucket();
    await bucket.file(fileName).delete();
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

/**
 * Get a signed URL for a file
 */
export async function getSignedUrl(
  fileName: string,
  expiresInMinutes: number = 60
): Promise<string> {
  try {
    const bucket = getBucket();
    const [signedUrl] = await bucket.file(fileName).getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + expiresInMinutes * 60 * 1000,
    });
    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw error;
  }
}

/**
 * Check if a file exists in Google Cloud Storage
 */
export async function fileExists(fileName: string): Promise<boolean> {
  try {
    const bucket = getBucket();
    const [exists] = await bucket.file(fileName).exists();
    return exists;
  } catch (error) {
    console.error('Error checking file existence:', error);
    return false;
  }
}

/**
 * Get file metadata
 */
export async function getFileMetadata(fileName: string) {
  try {
    const bucket = getBucket();
    const [metadata] = await bucket.file(fileName).getMetadata();
    return metadata;
  } catch (error) {
    console.error('Error getting file metadata:', error);
    throw error;
  }
}

/**
 * Upload a document for a claim
 */
export async function uploadClaimDocument(
  claimId: string,
  fileName: string,
  file: Buffer | Readable,
  contentType: string = 'application/pdf'
): Promise<DocumentMetadata> {
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const gcsFileName = `claims/${claimId}/documents/${timestamp}-${sanitizedFileName}`;

  const url = await uploadFile({
    fileName: gcsFileName,
    file,
    contentType,
    metadata: {
      claimId,
      originalFileName: fileName,
      uploadedAt: new Date().toISOString(),
    },
  });

  return {
    id: `${claimId}-${timestamp}`,
    fileName,
    url,
    contentType,
    size: Buffer.isBuffer(file) ? file.length : 0,
    uploadedAt: new Date(),
    claimId,
  };
}