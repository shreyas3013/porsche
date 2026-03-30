uniform sampler2D tDiffuse;
uniform float uAmount;
uniform float uTime;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  float ripple = sin((uv.y + uTime * 0.25) * 24.0) * 0.0025;
  uv.x += ripple * uAmount;
  uv.y += cos((uv.x + uTime * 0.2) * 18.0) * 0.002 * uAmount;
  gl_FragColor = texture2D(tDiffuse, uv);
}
