//StoryQuest/app/Components/TextToSpeechAACButtons.tsx

import React, { useState, useEffect, useRef } from "react";

interface TextToSpeechProps {
    text: string;
    disabled?: boolean;
    onSpeechEnd?: () => void; // Callback for when speech ends
    onButtonPress?: (action: 'play' | 'stop', text: string) => void; // New callback for button presses
}

const TextToSpeechAACButtons: React.FC<TextToSpeechProps> = ({
    text,
    onSpeechEnd,
    disabled,
    onButtonPress
}) => {
    const handlePlay = () => {
        if (disabled) return;
        onButtonPress?.('play', text);
    };

    const handleStop = () => {
        if (disabled) return;
        onButtonPress?.('stop', text);
    };

    return (
        <div className="flex gap-2 mt-1">
            <button
                onClick={handlePlay}
                disabled={disabled}
                className={`px-4 py-2 rounded text-white font-patrick-hand font-bold ${
                    disabled ? 'bg-gray-400 cursor-not-allowed' : 
                    'bg-green-500 hover:bg-green-600'
                }`}
            >
                {disabled ? 'Auto-Reading...' : '▶ Play'}
            </button>

            <button
                onClick={handleStop}
                disabled={disabled} // Disable if no utterance
                className={`px-4 py-2 rounded font-patrick-hand text-white font-bold ${
                    disabled ? 'bg-gray-400 cursor-not-allowed' : 
                    'bg-red-500 hover:bg-red-600'
                }`}
            >
                ⏹ Stop
            </button>
        </div>
    );
};

export default TextToSpeechAACButtons;
