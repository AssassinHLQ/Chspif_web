import { useEffect, useRef, useState } from 'react';
import WakeVolumeSlider from './WakeVolumeSlider.tsx';

const BackgroundMusic = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(42);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => setPlaying(false);
    audio.addEventListener('ended', onEnded);
    return () => audio.removeEventListener('ended', onEnded);
  }, []);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      try {
        await audio.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  return (
    <>
      <audio ref={audioRef} src='/music/chspif-bg-music.mp4' loop preload='metadata' />
      <button
        className={`music-toggle${playing ? ' is-playing' : ''}`}
        type='button'
        onClick={togglePlayback}
        aria-label={playing ? '暂停背景音乐' : '播放背景音乐'}
        title={playing ? '暂停背景音乐' : '播放背景音乐'}
      >
        <span className='music-bars' aria-hidden='true'>
          <i />
          <i />
          <i />
          <i />
        </span>
        <span>{playing ? '音乐中' : '播放音乐'}</span>
      </button>
      <div className='music-volume-popover'>
        <WakeVolumeSlider value={volume} onChange={setVolume} />
      </div>
    </>
  );
};

export default BackgroundMusic;
