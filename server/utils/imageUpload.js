import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = 'public/uploads/events';

export async function uploadImage(file) {
  try {
    // Create unique filename
    const extension = file.filename.split('.').pop();
    const filename = `${uuidv4()}.${extension}`;
    
    // Ensure upload directory exists
    await ensureDir(UPLOAD_DIR);
    
    // Write file
    const filepath = join(process.cwd(), UPLOAD_DIR, filename);
    await writeFile(filepath, file.data);
    
    // Return public URL
    return `/uploads/events/${filename}`;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
}

async function ensureDir(dirPath) {
  const fs = await import('fs/promises');
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
} 