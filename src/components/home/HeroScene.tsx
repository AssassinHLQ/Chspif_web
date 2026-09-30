import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import chroma from 'chroma-js';

type SceneMode = 'hero' | 'about' | 'features' | 'closing';

const HeroScene = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
    camera.position.z = 8;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const palette = chroma.scale(['#b8ff65', '#5ee7d6', '#72b7ff']).mode('lch');
    const count = 900;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const seeds = new Float32Array(count * 2);
    for (let i = 0; i < count; i += 1) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 12;
      positions[i3 + 1] = (Math.random() - 0.5) * 9;
      positions[i3 + 2] = (Math.random() - 0.5) * 6;
      seeds[i * 2] = Math.random() * Math.PI * 2;
      seeds[i * 2 + 1] = 0.4 + Math.random() * 1.6;
      const color = new THREE.Color(palette(Math.random()).hex());
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({
      size: 0.034,
      transparent: true,
      opacity: 0.68,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    const pointer = new THREE.Vector2();
    const mode = { current: 'hero' as SceneMode, target: 'hero' as SceneMode };
    const sectionModes: Array<{ selector: string; scene: SceneMode }> = [
      { selector: '.about-section', scene: 'about' },
      { selector: '.feature-section', scene: 'features' },
      { selector: '.closing-section', scene: 'closing' },
    ];

    const onPointerMove = (event: PointerEvent) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    const updateMode = () => {
      const center = window.innerHeight * 0.5;
      mode.target = 'hero';
      sectionModes.forEach(({ selector, scene: nextScene }) => {
        const element = document.querySelector(selector);
        if (!element) return;
        const rect = element.getBoundingClientRect();
        if (rect.top < center && rect.bottom > center) mode.target = nextScene;
      });
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', updateMode, { passive: true });
    updateMode();

    const resize = () => {
      const width = mount.clientWidth || window.innerWidth;
      const height = mount.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(mount);

    let frame = 0;
    const startedAt = performance.now();
    const render = (time: number) => {
      const elapsed = (time - startedAt) * 0.00025;
      if (mode.current !== mode.target) mode.current = mode.target;
      const attribute = geometry.getAttribute('position') as THREE.BufferAttribute;
      const array = attribute.array as Float32Array;
      for (let i = 0; i < count; i += 1) {
        const i3 = i * 3;
        const seed = seeds[i * 2];
        const speed = seeds[i * 2 + 1];
        if (mode.current === 'about') {
          array[i3] += Math.sin(elapsed * speed + seed) * 0.0014;
          array[i3 + 1] += Math.cos(elapsed * 1.3 + seed) * 0.001;
        } else if (mode.current === 'features') {
          array[i3] = Math.sin(seed + elapsed * speed) * 5.5;
          array[i3 + 1] += Math.cos(elapsed * 2 + seed) * 0.002;
        } else if (mode.current === 'closing') {
          const radius = 2.5 + (i % 10) * 0.16;
          array[i3] = Math.cos(seed + elapsed * speed) * radius;
          array[i3 + 1] = Math.sin(seed + elapsed * speed) * radius * 0.52;
        } else {
          array[i3 + 1] += Math.sin(elapsed * 2 + seed) * 0.001;
        }
      }
      attribute.needsUpdate = true;
      particles.rotation.y += 0.0008 + pointer.x * 0.0003;
      particles.rotation.x = pointer.y * 0.04;
      material.opacity = mode.current === 'features' ? 0.42 : 0.68;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', updateMode);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={mountRef} className='hero-scene' aria-hidden='true' />;
};

export default HeroScene;
