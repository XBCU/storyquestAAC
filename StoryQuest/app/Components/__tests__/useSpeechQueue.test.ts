import { renderHook, act } from '@testing-library/react';
import useSpeechQueue from '../useSpeechQueue';

// Mocking SpeechSynthesisUtterance
class MockSpeechSynthesisUtterance {
  text: string;
  onend: () => void = () => {};
  constructor(text: string) {
    this.text = text;
  }
  addEventListener(event: string, callback: () => void) {
    if (event === 'end') {
      this.onend = callback;
    }
  }
  removeEventListener() {}
}
(global as any).SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;

// Mocking window.speechSynthesis
const mockSpeechSynthesis = {
  speak: jest.fn((utterance) => {
    // aynchronously call onend to simulate speech finishing
    setTimeout(() => utterance.onend(), 0);
  }),
  cancel: jest.fn(),
  getVoices: jest.fn(() => [
    { name: 'Google US English', lang: 'en-US' },
    { name: 'Samantha', lang: 'en-US' },
  ]),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};
Object.defineProperty(window, 'speechSynthesis', {
  value: mockSpeechSynthesis,
  writable: true,
});

describe('useSpeechQueue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should add an utterance to the queue and speak it', async () => {
    const { result } = renderHook(() => useSpeechQueue());

    await act(async () => {
      result.current.addToSpeechQueue(new SpeechSynthesisUtterance('Hello, world!'));
    });

    await act(async () => {
      // Let promises resolve
    });

    expect(mockSpeechSynthesis.speak).toHaveBeenCalledTimes(1);
    expect(mockSpeechSynthesis.speak.mock.calls[0][0].text).toBe('Hello, world!');
  });

test('should process multiple utterances in order', async () => {
  const { result } = renderHook(() => useSpeechQueue());

  await act(async () => {
    result.current.addToSpeechQueue(new SpeechSynthesisUtterance('First'));
    result.current.addToSpeechQueue(new SpeechSynthesisUtterance('Second'));
  });

  await act(async () => {
    // allow the mock setTimeout-driven `onend` to run
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  expect(mockSpeechSynthesis.speak).toHaveBeenCalledTimes(2);
  expect(mockSpeechSynthesis.speak.mock.calls[0][0].text).toBe('First');
  expect(mockSpeechSynthesis.speak.mock.calls[1][0].text).toBe('Second');
});

  test('should clear the speech queue', async () => {
    const { result } = renderHook(() => useSpeechQueue());

    await act(async () => {
      result.current.addToSpeechQueue(new SpeechSynthesisUtterance('This should be cleared'));
    });

    await act(async () => {
      result.current.stopSpeech();
    });

    expect(mockSpeechSynthesis.cancel).toHaveBeenCalledTimes(1);
  });


});

// clean up tests
afterAll(() => {
  delete (global as any).SpeechSynthesisUtterance;
});
