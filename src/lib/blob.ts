import 'server-only'
import { put, del } from '@vercel/blob'

const MAX_PHOTO_SIZE = 4 * 1024 * 1024 // 4MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']

export async function uploadStudentPhoto(file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Photo must be a JPEG, PNG, or WebP image.')
  }
  if (file.size > MAX_PHOTO_SIZE) {
    throw new Error('Photo must be smaller than 4MB.')
  }

  const blob = await put(`students/${file.name}`, file, {
    access: 'public',
    addRandomSuffix: true,
  })

  return blob.url
}

export async function deleteStudentPhoto(url: string) {
  try {
    await del(url)
  } catch {
    // Best-effort cleanup — don't fail the calling action over an orphaned blob.
  }
}
