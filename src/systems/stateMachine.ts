import * as THREE from 'three';

export type DriveState =
  | 'STATIC'
  | 'IGNITION'
  | 'FIRST_GEAR'
  | 'ACCELERATION'
  | 'APEX'
  | 'BRAKING'
  | 'PIT_LANE';

export interface StateTargets {
  cameraPosition: THREE.Vector3;
  cameraLookAt: THREE.Vector3;
  keyIntensity: number;
  keyColor: string;
  fillIntensity: number;
  fillColor: string;
  fov: number;
  uiAlpha: number;
  particleIntensity: number;
  baseBlur: number;
  baseRgbShift: number;
}

const STATES: Array<{ state: DriveState; min: number; max: number; targets: StateTargets }> = [
  {
    state: 'STATIC',
    min: 0,
    max: 0.08,
    targets: {
      cameraPosition: new THREE.Vector3(0, 2.1, 8.7),
      cameraLookAt: new THREE.Vector3(0, 0.8, 0),
      keyIntensity: 1.2,
      keyColor: '#aa1f0a',
      fillIntensity: 0.2,
      fillColor: '#1a2f74',
      fov: 35,
      uiAlpha: 1,
      particleIntensity: 0.04,
      baseBlur: 0,
      baseRgbShift: 0,
    },
  },
  {
    state: 'IGNITION',
    min: 0.08,
    max: 0.2,
    targets: {
      cameraPosition: new THREE.Vector3(-1.2, 1.8, 6.4),
      cameraLookAt: new THREE.Vector3(0, 0.8, 0),
      keyIntensity: 2.4,
      keyColor: '#ff2800',
      fillIntensity: 0.4,
      fillColor: '#1e44b8',
      fov: 44,
      uiAlpha: 0.95,
      particleIntensity: 0.1,
      baseBlur: 0.08,
      baseRgbShift: 0.001,
    },
  },
  {
    state: 'FIRST_GEAR',
    min: 0.2,
    max: 0.35,
    targets: {
      cameraPosition: new THREE.Vector3(-2.2, 1.2, 4.8),
      cameraLookAt: new THREE.Vector3(0, 0.7, 0),
      keyIntensity: 3,
      keyColor: '#ff3c1e',
      fillIntensity: 0.6,
      fillColor: '#2244ff',
      fov: 52,
      uiAlpha: 0.85,
      particleIntensity: 0.22,
      baseBlur: 0.12,
      baseRgbShift: 0.0018,
    },
  },
  {
    state: 'ACCELERATION',
    min: 0.35,
    max: 0.55,
    targets: {
      cameraPosition: new THREE.Vector3(-1.1, 0.9, 2.8),
      cameraLookAt: new THREE.Vector3(0.6, 0.5, -0.4),
      keyIntensity: 3.4,
      keyColor: '#ff2800',
      fillIntensity: 0.8,
      fillColor: '#1a32c7',
      fov: 66,
      uiAlpha: 0.74,
      particleIntensity: 0.38,
      baseBlur: 0.2,
      baseRgbShift: 0.0028,
    },
  },
  {
    state: 'APEX',
    min: 0.55,
    max: 0.7,
    targets: {
      cameraPosition: new THREE.Vector3(1.9, 1.3, 2.2),
      cameraLookAt: new THREE.Vector3(0.3, 0.4, -1.1),
      keyIntensity: 2.8,
      keyColor: '#ff5a38',
      fillIntensity: 1,
      fillColor: '#2a59ff',
      fov: 74,
      uiAlpha: 0.62,
      particleIntensity: 0.44,
      baseBlur: 0.23,
      baseRgbShift: 0.003,
    },
  },
  {
    state: 'BRAKING',
    min: 0.7,
    max: 0.85,
    targets: {
      cameraPosition: new THREE.Vector3(0.6, 1.4, 3.6),
      cameraLookAt: new THREE.Vector3(-0.2, 0.5, -0.8),
      keyIntensity: 2.2,
      keyColor: '#f94e34',
      fillIntensity: 0.7,
      fillColor: '#2f4ae8',
      fov: 82,
      uiAlpha: 0.48,
      particleIntensity: 0.28,
      baseBlur: 0.15,
      baseRgbShift: 0.0024,
    },
  },
  {
    state: 'PIT_LANE',
    min: 0.85,
    max: 1,
    targets: {
      cameraPosition: new THREE.Vector3(0, 2.5, 6.2),
      cameraLookAt: new THREE.Vector3(0, 0.5, -1.6),
      keyIntensity: 1.4,
      keyColor: '#c72c16',
      fillIntensity: 0.5,
      fillColor: '#1f3fbc',
      fov: 58,
      uiAlpha: 0.92,
      particleIntensity: 0.1,
      baseBlur: 0.06,
      baseRgbShift: 0.0012,
    },
  },
];

export const getState = (scrollProgress: number): DriveState => {
  const entry = STATES.find((item) => scrollProgress >= item.min && scrollProgress < item.max);
  return entry?.state ?? 'PIT_LANE';
};

export const getStateConfig = (scrollProgress: number) => {
  const clamped = Math.min(1, Math.max(0, scrollProgress));
  const currentIndex = STATES.findIndex((s) => clamped >= s.min && clamped < s.max);
  const index = currentIndex === -1 ? STATES.length - 1 : currentIndex;
  const current = STATES[index];
  const next = STATES[Math.min(index + 1, STATES.length - 1)];
  const localProgress = current === next ? 0 : (clamped - current.min) / (current.max - current.min);

  return {
    state: current.state,
    nextState: next.state,
    blend: Math.min(1, Math.max(0, localProgress)),
    current: current.targets,
    next: next.targets,
  };
};
