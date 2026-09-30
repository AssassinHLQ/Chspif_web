import { useEffect, useRef, useState } from 'react';

const BackgroundMusic = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

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
    </>
  );
};

export default BackgroundMusic;
