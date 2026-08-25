"use client";
import { useState } from "react";
import axios from "axios";
import { message } from "antd";
import baseAPI from "@/services/baseApi";
import { api } from "@/common/constants/api.urls";
import { PresignedUrlResponse, UploadResult, UseS3UploadReturn } from "@/common/types";

const generateRandomString = (length: number = 16): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const generateUniqueFilename = (originalFile: File): string => {
  const extension = originalFile.name.split(".").pop() || "";
  const randomString = generateRandomString(8);
  return `${randomString}.${extension}`;
};

const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 0.8;
const SKIP_BELOW_BYTES = 500 * 1024; // already small enough, don't bother

// Downscale + recompress oversized photos client-side before they ever hit S3 —
// uploads here go straight to CloudFront with no server-side resizing step.
const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
      resolve(file);
      return;
    }
    if (file.size < SKIP_BELOW_BYTES) {
      resolve(file);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
      const width = Math.round(img.width * scale);
      const height = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            resolve(file);
            return;
          }
          resolve(new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" }));
        },
        "image/jpeg",
        JPEG_QUALITY,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };
    img.src = objectUrl;
  });
};

const getPresignedUrl = async (
  fileName: string,
  fileType: string,
  key?: string
): Promise<PresignedUrlResponse> => {
  try {
    let url = api.getS3UploadUrl;
    const params = new URLSearchParams();
    if (key) {
      params.append('key', key);
    }

    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    const response = await baseAPI.post<{ data: PresignedUrlResponse }>(
      url,
      {
        fileName,
        fileType,
      }
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to get presigned URL"
      );
    }
    throw error;
  }
};

const uploadToS3 = async (
  presignedUrl: string,
  file: File
): Promise<void> => {
  try {
    await axios.put(presignedUrl, file, {
      headers: {
        "Content-Type": file.type,
      },
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.message || "Failed to upload file to S3");
    }
    throw error;
  }
};

const getS3Path = (presignedUrl: string): string => {
  const urlWithoutQuery = presignedUrl.split("?")[0];
  try {
    const url = new URL(urlWithoutQuery);
    return url.pathname;
  } catch {
    return urlWithoutQuery;
  }
};

const useS3Upload = (): UseS3UploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | undefined>();

  const uploadImages = async (files: File[], key?: string): Promise<UploadResult[]> => {
    if (!files || files.length === 0) {
      message.error("No files provided for upload");
      return [];
    }

    setIsUploading(true);
    setProgress(0);
    setError(undefined);

    const results: UploadResult[] = [];
    const totalFiles = files.length;

    try {
      const uploadPromises = files.map(async (file, index) => {
        try {
          // Downscale/compress before it ever leaves the browser
          const uploadFile = await compressImage(file);

          const uniqueFilename = generateUniqueFilename(uploadFile);

          const { url: presignedUrl } = await getPresignedUrl(
            uniqueFilename,
            uploadFile.type,
            key
          );

          await uploadToS3(presignedUrl, uploadFile);

          const s3Path = getS3Path(presignedUrl);

          setProgress(((index + 1) / totalFiles) * 100);

          return {
            success: true,
            url: s3Path,
            originalFile: file,
          };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Upload failed";

          console.error(`useS3Upload/uploadImages: uploading image ${file.name} — ${errorMessage}`);

          return {
            success: false,
            url: "",
            originalFile: file,
            error: errorMessage,
          };
        }
      });

      const uploadResults = await Promise.all(uploadPromises);
      results.push(...uploadResults);

      const failedUploads = uploadResults.filter((r) => !r.success);

      if (failedUploads.length > 0) {
        message.error(
          `${failedUploads.length} out of ${totalFiles} images failed to upload`
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";

      message.error(`Upload error: ${errorMessage}`);
      console.error(`useS3Upload/uploadImages: uploading multiple images — ${errorMessage}`);

      setError(errorMessage);
    } finally {
      setIsUploading(false);
      setProgress(0);
    }

    return results;
  };

  return {
    uploadImages,
    isUploading,
    progress,
    error,
  };
};

export default useS3Upload;
