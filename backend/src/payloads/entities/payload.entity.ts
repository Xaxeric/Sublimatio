export type PayloadType = 'file' | 'link' | 'text';

export class Payload {
  /**
   * Unique identifier for the payload (e.g., 'sub-f-01', 'user-abc')
   */
  id: string;

  /**
   * Human-readable name / label for the payload
   */
  name: string;

  /**
   * Ephemeral payload classification: 'file', 'link', or 'text'
   */
  type: PayloadType;

  /**
   * Text snippet content or simulated file buffer representation
   */
  content?: string;

  /**
   * Destination URL if type is 'link'
   */
  url?: string;

  /**
   * Originating peer device (e.g. 'Desktop (Workstation)', 'Mobile (Pixel 8)')
   */
  device: string;

  /**
   * Total Time-To-Live configured in seconds
   */
  totalTTL: number;

  /**
   * Dynamic remaining Time-To-Live in seconds before volatile sublimation
   */
  remainingTTL: number;

  /**
   * Human-readable file / payload size string (e.g., '184 KB', '5.1 MB')
   */
  size?: string;

  /**
   * MIME type format (e.g., 'application/json', 'text/plain')
   */
  mime?: string;

  /**
   * Zero-knowledge cryptographic SHA-256 integrity hash
   */
  hash: string;

  /**
   * Flag indicating whether payload is pinned from auto-sublimation
   */
  isPinned: boolean;

  /**
   * Timestamp string when payload entered the buffer
   */
  createdAt: string;
}
