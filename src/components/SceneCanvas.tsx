import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { getStateConfig } from '../systems/stateMachine';
import { lerp } from '../utils/lerp';
import { clamp } from '../utils/clamp';
import rgbShiftFragment from '../shaders/rgbShift.glsl';
import motionBlurFragment from '../shaders/motionBlur.glsl';
import distortionFragment from '../shaders/distortion.glsl';

interface SceneCanvasProps {
  progress: number;
  velocity: number;
}

const vert = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);} `;

const SceneCanvas = ({ progress, velocity }: SceneCanvasProps) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const refs = useRef<{ render: (() => void) | null }>({ render: null });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#020202');
    scene.fog = new THREE.Fog('#020202', 4, 26);

    const camera = new THREE.PerspectiveCamera(35, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 2.1, 8.7);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight('#ffffff', 0.25);
    const keyLight = new THREE.DirectionalLight('#FF2800', 3);
    keyLight.position.set(2, 4, 3);
    const fillLight = new THREE.DirectionalLight('#2244FF', 0.6);
    fillLight.position.set(-3, 1.5, 4);
    scene.add(ambient, keyLight, fillLight);

    const carGroup = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 0.7, 1.4),
      new THREE.MeshStandardMaterial({ color: '#0D0D0D', roughness: 0.15, metalness: 0.9 }),
    );
    body.position.set(0, 0.7, 0);
    carGroup.add(body);

    const cockpit = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.5, 1.3),
      new THREE.MeshStandardMaterial({ color: '#0F0F0F', roughness: 0.1, metalness: 0.9 }),
    );
    cockpit.position.set(0.45, 1.2, 0);
    carGroup.add(cockpit);

    [-1.2, 1.2].forEach((x) => {
      [-0.8, 0.8].forEach((z) => {
        const tire = new THREE.Mesh(
          new THREE.CylinderGeometry(0.35, 0.35, 0.22, 28),
          new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.35, metalness: 0.75 }),
        );
        tire.position.set(x, 0.34, z);
        tire.rotation.z = Math.PI / 2;
        carGroup.add(tire);
      });
    });
    scene.add(carGroup);

    const particleCount = 800;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 28;
      positions[i * 3 + 1] = Math.random() * 2.4;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({ color: '#f58a7b', size: 0.06, transparent: true, opacity: 0.2, depthWrite: false });
    const particleMesh = new THREE.Points(particleGeo, particleMat);
    scene.add(particleMesh);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(mount.clientWidth, mount.clientHeight), 1.2, 0.2, 0.85);

    const motionPass = new ShaderPass({
      uniforms: { tDiffuse: { value: null }, uDirection: { value: new THREE.Vector2(1, 0) }, uIntensity: { value: 0 } },
      vertexShader: vert,
      fragmentShader: motionBlurFragment,
    });
    const rgbPass = new ShaderPass({
      uniforms: { tDiffuse: { value: null }, uDirection: { value: new THREE.Vector2(1, 0.3) }, uAmount: { value: 0 } },
      vertexShader: vert,
      fragmentShader: rgbShiftFragment,
    });
    const distortionPass = new ShaderPass({
      uniforms: { tDiffuse: { value: null }, uAmount: { value: 0 }, uTime: { value: 0 } },
      vertexShader: vert,
      fragmentShader: distortionFragment,
    });

    composer.addPass(bloomPass);
    composer.addPass(motionPass);
    composer.addPass(rgbPass);
    composer.addPass(distortionPass);

    const clock = new THREE.Clock();
    let raf = 0;

    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      composer.setSize(mount.clientWidth, mount.clientHeight);
    };

    const animate = () => {
      const elapsed = clock.getElapsedTime();
      const delta = clock.getDelta();

      const config = getStateConfig(progressRef.current);
      const { current, next, blend, state, nextState } = config;

      const shake = clamp(Math.abs(velocityRef.current) * 0.0015, 0, 0.05);
      const jitterX = Math.sin(elapsed * 42) * shake;
      const jitterY = Math.cos(elapsed * 36) * shake * 0.6;

      const targetPos = current.cameraPosition.clone().lerp(next.cameraPosition, blend);
      const targetLook = current.cameraLookAt.clone().lerp(next.cameraLookAt, blend);

      camera.position.x = lerp(camera.position.x, targetPos.x + jitterX, 0.065);
      camera.position.y = lerp(camera.position.y, targetPos.y + jitterY, 0.065);
      camera.position.z = lerp(camera.position.z, targetPos.z, 0.065);
      camera.fov = lerp(camera.fov, lerp(current.fov, next.fov, blend), 0.08);
      camera.lookAt(targetLook);
      camera.updateProjectionMatrix();

      carGroup.rotation.y += delta * 0.8 + progressRef.current * 0.02;
      carGroup.position.x = Math.sin(progressRef.current * Math.PI * 2) * 0.25;

      keyLight.intensity = lerp(keyLight.intensity, lerp(current.keyIntensity, next.keyIntensity, blend), 0.1);
      fillLight.intensity = lerp(fillLight.intensity, lerp(current.fillIntensity, next.fillIntensity, blend), 0.1);
      keyLight.color.lerp(new THREE.Color(lerpColor(current.keyColor, next.keyColor, blend)), 0.12);
      fillLight.color.lerp(new THREE.Color(lerpColor(current.fillColor, next.fillColor, blend)), 0.12);

      particleMesh.rotation.y += delta * 0.04;
      const intensity = lerp(current.particleIntensity, next.particleIntensity, blend) + clamp(Math.abs(velocityRef.current) * 0.001, 0, 0.4);
      particleMat.opacity = lerp(particleMat.opacity, intensity, 0.08);
      particleMat.size = lerp(particleMat.size, 0.03 + intensity * 0.1, 0.08);

      const motionBlur = clamp(lerp(current.baseBlur, next.baseBlur, blend) + Math.abs(velocityRef.current) * 0.0005, 0, 1);
      const rgbShift = clamp(lerp(current.baseRgbShift, next.baseRgbShift, blend) + Math.abs(velocityRef.current) * 0.00001, 0, 0.008);
      const distortion = clamp(Math.abs(velocityRef.current) * 0.0007 + (state !== nextState ? 0.15 : 0), 0, 0.65);

      motionPass.uniforms.uIntensity.value = motionBlur;
      rgbPass.uniforms.uAmount.value = rgbShift;
      distortionPass.uniforms.uAmount.value = distortion;
      distortionPass.uniforms.uTime.value = elapsed;
      bloomPass.strength = lerp(0.65, 1.8, motionBlur);

      composer.render();
      raf = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', onResize);
    animate();

    refs.current.render = animate;

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
      composer.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, []);

  const progressRef = useRef(progress);
  const velocityRef = useRef(velocity);

  useEffect(() => {
    progressRef.current = progress;
    velocityRef.current = velocity;
  }, [progress, velocity]);

  return (
    <div className="fixed inset-0 z-10">
      <div ref={mountRef} className="h-full w-full" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_25%,rgba(0,0,0,0.75)_95%)]" />
    </div>
  );
};

const lerpColor = (a: string, b: string, t: number) => {
  const c1 = new THREE.Color(a);
  const c2 = new THREE.Color(b);
  return `#${c1.lerp(c2, t).getHexString()}`;
};

export default SceneCanvas;
