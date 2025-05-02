import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a unique room ID
 */
export const generateRoomId = (): string => {
  return uuidv4();
};

/**
 * Checks if WebRTC is supported in the current browser
 */
export const isWebRTCSupported = (): boolean => {
  return !!(
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia &&
    window.RTCPeerConnection
  );
};

/**
 * Parses room ID from URL
 */
export const parseRoomId = (url: string): string | null => {
  const urlObj = new URL(url);
  const pathParts = urlObj.pathname.split('/');
  if (pathParts.length >= 3 && pathParts[1] === 'room') {
    return pathParts[2];
  }
  return null;
};

/**
 * Creates a shareable room URL
 */
export const createShareableLink = (roomId: string, isCreator: boolean = false): string => {
  return `${window.location.origin}/room/${roomId}?isCreator=${isCreator}`;
};