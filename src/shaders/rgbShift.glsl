uniform sampler2D tDiffuse;
uniform vec2 uDirection;
uniform float uAmount;
varying vec2 vUv;

void main() {
  vec2 offset = uDirection * uAmount;
  float r = texture2D(tDiffuse, vUv + offset).r;
  float g = texture2D(tDiffuse, vUv).g;
  float b = texture2D(tDiffuse, vUv - offset).b;
  gl_FragColor = vec4(r, g, b, 1.0);
}
