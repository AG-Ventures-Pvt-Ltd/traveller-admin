'use client';

import { useState, useCallback } from 'react';
import { Modal, Slider } from 'antd';
import Cropper, { type Area, type Point } from 'react-easy-crop';
import { getCroppedImageFile } from '../utils/cropImage';

interface ImageCropModalProps {
  open: boolean;
  imageSrc: string | null;
  fileName: string;
  /** width / height, e.g. 16/9 to match the blog cover's landscape display on the client */
  aspect?: number;
  onCancel: () => void;
  onCropped: (file: File) => void;
}

export default function ImageCropModal({
  open, imageSrc, fileName, aspect = 16 / 9, onCancel, onCropped,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedArea(croppedAreaPixels);
  }, []);

  const handleOk = async () => {
    if (!imageSrc || !croppedArea) return;
    setSaving(true);
    try {
      const file = await getCroppedImageFile(imageSrc, croppedArea, fileName);
      onCropped(file);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Crop image"
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={saving}
      okText="Save"
      width={560}
      destroyOnHidden
      afterClose={() => { setCrop({ x: 0, y: 0 }); setZoom(1); setCroppedArea(null); }}
    >
      {imageSrc && (
        <>
          <div style={{ position: 'relative', width: '100%', height: 320, background: '#111' }}>
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12, color: '#999' }}>Zoom</span>
            <Slider
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={setZoom}
              style={{ flex: 1 }}
            />
          </div>
        </>
      )}
    </Modal>
  );
}
