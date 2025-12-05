//StoryQuest/app/Components/AACAudioRecorder.tsx

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";

interface AACAudioRecorderProps {
  onSelect: (audioFile: File) => void;
  backgroundColor?: string;
  buttonColor?: string;
  blockButtons?: boolean;
}

const AACAudioRecorder: React.FC<AACAudioRecorderProps> = ({
  onSelect,
  backgroundColor = "#b4fcdc",
  buttonColor = "#63d2cb",
  blockButtons = false,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    if (blockButtons) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const audioFile = new File([audioBlob], "recording.wav", { type: "audio/wav" });
        onSelect(audioFile);
        
        // Stop all tracks to release the microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setHasPermission(false);
      alert("Microphone access denied. Please allow microphone access to use this feature.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const blockAACButtonOverlayStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 10,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    cursor: "not-allowed",
  };

  return (
    <div
      className="p-2 border border-gray-300 rounded-lg shadow-md transform transition duration-500 hover:scale-105 relative"
      style={{ backgroundColor }}
    >
      {/* Block overlay */}
      {blockButtons && <div style={blockAACButtonOverlayStyle}></div>}

      <h3 className="text-xl font-patrick-hand font-bold mb-2 text-center text-black">
        AAC Audio Recorder
      </h3>

      <div className="flex flex-col items-center gap-4">
        {isRecording ? (
          <>
            <div className="flex flex-col items-center">
              <motion.div
                className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <span className="text-4xl text-white">🎤</span>
              </motion.div>
              <p className="text-lg font-patrick-hand font-bold text-red-600 mt-2 animate-pulse">
                Recording...
              </p>
            </div>
            <motion.button
              onClick={stopRecording}
              className="px-6 py-3 bg-red-500 text-white font-patrick-hand font-bold rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Stop recording"
            >
              Stop Recording
            </motion.button>
          </>
        ) : (
          <motion.button
            onClick={startRecording}
            disabled={blockButtons}
            className="px-6 py-3 text-white font-patrick-hand font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: blockButtons ? "#999" : buttonColor }}
            whileHover={!blockButtons ? { scale: 1.05 } : {}}
            whileTap={!blockButtons ? { scale: 0.95 } : {}}
            aria-label="Start recording"
          >
            🎤 Start Recording
          </motion.button>
        )}

        {hasPermission === false && (
          <p className="text-sm text-red-600 font-patrick-hand text-center">
            Microphone access is required
          </p>
        )}
      </div>
    </div>
  );
};

export default AACAudioRecorder;

