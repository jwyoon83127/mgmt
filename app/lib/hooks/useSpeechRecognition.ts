'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

export interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
}

interface UseSpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (result: SpeechRecognitionResult) => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  interimTranscript: string;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

// Web Speech API type declarations
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn {
  const {
    lang = 'ko-KR',
    continuous = true,
    interimResults = true,
    onResult,
    onEnd,
    onError,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<InstanceType<typeof window.webkitSpeechRecognition> | null>(null);
  const isSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) {
      onError?.('이 브라우저는 음성 인식을 지원하지 않습니다. Chrome 브라우저를 사용해주세요.');
      return;
    }

    try {
      const SpeechRecognitionAPI =
        (window as typeof window & { SpeechRecognition?: typeof window.webkitSpeechRecognition }).SpeechRecognition
        || window.webkitSpeechRecognition;

      const recognition = new SpeechRecognitionAPI();
      recognition.lang = lang;
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalText = '';
        let interimText = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const text = result[0].transcript;

          if (result.isFinal) {
            finalText += text;
          } else {
            interimText += text;
          }
        }

        if (finalText) {
          setTranscript((prev) => {
            const updated = prev + (prev ? ' ' : '') + finalText;
            onResult?.({ transcript: finalText, isFinal: true });
            return updated;
          });
        }

        setInterimTranscript(interimText);

        if (interimText) {
          onResult?.({ transcript: interimText, isFinal: false });
        }
      };

      let hasFatalError = false;

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        // 'no-speech' is common and not a real error
        if (event.error === 'no-speech') return;
        if (event.error === 'aborted') return;

        // Fatal errors that should stop auto-restart
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed' || event.error === 'audio-capture') {
          hasFatalError = true;
          recognitionRef.current = null; // Prevent auto-restart
        }

        console.error('Speech recognition error:', event.error);
        onError?.(getErrorMessage(event.error));
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
        onEnd?.();

        // Auto-restart if still supposed to be listening (continuous mode)
        // but NOT if there was a fatal error (permission denied, etc.)
        if (!hasFatalError && recognitionRef.current === recognition) {
          try {
            recognition.start();
          } catch {
            // ignore - might already be started
          }
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      onError?.('음성 인식을 시작할 수 없습니다.');
    }
  }, [isSupported, lang, continuous, interimResults, onResult, onEnd, onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      const recognition = recognitionRef.current;
      recognitionRef.current = null; // Prevent auto-restart
      try {
        recognition.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
      setInterimTranscript('');
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
  };
}

function getErrorMessage(error: string): string {
  switch (error) {
    case 'not-allowed':
      return '마이크 접근이 거부되었습니다. 브라우저 설정에서 마이크 권한을 허용해주세요.';
    case 'no-speech':
      return '음성이 감지되지 않았습니다. 다시 시도해주세요.';
    case 'audio-capture':
      return '마이크를 찾을 수 없습니다. 마이크가 연결되어 있는지 확인해주세요.';
    case 'network':
      return '네트워크 오류가 발생했습니다.';
    case 'service-not-allowed':
      return '음성 인식 서비스를 사용할 수 없습니다.';
    default:
      return `음성 인식 오류: ${error}`;
  }
}

// Extend window type for webkit prefix
declare global {
  interface Window {
    webkitSpeechRecognition: new () => SpeechRecognition;
  }

  interface SpeechRecognition extends EventTarget {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    maxAlternatives: number;
    start(): void;
    stop(): void;
    abort(): void;
    onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
    onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  }
}
