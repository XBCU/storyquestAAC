declare module 'aac-speech-recognition/browser' {
  export interface TranscriptionResult {
    success: boolean;
    transcription: string | null;
    confidenceScore: number | null;
    aggregatedConfidenceScore: number | null;
    selectedApi: string | null;
    apiResults: any;
    duration: number | null;
    format: string | null;
    sampleRate: number | null;
    error?: {
      code: string;
      message: string;
    };
  }

  export interface TranscriptionOptions {
    apiUrl?: string;
    speechApis?: string;
  }

  export function transcribeAudio(
    audioBlob: Blob | File,
    options?: TranscriptionOptions
  ): Promise<TranscriptionResult>;
}

