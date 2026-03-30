import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { mapVelocityToEffects } from '../systems/scrollSystem';
import { getInterpolatedConfig } from '../systems/stateMachine';
import { clamp } from '../utils/clamp';
import { lerp } from '../utils/lerp';
import rgbShiftFrag from '../shaders/rgbShift.glsl?raw';
import motionBlurFrag from '../shaders/motionBlur.glsl?raw';
import distortionFrag from '../shaders/distortion.glsl?raw';

type SceneCanvasProps = {
  progress: number;
  velocity: number;
};

const vert = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export default function SceneCanvas({ progress, velocity }: SceneCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#020202');
    scene.fog = new THREE.Fog('#020202', 8, 24);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 120);
    camera.position.set(0, 1.2, 7);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mountRef.current.appendChild(renderer.domElement);

    const keyLight = new THREE.DirectionalLight('#ff2800', 3);
    keyLight.position.set(3, 2.8, 2);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight('#2244ff', 0.6);
    fillLight.position.set(-3, 1.5, -2);
    scene.add(fillLight);

    const ambientLight = new THREE.AmbientLight('#ffffff', 0.12);
    scene.add(ambientLight);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(120, 120),
      new THREE.MeshStandardMaterial({ color: '#050505', roughness: 0.95, metalness: 0.1 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.72;
    scene.add(ground);

    const carGroup = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: '#0d0d0d', roughness: 0.15, metalness: 0.9 });
    const detailMat = new THREE.MeshStandardMaterial({ color: '#101010', roughness: 0.25, metalness: 0.8 });
    const emissiveMat = new THREE.MeshStandardMaterial({ color: '#130000', emissive: '#380500', emissiveIntensity: 1.6 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.8, 1.45), bodyMat);
    body.position.y = 0.1;
    carGroup.add(body);

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.55, 1.25), detailMat);
    cabin.position.set(-0.1, 0.75, 0);
    carGroup.add(cabin);

    const splitter = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 1.5), detailMat);
    splitter.position.set(1.9, -0.2, 0);
    carGroup.add(splitter);

    const wing = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.8, 2), detailMat);
    wing.position.set(-1.72, 0.8, 0);
    carGroup.add(wing);

    const wingPanel = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.08, 2.2), detailMat);
    wingPanel.position.set(-2.2, 1.15, 0);
    carGroup.add(wingPanel);

    const brakeGlow = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.8), emissiveMat);
    brakeGlow.position.set(-1.72, 0.18, 0);
    carGroup.add(brakeGlow);

    const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.35, 24);
    const wheelMat = new THREE.MeshStandardMaterial({ color: '#090909', roughness: 0.55, metalness: 0.4 });
    const wheelPositions = [
      [1.15, -0.35, 0.8],
      [1.15, -0.35, -0.8],
      [-1.15, -0.35, 0.8],
      [-1.15, -0.35, -0.8]
    ];

    wheelPositions.forEach(([x, y, z]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, y, z);
      carGroup.add(wheel);
    });

    scene.add(carGroup);

    const particlesCount = window.innerWidth < 900 ? 600 : 1400;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particlesCount * 3);
    const particleBase = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;
      const x = (Math.random() - 0.5) * 30;
      const y = Math.random() * 3 - 0.7;
      const z = (Math.random() - 0.5) * 18;
      particlePos[i3] = x;
      particlePos[i3 + 1] = y;
      particlePos[i3 + 2] = z;
      particleBase[i3] = x;
      particleBase[i3 + 1] = y;
      particleBase[i3 + 2] = z;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: '#9ca3af',
      transparent: true,
      opacity: 0.2,
      size: 0.03,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.2, 0.75, 0.4);
    composer.addPass(bloom);

    const rgbPass = new ShaderPass({
      uniforms: { tDiffuse: { value: null }, amount: { value: 0.001 } },
      vertexShader: vert,
      fragmentShader: rgbShiftFrag
    });
    composer.addPass(rgbPass);

    const motionPass = new ShaderPass({
      uniforms: { tDiffuse: { value: null }, direction: { value: new THREE.Vector2(1, 0) }, strength: { value: 0.0 } },
      vertexShader: vert,
      fragmentShader: motionBlurFrag
    });
    composer.addPass(motionPass);

    const distortionPass = new ShaderPass({
      uniforms: { tDiffuse: { value: null }, time: { value: 0 }, amount: { value: 0 } },
      vertexShader: vert,
      fragmentShader: distortionFrag
    });
    composer.addPass(distortionPass);

    const vignettePass = new ShaderPass({
      uniforms: {
        tDiffuse: { value: null },
        offset: { value: 1.1 },
        darkness: { value: 1.3 }
      },
      vertexShader: vert,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float offset;
        uniform float darkness;
        varying vec2 vUv;
        void main() {
          vec4 color = texture2D(tDiffuse, vUv);
          float dist = distance(vUv, vec2(0.5));
          color.rgb *= smoothstep(0.8, offset * 0.799, dist * (darkness + offset));
          gl_FragColor = color;
        }
      `
    });
    composer.addPass(vignettePass);

    const grainPass = new ShaderPass({
      uniforms: { tDiffuse: { value: null }, amount: { value: 0.03 }, time: { value: 0 } },
      vertexShader: vert,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float amount;
        uniform float time;
        varying vec2 vUv;
        float random(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233))) * 43758.5453); }
        void main(){
          vec4 col = texture2D(tDiffuse, vUv);
          float noise = random(vUv + time) - 0.5;
          col.rgb += noise * amount;
          gl_FragColor = col;
        }
      `
    });
    composer.addPass(grainPass);

    let raf = 0;
    const clock = new THREE.Clock();
    let currentProgress = 0;
    let currentVelocity = 0;

    const animate = () => {
      const time = clock.getElapsedTime();
      const velocityFx = mapVelocityToEffects(currentVelocity);
      const { config } = getInterpolatedConfig(currentProgress);

      const shake = velocityFx.shake;
      camera.position.x = lerp(camera.position.x, config.cameraPos.x + Math.sin(time * 17) * shake, 0.08);
      camera.position.y = lerp(camera.position.y, config.cameraPos.y + Math.cos(time * 15) * shake * 0.65, 0.08);
      camera.position.z = lerp(camera.position.z, config.cameraPos.z - currentProgress * 0.8, 0.08);
      camera.lookAt(config.cameraLookAt);
      camera.fov = lerp(camera.fov, config.fov + velocityFx.motionBlur * 18, 0.08);
      camera.updateProjectionMatrix();

      keyLight.intensity = lerp(keyLight.intensity, config.keyIntensity + config.lightSweep * 0.6, 0.1);
      keyLight.color.lerp(config.keyColor, 0.08);
      fillLight.intensity = lerp(fillLight.intensity, config.fillIntensity, 0.12);
      fillLight.color.lerp(config.fillColor, 0.08);
      ambientLight.intensity = lerp(ambientLight.intensity, config.ambientIntensity, 0.12);

      carGroup.rotation.y = Math.sin(currentProgress * Math.PI * 2.2) * 0.18 + velocityFx.shake * 2.2;
      carGroup.position.x = Math.cos(currentProgress * Math.PI) * 0.18;
      brakeGlow.scale.setScalar(1 + config.lightSweep * 0.65 + velocityFx.rgbShift * 30);

      const positions = particleGeo.attributes.position.array as Float32Array;
      const intensity = clamp(config.particleIntensity + velocityFx.particles, 0, 1.3);
      for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        positions[i3] = particleBase[i3] - currentProgress * 12 + Math.sin(time + i) * 0.01;
        positions[i3 + 1] = particleBase[i3 + 1] + Math.sin(time * 4 + i) * 0.002 * intensity;
        positions[i3 + 2] = particleBase[i3 + 2] + Math.cos(time + i * 0.2) * 0.002 * intensity;
        if (positions[i3] < -16) positions[i3] += 32;
      }
      particleGeo.attributes.position.needsUpdate = true;
      particleMat.opacity = lerp(particleMat.opacity, 0.08 + intensity * 0.4, 0.1);

      bloom.strength = lerp(bloom.strength, 0.95 + intensity * 0.85, 0.1);
      bloom.radius = lerp(bloom.radius, 0.45 + velocityFx.motionBlur * 0.5, 0.1);
      rgbPass.uniforms.amount.value = lerp(rgbPass.uniforms.amount.value, config.rgbShift + velocityFx.rgbShift, 0.18);
      motionPass.uniforms.strength.value = lerp(
        motionPass.uniforms.strength.value,
        config.motionBlur + velocityFx.motionBlur,
        0.12
      );
      distortionPass.uniforms.amount.value = lerp(
        distortionPass.uniforms.amount.value,
        config.distortion + velocityFx.motionBlur * 0.5,
        0.12
      );
      distortionPass.uniforms.time.value = time;
      grainPass.uniforms.time.value = time;
      grainPass.uniforms.amount.value = lerp(grainPass.uniforms.amount.value, 0.02 + velocityFx.particles * 0.15, 0.1);

      composer.render();
      raf = requestAnimationFrame(animate);
    };

    animate();

    const resize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', resize);

    const observer = new MutationObserver(() => {
      currentProgress = Number(document.body.dataset.scrollProgress ?? progress);
      currentVelocity = Number(document.body.dataset.scrollVelocity ?? velocity);
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-scroll-progress', 'data-scroll-velocity'] });

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
      composer.dispose();
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [progress, velocity]);

  return <div ref={mountRef} className="fixed inset-0 z-0" />;
}
