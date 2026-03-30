import * as THREE from 'three';
import { clamp } from '../utils/clamp';
import { lerp } from '../utils/lerp';

export type DriveState =
  | 'STATIC'
  | 'IGNITION'
  | 'FIRST_GEAR'
  | 'ACCELERATION'
  | 'APEX'
  | 'BRAKING'
  | 'PIT_LANE';

export type StateConfig = {
  cameraPos: THREE.Vector3;
  cameraLookAt: THREE.Vector3;
  fov: number;
  keyIntensity: number;
  fillIntensity: number;
  ambientIntensity: number;
  keyColor: THREE.Color;
  fillColor: THREE.Color;
  motionBlur: number;
  rgbShift: number;
  distortion: number;
  particleIntensity: number;
  hudOpacity: number;
  heroOpacity: number;
  lightSweep: number;
};

const stateOrder: DriveState[] = [
  'STATIC',
  'IGNITION',
  'FIRST_GEAR',
  'ACCELERATION',
  'APEX',
  'BRAKING',
  'PIT_LANE'
];

const ranges: Record<DriveState, [number, number]> = {
  STATIC: [0, 0.08],
  IGNITION: [0.08, 0.2],
  FIRST_GEAR: [0.2, 0.35],
  ACCELERATION: [0.35, 0.55],
  APEX: [0.55, 0.7],
  BRAKING: [0.7, 0.85],
  PIT_LANE: [0.85, 1]
};

const presets: Record<DriveState, StateConfig> = {
  STATIC: {
    cameraPos: new THREE.Vector3(0.2, 1.2, 8),
    cameraLookAt: new THREE.Vector3(0, 0.8, 0),
    fov: 35,
    keyIntensity: 0.4,
    fillIntensity: 0.2,
    ambientIntensity: 0.12,
    keyColor: new THREE.Color('#ff2800'),
    fillColor: new THREE.Color('#2244ff'),
    motionBlur: 0,
    rgbShift: 0,
    distortion: 0,
    particleIntensity: 0.1,
    hudOpacity: 0,
    heroOpacity: 1,
    lightSweep: 0
  },
  IGNITION: {
    cameraPos: new THREE.Vector3(1.2, 0.85, 5.5),
    cameraLookAt: new THREE.Vector3(0.2, 0.5, 0),
    fov: 40,
    keyIntensity: 2.5,
    fillIntensity: 0.5,
    ambientIntensity: 0.1,
    keyColor: new THREE.Color('#ff2800'),
    fillColor: new THREE.Color('#2e59ff'),
    motionBlur: 0.12,
    rgbShift: 0.001,
    distortion: 0.08,
    particleIntensity: 0.15,
    hudOpacity: 0,
    heroOpacity: 0.85,
    lightSweep: 0.65
  },
  FIRST_GEAR: {
    cameraPos: new THREE.Vector3(-2.4, 1.1, 4.8),
    cameraLookAt: new THREE.Vector3(0, 0.65, 0),
    fov: 46,
    keyIntensity: 3,
    fillIntensity: 0.6,
    ambientIntensity: 0.13,
    keyColor: new THREE.Color('#ff2b00'),
    fillColor: new THREE.Color('#2450ff'),
    motionBlur: 0.15,
    rgbShift: 0.0018,
    distortion: 0.12,
    particleIntensity: 0.28,
    hudOpacity: 0.7,
    heroOpacity: 0.65,
    lightSweep: 0.28
  },
  ACCELERATION: {
    cameraPos: new THREE.Vector3(0.5, 1.8, 2.8),
    cameraLookAt: new THREE.Vector3(0.2, 0.6, 0),
    fov: 66,
    keyIntensity: 3.4,
    fillIntensity: 0.78,
    ambientIntensity: 0.16,
    keyColor: new THREE.Color('#ff2f0f'),
    fillColor: new THREE.Color('#2c5fff'),
    motionBlur: 0.35,
    rgbShift: 0.0032,
    distortion: 0.2,
    particleIntensity: 0.62,
    hudOpacity: 1,
    heroOpacity: 0.38,
    lightSweep: 0.82
  },
  APEX: {
    cameraPos: new THREE.Vector3(2.6, 1.35, 3.2),
    cameraLookAt: new THREE.Vector3(0, 0.55, 0),
    fov: 72,
    keyIntensity: 3.2,
    fillIntensity: 0.83,
    ambientIntensity: 0.15,
    keyColor: new THREE.Color('#ff3315'),
    fillColor: new THREE.Color('#3966ff'),
    motionBlur: 0.42,
    rgbShift: 0.004,
    distortion: 0.34,
    particleIntensity: 0.78,
    hudOpacity: 1,
    heroOpacity: 0.18,
    lightSweep: 0.45
  },
  BRAKING: {
    cameraPos: new THREE.Vector3(-1.5, 1.4, 3.9),
    cameraLookAt: new THREE.Vector3(-0.1, 0.5, 0),
    fov: 58,
    keyIntensity: 2.7,
    fillIntensity: 0.7,
    ambientIntensity: 0.14,
    keyColor: new THREE.Color('#ff2800'),
    fillColor: new THREE.Color('#2f58ff'),
    motionBlur: 0.25,
    rgbShift: 0.0025,
    distortion: 0.18,
    particleIntensity: 0.4,
    hudOpacity: 0.9,
    heroOpacity: 0.1,
    lightSweep: 0.2
  },
  PIT_LANE: {
    cameraPos: new THREE.Vector3(0, 2.4, 7.4),
    cameraLookAt: new THREE.Vector3(0, 0.8, 0),
    fov: 44,
    keyIntensity: 1.3,
    fillIntensity: 0.42,
    ambientIntensity: 0.18,
    keyColor: new THREE.Color('#f55c33'),
    fillColor: new THREE.Color('#4669ff'),
    motionBlur: 0.08,
    rgbShift: 0.0008,
    distortion: 0.05,
    particleIntensity: 0.2,
    hudOpacity: 0.6,
    heroOpacity: 0,
    lightSweep: 0
  }
};

