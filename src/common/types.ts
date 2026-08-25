export interface PresignedUrlResponse {
  url: string
  key: string
}

export interface UploadResult {
  success: boolean
  url: string
  originalFile: File
  error?: string
}

export interface UseS3UploadReturn {
  uploadImages: (files: File[], key?: string) => Promise<UploadResult[]>
  isUploading: boolean
  progress: number
  error?: string
}
