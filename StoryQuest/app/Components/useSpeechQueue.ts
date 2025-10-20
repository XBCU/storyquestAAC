import { useState, useEffect, useCallback } from "react";

const preferredVoices = ["Google US English", "Samantha", "Microsoft Zira Desktop", "Microsoft Aria Online (Natural)", "Google US Female"];

const loadPreferredVoices = (): SpeechSynthesisVoice[] => {
    const voices = window.speechSynthesis.getVoices();
    return voices.filter((v) => v.lang.includes("en-US"));
};

export const getPreferredVoice = (): SpeechSynthesisVoice | null => {
    let voices = loadPreferredVoices();
    if (voices.length === 0) {
        window.speechSynthesis.getVoices();
        voices = loadPreferredVoices();
    }
    if (voices.length === 0) {
        return null;
    }
    for (const name of preferredVoices) {
        const match = voices.find((v) => v.name === name);
        if (match) return match;
    }
    return voices[0] || null;
};

const useSpeechQueue = () => {
    const [speechQueue, setSpeechQueue] = useState<SpeechSynthesisUtterance[]>([]);
    const [isProcessingSpeech, setIsProcessingSpeech] = useState(false);
    const [voicesLoaded, setVoicesLoaded] = useState(false);

    useEffect(() => {
        const handleVoicesChanged = () => {
            setVoicesLoaded(true);
        };

        // In many environments (including jsdom), getVoices() may return an empty array
        // and the 'voiceschanged' event may never fire. To ensure queued speech still
        // plays (falling back to the default voice), mark voices as loaded when
        // speechSynthesis exists regardless of the current voices list.
        try {
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                const hasAnyVoices = window.speechSynthesis.getVoices().length > 0;
                if (hasAnyVoices) {
                    setVoicesLoaded(true);
                } else {
                    // Optimistically allow speech to proceed; voice can still be assigned later
                    setVoicesLoaded(true);
                    // Also listen for future voice availability
                    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
                }
            }
        } catch {
            // If speechSynthesis is unavailable, leave voicesLoaded as false
        }

        return () => {
            try {
                window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
            } catch {}
        };
    }, []);

    useEffect(() => {
        if (speechQueue.length > 0 && !isProcessingSpeech /* voicesLoaded intentionally not required */) {
            setIsProcessingSpeech(true);
            const utterance = speechQueue[0];

            const handleEnd = () => {
                setSpeechQueue((prevQueue) => prevQueue.slice(1));
                setIsProcessingSpeech(false);
            };

            const handleError = (e: SpeechSynthesisErrorEvent) => {
                console.warn("Speech synthesis utterance error:", e);
                setSpeechQueue((prevQueue) => prevQueue.slice(1));
                setIsProcessingSpeech(false);
            };

            utterance.addEventListener('end', handleEnd);
            utterance.addEventListener('error', handleError);

            try {
                window.speechSynthesis.speak(utterance);
            } catch (e) {
                console.warn('speechSynthesis.speak threw:', e);
                // fail-safe: dequeue to avoid deadlock
                setSpeechQueue((prevQueue) => prevQueue.slice(1));
                setIsProcessingSpeech(false);
            }
        }
    }, [speechQueue, isProcessingSpeech /*, voicesLoaded*/]);

    const addToSpeechQueue = useCallback((utterance: SpeechSynthesisUtterance, atFront = false) => {
        setSpeechQueue(queue => atFront ? [utterance, ...queue] : [...queue, utterance]);
    }, []);

    const stopSpeech = useCallback(() => {
        window.speechSynthesis.cancel();
        setSpeechQueue([]);
        setIsProcessingSpeech(false);
    }, []);

    return { addToSpeechQueue, stopSpeech, isProcessingSpeech, voicesLoaded };
};

export default useSpeechQueue;
