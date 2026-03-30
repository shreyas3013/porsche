uniform sampler2D tDiffuse;
uniform vec2 direction;
uniform float strength;
varying vec2 vUv;

void main() {
  vec4 color = vec4(0.0);
  float total = 0.0;
  for (int i = -8; i <= 8; i++) {
    float weight = 1.0 - abs(float(i)) / 8.0;
    vec2 uv = vUv + direction * float(i) * strength;
    color += texture2D(tDiffuse, uv) * weight;
    total += weight;
  }
  gl_FragColor = color / total;
}
