uniform sampler2D tDiffuse;
uniform float time;
uniform float amount;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  float wave = sin((uv.y * 15.0) + time * 4.0) * 0.002;
  float radial = length(uv - 0.5);
  uv.x += wave * amount;
  uv += (uv - 0.5) * radial * amount * 0.08;
  gl_FragColor = texture2D(tDiffuse, uv);
}
