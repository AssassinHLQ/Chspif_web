import { useEffect, useRef, useState } from 'react';
import WakeVolumeSlider from './WakeVolumeSlider.tsx';

const BackgroundMusic = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(42);
  const [audioError, setAudioError] = useState(false);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => setPlaying(false);
    const onError = () => { setPlaying(false); setAudioError(true); };
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    return () => { audio.removeEventListener('ended', onEnded); audio.removeEventListener('error', onError); };
  }, []);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      try {
        setAudioError(false);
        await audio.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
        setAudioError(true);
      }
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  return (
    <>
      <audio ref={audioRef} loop preload='metadata'>
        <source src='/music/chspif-bg-music.mp4' type='audio/mp4' />
      </audio>
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
        <span>{audioError ? '音乐不可用' : playing ? '音乐中' : '播放音乐'}</span>
      </button>
      <div className='music-volume-popover'>
        <WakeVolumeSlider value={volume} onChange={setVolume} />
      </div>
    </>
  );
};

export default BackgroundMusic;
