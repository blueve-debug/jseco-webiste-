import { NextRequest, NextResponse } from 'next/server';
import { adminStorage } from '@/lib/firebase-admin';
import { requireAuth } from '@/lib/auth';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'model/gltf-binary',
  'model/gltf+json',
  'application/octet-stream',
]);

const ALLOWED_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.glb',
  '.gltf',
]);

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 Megabytes

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) return auth.response;

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds maximum permitted limit (15MB)' },
        { status: 400 }
      );
    }

    const lowerName = file.name.toLowerCase();
    const extension = lowerName.slice(lowerName.lastIndexOf('.'));

    if (!ALLOWED_EXTENSIONS.has(extension) || !ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file format. Only JPEG, PNG, WEBP, GIF images and GLB/GLTF 3D models are allowed.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const bucket = adminStorage.bucket();
    const safeBaseName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/\.+/g, '.')
      .slice(0, 50);

    const filename = `uploads/${Date.now()}_${safeBaseName}`;
    const blob = bucket.file(filename);

    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.type,
      },
    });

    await new Promise<void>((resolve, reject) => {
      blobStream.on('error', (err) => reject(err));
      blobStream.on('finish', () => resolve());
      blobStream.end(buffer);
    });

    // Generate signed URL valid until 2099
    const [url] = await blob.getSignedUrl({
      action: 'read',
      expires: '12-31-2099',
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
