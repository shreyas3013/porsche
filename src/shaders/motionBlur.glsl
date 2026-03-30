uniform sampler2D tDiffuse;
uniform vec2 uDirection;
uniform float uIntensity;
varying vec2 vUv;

void main() {
  vec4 color = vec4(0.0);
  float total = 0.0;

  for (float i = -8.0; i <= 8.0; i++) {
    float percent = i / 8.0;
    float weight = 1.0 - abs(percent);
    vec2 sampleUv = vUv + uDirection * percent * 0.02 * uIntensity;
    color += texture2D(tDiffuse, sampleUv) * weight;
    total += weight;
  }

  gl_FragColor = color / total;
}
