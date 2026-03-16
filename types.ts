export interface SunglassesStyle {
  id: string;
  name: string;
  description: string;
  prompt: string;
  iconClass: string; // Tailwind classes for a representative color/shape
}

export type AppStep = 'intro' | 'camera' | 'review' | 'select' | 'processing' | 'result';

export interface ProcessingState {
  status: 'idle' | 'uploading' | 'generating' | 'complete' | 'error';
  message: string;
}
