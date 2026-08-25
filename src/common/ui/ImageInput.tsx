'use client';

import React, { useRef, useState } from 'react';
import { UploadOutlined, CloseOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import useS3Upload from '../hooks/useS3Upload';
import ImageCropModal from './ImageCropModal';

const CF = process.env.NEXT_PUBLIC_CLOUDFRONT_URL ?? '';

interface ImageInputProps {
  /** Current S3 path or full URL, as stored on the record (e.g. blog.coverImage) */
  value?: string;
  /** Injected by antd Form.Item when used as a Form.Item child; optional for standalone use */
  onChange?: (url: string) => void;
  text?: string;
  className?: string;
  /** width / height the client renders this image at — defaults to the blog cover's 16:9 */
  cropAspect?: number;
}

/** Single-image S3 upload button + preview. Crops to `cropAspect` before uploading (same compression pipeline as traveller-client). */
const ImageInput: React.FC<ImageInputProps> = ({
  value,
  onChange = () => {},
  text = 'Upload image',
  className = '',
  cropAspect = 16 / 9,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImages, isUploading } = useS3Upload();
  const [pendingFile, setPendingFile] = useState<{ src: string; name: string } | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setPendingFile({ src: URL.createObjectURL(file), name: file.name });
  };

  const handleCropped = async (croppedFile: File) => {
    if (pendingFile) URL.revokeObjectURL(pendingFile.src);
    setPendingFile(null);
    const [result] = await uploadImages([croppedFile]);
    if (result?.success) onChange(result.url);
  };

  const handleCropCancel = () => {
    if (pendingFile) URL.revokeObjectURL(pendingFile.src);
    setPendingFile(null);
  };

  const previewSrc = value
    ? value.startsWith('http')
      ? value
      : `${CF}${value}`
    : null;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
      />
      {previewSrc && (
        <div className="relative w-full max-w-xs">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewSrc} alt="Cover preview" className="w-full h-32 object-cover rounded border border-white/20" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
            aria-label="Remove image"
          >
            <CloseOutlined style={{ fontSize: 10 }} />
          </button>
        </div>
      )}
      <Button
        icon={<UploadOutlined />}
        loading={isUploading}
        onClick={() => fileInputRef.current?.click()}
      >
        {isUploading ? 'Uploading...' : text}
      </Button>

      <ImageCropModal
        open={!!pendingFile}
        imageSrc={pendingFile?.src ?? null}
        fileName={pendingFile?.name ?? 'image.jpg'}
        aspect={cropAspect}
        onCancel={handleCropCancel}
        onCropped={handleCropped}
      />
    </div>
  );
};

export default ImageInput;
