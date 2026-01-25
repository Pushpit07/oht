// WebRTC/MediaMTX Server Configuration
// Change these values to match your setup
const WEBRTC_SERVER = 'hypernitrogenous-conner-myrtaceous.ngrok-free.dev';
const WEBRTC_PORT = 443;
const WEBRTC_PROTOCOL: 'http' | 'https' = 'https';

export interface WebRTCConfig {
  serverIp: string;
  serverPort: number;
  protocol: 'http' | 'https';
  reconnectInterval: number;
  connectionTimeout: number;
}

export const getWebRTCConfig = (): WebRTCConfig => ({
  serverIp: WEBRTC_SERVER,
  serverPort: WEBRTC_PORT,
  protocol: WEBRTC_PROTOCOL,
  reconnectInterval: 5000,
  connectionTimeout: 10000,
});

export const buildWHEPUrl = (streamName: string): string => {
  // Omit port for standard ports (443 for https, 80 for http)
  const isStandardPort =
    (WEBRTC_PROTOCOL === 'https' && WEBRTC_PORT === 443) ||
    (WEBRTC_PROTOCOL === 'http' && WEBRTC_PORT === 80);
  const portPart = isStandardPort ? '' : `:${WEBRTC_PORT}`;
  return `${WEBRTC_PROTOCOL}://${WEBRTC_SERVER}${portPart}/${streamName}/whep`;
};
