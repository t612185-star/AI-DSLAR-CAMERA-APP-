export interface CapturedImage {
  id: string;
  dataUrl: string; // Base64 image data
  timestamp: number;
  aiDescription?: string;
  isEdited?: boolean;
  originalId?: string; // If this is an edited version
}

export enum AppMode {
  CAMERA = 'CAMERA',
  EDITOR = 'EDITOR',
  GALLERY = 'GALLERY'
}

export enum FilterType {
  NONE = 'none',
  VIVID = 'vivid',
  MONO = 'mono',
  WARM = 'warm',
  COOL = 'cool',
  CYBER = 'cyber'
}

export interface ProcessingState {
  isProcessing: boolean;
  statusMessage: string;
}