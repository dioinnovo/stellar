import { NextRequest, NextResponse } from 'next/server';
import { uploadClaimDocument, deleteFile, getSignedUrl } from '@/lib/gcs/storage';

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed file types
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const claimId = resolvedParams.id;

    if (!claimId) {
      return NextResponse.json(
        { error: 'Claim ID is required' },
        { status: 400 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed. Please upload PDF, images, or Office documents.' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Google Cloud Storage
    const documentMetadata = await uploadClaimDocument(
      claimId,
      file.name,
      buffer,
      file.type
    );

    // In a real application, you would also save the document metadata to your database here
    // For now, we'll just return the metadata

    return NextResponse.json({
      success: true,
      document: documentMetadata,
      message: 'Document uploaded successfully',
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: 'Failed to upload document. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const claimId = resolvedParams.id;
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('fileName');

    if (!claimId) {
      return NextResponse.json(
        { error: 'Claim ID is required' },
        { status: 400 }
      );
    }

    if (fileName) {
      // Get a signed URL for a specific file
      const gcsFileName = `claims/${claimId}/documents/${fileName}`;
      const signedUrl = await getSignedUrl(gcsFileName);

      return NextResponse.json({
        success: true,
        url: signedUrl,
      });
    }

    // In a real application, you would fetch the list of documents from your database
    // For now, return a placeholder response
    return NextResponse.json({
      success: true,
      documents: [],
      message: 'Document list would be fetched from database',
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const claimId = resolvedParams.id;
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('fileName');

    if (!claimId || !fileName) {
      return NextResponse.json(
        { error: 'Claim ID and file name are required' },
        { status: 400 }
      );
    }

    // Delete from Google Cloud Storage
    const gcsFileName = `claims/${claimId}/documents/${fileName}`;
    await deleteFile(gcsFileName);

    // In a real application, you would also delete the document record from your database

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}