export function getState(scrollProgress: number): DriveState {
  const p = clamp(scrollProgress, 0, 1);
  return stateOrder.find((state) => p >= ranges[state][0] && p <= ranges[state][1]) ?? 'PIT_LANE';
}

export function getInterpolatedConfig(scrollProgress: number): { state: DriveState; config: StateConfig } {
  const p = clamp(scrollProgress, 0, 1);
  const state = getState(p);
  const idx = stateOrder.indexOf(state);
  const nextState = stateOrder[Math.min(idx + 1, stateOrder.length - 1)];
  const [start, end] = ranges[state];
  const blend = clamp((p - start) / Math.max(end - start, 0.0001), 0, 1);
  const a = presets[state];
  const b = presets[nextState];

  const lerpVector = (va: THREE.Vector3, vb: THREE.Vector3) => va.clone().lerp(vb, blend);
  const lerpColor = (ca: THREE.Color, cb: THREE.Color) => ca.clone().lerp(cb, blend);

  return {
    state,
    config: {
      cameraPos: lerpVector(a.cameraPos, b.cameraPos),
      cameraLookAt: lerpVector(a.cameraLookAt, b.cameraLookAt),
      fov: lerp(a.fov, b.fov, blend),
      keyIntensity: lerp(a.keyIntensity, b.keyIntensity, blend),
      fillIntensity: lerp(a.fillIntensity, b.fillIntensity, blend),
      ambientIntensity: lerp(a.ambientIntensity, b.ambientIntensity, blend),
      keyColor: lerpColor(a.keyColor, b.keyColor),
      fillColor: lerpColor(a.fillColor, b.fillColor),
      motionBlur: lerp(a.motionBlur, b.motionBlur, blend),
      rgbShift: lerp(a.rgbShift, b.rgbShift, blend),
      distortion: lerp(a.distortion, b.distortion, blend),
      particleIntensity: lerp(a.particleIntensity, b.particleIntensity, blend),
      hudOpacity: lerp(a.hudOpacity, b.hudOpacity, blend),
      heroOpacity: lerp(a.heroOpacity, b.heroOpacity, blend),
      lightSweep: lerp(a.lightSweep, b.lightSweep, blend)
    }
  };
}
