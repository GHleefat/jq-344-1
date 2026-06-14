export const sandFragmentShader = /* glsl */ `
  uniform sampler2D u_heightMap;
  uniform vec3 u_sandColor;
  uniform vec3 u_glowColor;
  uniform float u_glowIntensity;
  uniform float u_thicknessThreshold;
  uniform vec3 u_lightPosition;
  uniform float u_time;
  uniform float u_ambientStrength;
  uniform float u_specularStrength;
  uniform float u_shininess;

  varying vec2 vUv;
  varying float v_height;
  varying vec3 v_normal;
  varying vec3 v_worldPosition;
  varying vec3 v_viewPosition;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p * frequency);
      amplitude *= 0.5;
      frequency *= 2.0;
    }
    return value;
  }

  void main() {
    vec3 normal = normalize(v_normal);

    float height = v_height;

    float sandGrain = fbm(vUv * 150.0) * 0.1;
    float fineGrain = noise(vUv * 400.0) * 0.06;
    float microGrain = noise(vUv * 800.0) * 0.03;
    float grainCombined = sandGrain + fineGrain + microGrain;

    float hRate = 0.002;
    float hL = noise(vUv * 150.0 - vec2(hRate, 0.0));
    float hR = noise(vUv * 150.0 + vec2(hRate, 0.0));
    float hD = noise(vUv * 150.0 - vec2(0.0, hRate));
    float hU = noise(vUv * 150.0 + vec2(0.0, hRate));
    vec3 grainNormal = normalize(vec3(hL - hR, hD - hU, 1.0));
    normal = normalize(mix(normal, normal + grainNormal * 0.15, 0.5));

    vec3 sandBase = u_sandColor;
    sandBase += grainCombined * 0.2;
    sandBase *= 1.0 + grainCombined * 0.05;

    vec3 lightSand = u_sandColor * vec3(1.2, 1.1, 0.9);
    vec3 darkSand = u_sandColor * vec3(0.85, 0.9, 0.95);
    sandBase = mix(darkSand, lightSand, fbm(vUv * 30.0) * 0.5 + 0.25);

    float darken = height * 0.2;
    sandBase = mix(sandBase, sandBase * 0.8, darken);

    vec3 lightDir = normalize(u_lightPosition - v_worldPosition);

    float diff = max(dot(normal, lightDir), 0.0);
    float diffuseWrap = max(dot(normal, lightDir) * 0.5 + 0.5, 0.0);
    vec3 diffuse = diff * sandBase * 1.2;

    vec3 viewDir = normalize(-v_viewPosition);
    vec3 halfDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfDir), 0.0), u_shininess);
    vec3 specular = u_specularStrength * spec * vec3(0.95, 0.9, 0.8);

    float rim = 1.0 - max(dot(viewDir, normal), 0.0);
    rim = pow(rim, 2.5) * 0.4;
    vec3 rimLight = rim * u_sandColor * 0.6;

    vec3 ambient = u_ambientStrength * sandBase * 1.1;

    float transmittance = 1.0 - smoothstep(0.0, u_thicknessThreshold, height);
    float glowFalloff = transmittance * transmittance * (3.0 - 2.0 * transmittance);
    vec3 glowColor = u_glowColor * glowFalloff * u_glowIntensity;

    float subsurface = transmittance * 0.4 * diffuseWrap;
    vec3 subsurfaceColor = u_glowColor * subsurface;

    vec3 finalColor = ambient + diffuse + specular + rimLight + glowColor + subsurfaceColor;

    float heightBias = height * 0.15 - 0.05;
    finalColor += heightBias;

    float grainShadow = grainCombined * 0.15;
    finalColor -= grainShadow;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;
