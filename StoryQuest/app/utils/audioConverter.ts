/**
 * Converts audio blob to WAV format for compatibility with transcription backends.
 * Takes raw audio chunks and encodes them as PCM WAV.
 */

export async function convertToWAV(blob: Blob): Promise<Blob> {
  try {
    // If already WAV, return as-is
    if (blob.type === 'audio/wav' || blob.type === 'audio/x-wav') {
      return blob;
    }

    // Decode the audio blob to raw PCM data
    const arrayBuffer = await blob.arrayBuffer();
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Convert to PCM WAV format
    const wavBlob = encodeWAV(audioBuffer);
    return wavBlob;
  } catch (error) {
    console.error('Error converting to WAV:', error);
    // Return original blob if conversion fails
    return blob;
  }
}

function encodeWAV(audioBuffer: AudioBuffer): Blob {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  // Get audio data from all channels
  const channels: Float32Array[] = [];
  for (let i = 0; i < numChannels; i++) {
    channels.push(audioBuffer.getChannelData(i));
  }

  // Calculate total data size: (samples * channels * bytes per sample)
  const dataLength = audioBuffer.length * numChannels * 2;
  const bufferLength = 44 + dataLength; // WAV header is 44 bytes
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  // WAV file header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF'); // ChunkID
  view.setUint32(4, bufferLength - 8, true); // ChunkSize
  writeString(8, 'WAVE'); // Format

  writeString(12, 'fmt '); // Subchunk1ID
  view.setUint32(16, 16, true); // Subchunk1Size
  view.setUint16(20, format, true); // AudioFormat (1 = PCM)
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * numChannels * bitDepth / 8, true); // ByteRate
  view.setUint16(32, numChannels * bitDepth / 8, true); // BlockAlign
  view.setUint16(34, bitDepth, true); // BitsPerSample

  writeString(36, 'data'); // Subchunk2ID
  view.setUint32(40, dataLength, true); // Subchunk2Size

  // Interleave and write audio data
  const volume = 0.8; // Reduce volume to prevent clipping
  let dataOffset = 44;
  const channelLength = audioBuffer.length;

  for (let i = 0; i < channelLength; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channels[ch][i])) * volume;
      view.setInt16(dataOffset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      dataOffset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}
