import { useEffect, useMemo, useRef, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { animate, stagger } from 'animejs';
import chroma from 'chroma-js';

import HeroScene from '@/components/home/HeroScene.tsx';
import HeaderTimer from '#/common/HeaderTimer.tsx';
import getImageUrl from '@/utils/getImageUrl.ts';
import { IImageContent } from '@/types/IImageContent.ts';
import { STATIC_DATA_API } from '@/constants';
import useApi from '@/hooks/useApi.ts';

const HomePage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { data: survivalProgress } = useApi<IImageContent[]>(
    `${STATIC_DATA_API}/${i18n.language}/survivalProgress.json`,
  );
  const heroRef = useRef<HTMLElement>(null);

  const about = t('home.about', { returnObjects: true }) as IImageContent;
  const featureCards = t('home.feature.card', {
    returnObjects: true,
  }) as IImageContent[];
  const accent = useMemo(
    () => chroma.scale(['#b8ff65', '#5ee7d6']).mode('lch')(0.36).hex(),
    [],
  );

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const intro = hero.querySelectorAll<HTMLElement>('[data-intro]');
    animate(intro, {
      opacity: [0, 1],
      translateY: [24, 0],
      delay: stagger(100),
      duration: 780,
      ease: 'out(4)',
    });
  }, []);

  useEffect(() => {
    const items = document.querySelectorAll<HTMLElement>('[data-reveal]');
    if (!items.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15 },
    );
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  const featureLink = (index: number) => {
    if (!survivalProgress?.length) return;
    const sliceIndex = Math.max(survivalProgress.length - 3, 0);
    navigate(`/survival?index=${sliceIndex + index}`);
  };

  return (
    <main className='home-page' style={{ '--home-accent': accent } as CSSProperties}>
      <div className='home-particle-layer'>
        <HeroScene />
      </div>
      <section className='home-hero' ref={heroRef}>
        <video
          className='home-hero-video'
          src='/web~2.mp4'
          autoPlay
          muted
          loop
          playsInline
          aria-hidden='true'
        />
        <div className='home-hero-wash' />
        <div className='home-hero-grid' aria-hidden='true' />

        <div className='home-hero-content page-width'>
          <div className='hero-kicker' data-intro>
            <span className='status-dot' /> CHSPIF / 生存服务器
          </div>
          <h1 data-intro>
            <span>Chspif</span>
            <em>在成长中追逐自我</em>
          </h1>
          <p className='hero-copy' data-intro>
            生存实践、红石科技、建筑创作。与一群认真玩游戏的人，一起把想象变成世界。
          </p>
          <div className='hero-actions' data-intro>
            <Link className='button button-primary' to='/survival'>
              探索服务器进度 <span aria-hidden='true'>↗</span>
            </Link>
            <Link className='button button-ghost' to='/join'>
              加入我们
            </Link>
          </div>
          <div className='hero-meta' data-intro>
            <div>
              <span className='meta-label'>SERVER STATUS</span>
              <strong>ONLINE / 2019.09.14</strong>
            </div>
            <div className='hero-timer'>
              <HeaderTimer />
            </div>
          </div>
        </div>

        <a className='scroll-cue' href='#about' data-intro>
          <span>向下探索</span>
          <i aria-hidden='true' />
        </a>
      </section>

      <section className='home-section about-section page-width' id='about'>
        <div className='section-heading' data-reveal>
          <span className='section-index'>01 / ABOUT</span>
          <h2>一个持续生长的世界</h2>
          <p>从一块空地开始，留下每个人认真生活过的痕迹。</p>
        </div>
        <div className='about-layout'>
          <div className='about-media media-frame' data-reveal>
            <img src={getImageUrl(about.imageUrl)} alt={about.title} />
            <span className='media-caption'>CHSPIF / ARCHIVE 01</span>
          </div>
          <div className='about-copy' data-reveal>
            <span className='eyebrow'>CHSPIF COMMUNITY</span>
            <h3>{about.title}</h3>
            <ul>
              {about.features?.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <Link className='text-link' to='/survival'>
              查看服务器进度 <span aria-hidden='true'>→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className='home-section feature-section'>
        <div className='page-width'>
          <div className='section-heading feature-heading' data-reveal>
            <span className='section-index'>02 / WE HAVE</span>
            <h2>{t('home.feature.title')}</h2>
          </div>
          <div className='feature-grid'>
            {featureCards.map((card, index) => (
              <button
                className='feature-card'
                key={card.title}
                type='button'
                data-reveal
                onClick={() => featureLink(index)}
              >
                <div className='feature-card-media'>
                  <img src={getImageUrl(card.imageUrl)} alt={card.title} />
                  <span className='feature-number'>0{index + 1}</span>
                </div>
                <div className='feature-card-footer'>
                  <h3>{card.title}</h3>
                  <span aria-hidden='true'>↗</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className='home-section closing-section page-width' data-reveal>
        <div className='closing-line' />
        <div>
          <span className='section-index'>03 / NEXT CHAPTER</span>
          <h2>一起把下一段故事写下去</h2>
        </div>
        <Link className='button button-primary' to='/join'>
          申请加入 <span aria-hidden='true'>↗</span>
        </Link>
      </section>
    </main>
  );
};

export default HomePage;
