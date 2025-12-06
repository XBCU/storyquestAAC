"use client";

import React, { forwardRef, useImperativeHandle } from "react";

type TranscriberHandle = {
  transcribeAudio: (audioBlob: Blob | File, options?: any) => Promise<any>;
};

const TranscriberClient = forwardRef<TranscriberHandle, {}>((_props, ref) => {
  useImperativeHandle(
    ref,
    () => ({
      async transcribeAudio(audioBlob: Blob | File, options = {}) {
        if (!audioBlob) throw new Error("No audio provided");
        try {
          const mod = await import("aac-speech-recognition/browser");
          if (mod && typeof mod.transcribeAudio === "function") {
            return await mod.transcribeAudio(audioBlob as any, options);
          }
          throw new Error("transcribeAudio not available on module");
        } catch (err) {
          console.error("Transcription import failed:", err);
          throw err;
        }
      },
    }),
    []
  );

  return null;
});

export default TranscriberClient;
