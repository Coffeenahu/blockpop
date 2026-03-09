import { useRef, useCallback, useEffect, useState } from 'react';
import { SOUND_STORAGE_KEY, SOUND_FILES } from '../constants';
import type { SoundId } from '../constants';

export function useSound() {
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    return localStorage.getItem(SOUND_STORAGE_KEY) === 'muted';
  });

  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const sfxCache = useRef<Map<SoundId, HTMLAudioElement>>(new Map());

  useEffect(() => {
    const bgm = new Audio(SOUND_FILES.bgm);
    bgm.loop = true;
    bgm.volume = 0.35;
    bgm.muted = isMuted;
    bgmRef.current = bgm;

    const sfxIds: SoundId[] = ['place', 'clear', 'combo', 'gameover'];
    sfxIds.forEach((id) => {
      const audio = new Audio(SOUND_FILES[id]);
      audio.volume = 0.65;
      sfxCache.current.set(id, audio);
    });

    return () => {
      bgm.pause();
      bgm.src = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playSound = useCallback(
    (id: SoundId) => {
      if (isMuted) return;
      const src = sfxCache.current.get(id);
      if (!src) return;
      // 겹쳐 재생을 위해 클론
      const clone = src.cloneNode() as HTMLAudioElement;
      clone.volume = src.volume;
      clone.play().catch(() => {});
    },
    [isMuted]
  );

  const startBgm = useCallback(() => {
    if (!bgmRef.current || isMuted) return;
    bgmRef.current.play().catch(() => {});
  }, [isMuted]);

  const stopBgm = useCallback(() => {
    bgmRef.current?.pause();
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      localStorage.setItem(SOUND_STORAGE_KEY, next ? 'muted' : 'unmuted');
      if (bgmRef.current) {
        bgmRef.current.muted = next;
        if (!next) bgmRef.current.play().catch(() => {});
      }
      return next;
    });
  }, []);

  return { isMuted, toggleMute, playSound, startBgm, stopBgm };
}
