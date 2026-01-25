import type { CameraPosition } from '@/types/oht';

// Maps camera positions to MediaMTX stream names
export const CAMERA_STREAM_MAP: Record<CameraPosition, string> = {
  front: 'cam1',
  rear: 'cam2',
  down: 'cam3',
};

export const getCameraStreamName = (position: CameraPosition): string => {
  return CAMERA_STREAM_MAP[position] || position;
};
