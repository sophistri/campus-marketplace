import fs from 'fs/promises';
import path from 'path';

// listing.photos stores paths like "/uploads/listings/abc123.jpg"
// (the URL path, not a filesystem path) — convert and delete each file
export async function deleteListingPhotos(photoPaths = []) {
  await Promise.all(
    photoPaths.map(async (photoUrl) => {
      const relativePath = photoUrl.replace(/^\/uploads\//, '');
      const filePath = path.resolve('uploads', relativePath);

      try {
        await fs.unlink(filePath);
      } catch (err) {
        // ENOENT = file already missing — safe to ignore, nothing else is
        if (err.code !== 'ENOENT') {
          console.error(`Failed to delete photo file: ${filePath}`, err);
        }
      }
    })
  );
}