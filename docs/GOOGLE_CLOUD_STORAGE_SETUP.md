# Google Cloud Storage Setup Guide

This guide will help you set up Google Cloud Storage (GCS) for document uploads in the Stellar Intelligence Platform.

## Prerequisites

- Google Cloud account with billing enabled
- Google Cloud CLI installed (optional, for local testing)
- Node.js project with the necessary dependencies installed

## Setup Steps

### 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com)
2. Click "Select a project" → "New Project"
3. Enter a project name (e.g., "stellar-documents")
4. Note your Project ID (you'll need this later)

### 2. Enable Required APIs

In the Google Cloud Console:
1. Navigate to "APIs & Services" → "Library"
2. Search for and enable:
   - **Cloud Storage API**
   - **Cloud Storage JSON API**

### 3. Create a Storage Bucket

1. Navigate to "Cloud Storage" → "Buckets"
2. Click "Create Bucket"
3. Configure your bucket:
   - **Name**: Choose a globally unique name (e.g., `stellar-documents-bucket`)
   - **Location**: Choose a region close to your users
   - **Storage class**: Standard (recommended for frequently accessed files)
   - **Access control**: Uniform (recommended)
   - **Protection tools**: Configure based on your needs

### 4. Create a Service Account

1. Navigate to "IAM & Admin" → "Service Accounts"
2. Click "Create Service Account"
3. Configure:
   - **Name**: `stellar-storage-service`
   - **ID**: Auto-generated is fine
   - **Description**: "Service account for document uploads"
4. Click "Create and Continue"
5. Grant roles:
   - **Storage Object Admin** (for full control over objects)
   - OR **Storage Object Creator** (for upload only)
   - OR **Storage Object Viewer** (for read-only access)
6. Click "Continue" → "Done"

### 5. Generate Service Account Key

1. Click on the created service account
2. Go to the "Keys" tab
3. Click "Add Key" → "Create new key"
4. Choose "JSON" format
5. Download the key file (keep this secure!)

### 6. Configure Environment Variables

Update your `.env.local` file with the following:

```bash
# Google Cloud Storage Configuration
GCS_PROJECT_ID=your-project-id-here
GCS_BUCKET_NAME=your-bucket-name-here

# Option 1: Use the key file path (for local development)
GCS_KEY_FILE=/absolute/path/to/your-service-account-key.json

# Option 2: Use base64 encoded key (for production/deployment)
# Generate with: cat service-account-key.json | base64 | tr -d '\n'
GCS_SERVICE_ACCOUNT_KEY=your-base64-encoded-key-here
```

### 7. Configure CORS (if needed)

If you need direct browser uploads, configure CORS:

1. Create a `cors.json` file:

```json
[
  {
    "origin": ["http://localhost:3000", "https://yourdomain.com"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "responseHeader": ["*"],
    "maxAgeSeconds": 3600
  }
]
```

2. Apply CORS configuration using gsutil:

```bash
gsutil cors set cors.json gs://your-bucket-name
```

### 8. Set Bucket Permissions (Optional)

For public read access (if needed):

```bash
gsutil iam ch allUsers:objectViewer gs://your-bucket-name
```

For authenticated users only (recommended):

```bash
# Keep default - only service account has access
```

## Security Best Practices

### 1. Service Account Key Management

- **Never commit** the service account key file to version control
- Use environment variables or secret management services
- Rotate keys regularly
- Use the base64 encoded version for production deployments

### 2. Bucket Security

- Enable **Uniform bucket-level access**
- Use **signed URLs** for temporary access (implemented in our code)
- Set appropriate **lifecycle policies** to auto-delete old files
- Enable **versioning** for important documents
- Configure **retention policies** if required for compliance

### 3. Access Control

- Follow the **principle of least privilege**
- Use separate service accounts for different environments
- Regularly audit IAM permissions
- Use **VPC Service Controls** for additional security

## Testing the Integration

### 1. Test Upload via API

```bash
curl -X POST http://localhost:3000/api/claims/123/documents \
  -F "file=@test-document.pdf" \
  -H "Accept: application/json"
```

### 2. Test in the Application

1. Navigate to a claim detail page
2. Go to the "Documents" tab
3. Click "Upload Document"
4. Select a file and verify it uploads successfully

### 3. Verify in Google Cloud Console

1. Go to Cloud Storage → Buckets → Your Bucket
2. Check the folder structure: `claims/{claimId}/documents/`
3. Verify files are uploaded with correct metadata

## Monitoring and Logging

### 1. Enable Audit Logs

1. Navigate to "IAM & Admin" → "Audit Logs"
2. Enable logs for Cloud Storage
3. Configure log retention as needed

### 2. Set Up Monitoring

1. Navigate to "Monitoring" → "Dashboards"
2. Create alerts for:
   - High error rates
   - Unusual traffic patterns
   - Storage quota usage

### 3. Cost Management

1. Set up budget alerts in "Billing" → "Budgets & alerts"
2. Monitor storage costs regularly
3. Implement lifecycle policies to delete old files

## Troubleshooting

### Common Issues and Solutions

#### 1. Authentication Error

**Error**: "Could not load the default credentials"

**Solution**:
- Verify environment variables are set correctly
- Check if the service account key file exists and is readable
- Ensure the base64 encoding is correct (no line breaks)

#### 2. Permission Denied

**Error**: "403 Forbidden"

**Solution**:
- Verify service account has correct IAM roles
- Check bucket permissions
- Ensure project ID and bucket name are correct

#### 3. File Size Limits

**Error**: "File size exceeds maximum allowed"

**Solution**:
- Our API limits files to 10MB by default
- Modify `MAX_FILE_SIZE` in `/api/claims/[id]/documents/route.ts` if needed
- Consider implementing chunked uploads for large files

#### 4. CORS Issues

**Error**: "CORS policy blocked"

**Solution**:
- Configure CORS on the bucket (see step 7 above)
- Verify allowed origins match your domain

## Production Deployment

### Vercel Deployment

1. Add environment variables in Vercel dashboard
2. Use the base64 encoded service account key
3. Ensure all GCS environment variables are set

### Docker Deployment

```dockerfile
# Add to Dockerfile
ENV GCS_PROJECT_ID=${GCS_PROJECT_ID}
ENV GCS_BUCKET_NAME=${GCS_BUCKET_NAME}
ENV GCS_SERVICE_ACCOUNT_KEY=${GCS_SERVICE_ACCOUNT_KEY}
```

## Cleanup (Optional)

To remove all GCS resources:

```bash
# Delete bucket and all contents
gsutil -m rm -r gs://your-bucket-name

# Delete service account (via Console or gcloud CLI)
gcloud iam service-accounts delete stellar-storage-service@your-project.iam.gserviceaccount.com
```

## Support

For issues or questions:
- Check Google Cloud Status: https://status.cloud.google.com
- Review GCS documentation: https://cloud.google.com/storage/docs
- Check application logs for detailed error messages