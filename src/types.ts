export type ActiveTool = 'pencil' | 'highlighter' | 'eraser' | 'text' | 'translate' | 'sound' | 'select';

export interface SoundMarker {
  id: string;
  pageNumber: number; // 1-indexed
  x: number; // relative coordinate (0 to 100)
  y: number; // relative coordinate (0 to 100)
  audioSrc: string; // URL or base64
  audioName: string;
}

export interface DrawingStroke {
  id: string;
  pageNumber: number;
  tool: 'pencil' | 'highlighter';
  color: string;
  width: number;
  points: { x: number; y: number }[];
}

export interface DrawingText {
  id: string;
  pageNumber: number;
  text: string;
  x: number;
  y: number;
  color: string;
  fontSize: number;
}

export interface UnitInfo {
  name: string;
  page: number; // 1-indexed page in PDF
}

export interface TranslationTooltip {
  word: string;
  translation: string;
  frenchDefinition?: string;
  x: number; // pixel position for rendering tooltip
  y: number; // pixel position for rendering tooltip
  loadingFrench?: boolean;
}

export interface SaveState {
  soundMarkers: SoundMarker[];
  drawingStrokes: DrawingStroke[];
  drawingTexts: DrawingText[];
}
