import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import * as THREE from 'three';
import chroma from 'chroma-js';

export type PageParticleVariant =
  | 'join'
  | 'survival'
  | 'member'
  | 'internal'
  | 'opensource'
  | 'hardware';

type Palette = { colors: string[]; shape: 'octa' | 'ring' | 'diamond' | 'hex' | 'box' | 'icosa' };

const palettes: Record<PageParticleVariant, Palette> = {
  join: { colors: ['#ff5b7f', '#ff9f68', '#d16cff'], shape: 'octa' },
  survival: { colors: ['#43e6d2', '#8be66d', '#5da8ff'], shape: 'ring' },
  member: { colors: ['#ffd166', '#f78c6b', '#b892ff'], shape: 'diamond' },
  internal: { colors: ['#7ea6ff', '#7fdbff', '#b6a0ff'], shape: 'hex' },
  opensource: { colors: ['#ffcc66', '#ff8c69', '#ffdf8a'], shape: 'box' },
  hardware: { colors: ['#72f1b8', '#56cfe1', '#80aaff'], shape: 'icosa' },
};

const PageParticleField = ({ variant }: { variant: PageParticleVariant }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const config = palettes[variant];
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.z = 8;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const colorScale = chroma.scale(config.colors).mode('lch');
    const count = 760;
    const positions = new Float32Array(count * 3);
    const basePositions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const pointSizes = new Float32Array(count);
    for (let i = 0; i < count; i += 1) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 15;
      positions[i3 + 1] = (Math.random() - 0.5) * 9;
      positions[i3 + 2] = (Math.random() - 0.5) * 6 - 1.6;
      basePositions[i3] = positions[i3];
      basePositions[i3 + 1] = positions[i3 + 1];
      basePositions[i3 + 2] = positions[i3 + 2];
      seeds[i] = Math.random() * Math.PI * 2;
      pointSizes[i] = 0.28 + Math.random() * 0.72;
      const color = new THREE.Color(colorScale(Math.random()).hex());
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }
    const pointGeometry = new THREE.BufferGeometry();
    pointGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pointGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    pointGeometry.setAttribute('aSize', new THREE.BufferAttribute(pointSizes, 1));
    const pointMaterial = new THREE.ShaderMaterial({
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true,
      uniforms: { uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) } },
      vertexShader: `
        attribute float aSize;
        varying vec3 vColor;
        uniform float uPixelRatio;
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = aSize * uPixelRatio * (24.0 / max(1.0, -mvPosition.z));
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
          float alpha = smoothstep(0.5, 0.05, distanceToCenter);
          gl_FragColor = vec4(vColor, alpha * 0.8);
        }
      `,
    });
    const points = new THREE.Points(pointGeometry, pointMaterial);
    scene.add(points);

    const geometry = config.shape === 'octa'
      ? new THREE.OctahedronGeometry(0.07, 0)
      : config.shape === 'ring'
        ? new THREE.TorusGeometry(0.07, 0.018, 6, 12)
        : config.shape === 'diamond'
          ? new THREE.TetrahedronGeometry(0.08, 0)
          : config.shape === 'hex'
            ? new THREE.CylinderGeometry(0.075, 0.075, 0.035, 6)
            : config.shape === 'box'
              ? new THREE.BoxGeometry(0.075, 0.075, 0.075)
              : new THREE.IcosahedronGeometry(0.08, 0);
    const shapes = new THREE.Group();
    const shapeData: Array<{ baseX: number; baseY: number; baseZ: number; speed: number; phase: number }> = [];
    for (let i = 0; i < 72; i += 1) {
      const material = new THREE.MeshBasicMaterial({
        color: colorScale(i / 42).hex(),
        transparent: true,
        opacity: 0.22 + Math.random() * 0.45,
        wireframe: config.shape !== 'box',
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geometry, material);
      const baseY = (Math.random() - 0.5) * 8.4;
      mesh.position.set((Math.random() - 0.5) * 14, baseY, (Math.random() - 0.5) * 5 - 1.5);
      mesh.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      mesh.scale.setScalar(0.35 + Math.random() * 1.35);
      shapeData.push({ baseX: mesh.position.x, baseY, baseZ: mesh.position.z, speed: 0.035 + Math.random() * 0.055, phase: Math.random() * Math.PI * 2 });
      shapes.add(mesh);
    }
    scene.add(shapes);

    const pointer = new THREE.Vector2();
    const onPointerMove = (event: PointerEvent) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

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
      const elapsed = (time - startedAt) * 0.0001;
      const positionAttribute = pointGeometry.getAttribute('position') as THREE.BufferAttribute;
      const pointArray = positionAttribute.array as Float32Array;
      for (let i = 0; i < count; i += 1) {
        const i3 = i * 3;
        const phase = seeds[i];
        const drift = 0.06 + (i % 7) * 0.008;
        pointArray[i3] = basePositions[i3] + Math.sin(elapsed * drift + phase) * 0.16 + Math.cos(elapsed * drift * 0.71 + phase * 1.7) * 0.08;
        pointArray[i3 + 1] = basePositions[i3 + 1] + Math.cos(elapsed * drift * 0.83 + phase) * 0.14;
        pointArray[i3 + 2] = basePositions[i3 + 2] + Math.sin(elapsed * drift * 0.63 + phase * 0.6) * 0.1;
      }
      positionAttribute.needsUpdate = true;
      points.rotation.y = elapsed * 0.1 + pointer.x * 0.035;
      points.rotation.x = pointer.y * 0.02;
      shapes.rotation.y = -elapsed * 0.12 + pointer.x * 0.04;
      shapes.rotation.x = pointer.y * 0.03;
      shapes.children.forEach((child, index) => {
        const data = shapeData[index];
        child.rotation.x += 0.0007 + (index % 5) * 0.00012;
        child.rotation.y += 0.001 + (index % 4) * 0.00012;
        child.position.x = data.baseX + Math.sin(elapsed * data.speed + data.phase) * 0.22;
        child.position.y = data.baseY + Math.cos(elapsed * data.speed * 0.83 + data.phase) * 0.18;
        child.position.z = data.baseZ + Math.sin(elapsed * data.speed * 0.67 + data.phase) * 0.12;
      });
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      pointGeometry.dispose();
      pointMaterial.dispose();
      geometry.dispose();
      shapes.children.forEach((child) => (child as THREE.Mesh).material.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [variant]);

  return createPortal(
    <div ref={mountRef} className='page-particle-field' aria-hidden='true' />,
    document.body,
  );
};

export default PageParticleField;
