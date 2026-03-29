/**
 * GLSL Shader definitions for particles, orbs, and effects
 */
const Shaders = {
  // ========== PARTICLE SHADERS ==========
  particleVert: `
    attribute float aSize;
    attribute float aAlpha;
    attribute vec3 aColor;
    attribute float aPhase;
    varying float vAlpha;
    varying vec3 vColor;
    uniform float uTime;
    uniform float uEnergy;
    void main() {
      vAlpha = aAlpha;
      vColor = aColor;
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      float pulse = 1.0 + 0.3 * sin(uTime * 3.0 + aPhase) * uEnergy;
      gl_PointSize = aSize * pulse * (200.0 / -mv.z);
      gl_Position = projectionMatrix * mv;
    }
  `,

  particleFrag: `
    varying float vAlpha;
    varying vec3 vColor;
    void main() {
      vec2 c = gl_PointCoord - 0.5;
      float d = length(c);
      if (d > 0.5) discard;
      float glow = exp(-d * 4.0);
      float core = exp(-d * 12.0);
      float a = (glow * 0.5 + core * 0.8) * vAlpha;
      vec3 col = mix(vColor, vec3(1.0), core * 0.6);
      gl_FragColor = vec4(col, a);
    }
  `,

  // ========== ORB SHADERS ==========
  orbVert: `
    varying vec2 vUv;
    varying vec3 vNormal;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  orbFrag: `
    varying vec2 vUv;
    varying vec3 vNormal;
    uniform vec3 uColor;
    uniform float uIntensity;
    uniform float uTime;
    void main() {
      float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0,0,1))), 2.5);
      float pulse = 1.0 + 0.15 * sin(uTime * 4.0);
      float n = sin(vUv.x*20.0+uTime*2.0)*sin(vUv.y*20.0-uTime*1.5)*0.1;
      float a = (fresnel + n) * uIntensity * pulse;
      vec3 col = mix(uColor, vec3(1.0), fresnel * 0.4);
      gl_FragColor = vec4(col, a * 0.7);
    }
  `,

  // ========== SHOCKWAVE SHADERS ==========
  shockVert: `
    varying vec2 vUv;
    void main() { 
      vUv = uv; 
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); 
    }
  `,

  shockFrag: `
    varying vec2 vUv;
    uniform float uProgress;
    uniform vec3 uColor;
    void main() {
      float d = length(vUv - 0.5);
      float ring = smoothstep(uProgress-0.05, uProgress, d) - smoothstep(uProgress, uProgress+0.05, d);
      float a = ring * (1.0 - uProgress) * 2.0;
      gl_FragColor = vec4(uColor, a);
    }
  `,

  // ========== BACKGROUND SHADERS ==========
  bgVert: `
    varying vec2 vUv;
    void main() { 
      vUv = uv; 
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); 
    }
  `,

  bgFrag: `
    varying vec2 vUv;
    uniform float uTime;
    
    float hash(vec2 p) { 
      return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); 
    }
    
    float noise(vec2 p) {
      vec2 i=floor(p), f=fract(p); 
      f=f*f*(3.0-2.0*f);
      return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), 
                 mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), 
                 f.y);
    }
    
    void main() {
      vec2 uv = vUv - 0.5;
      float n = noise(uv*3.0+uTime*0.1)*0.5 + noise(uv*6.0-uTime*0.15)*0.25;
      float vig = 1.0 - length(uv)*1.2;
      gl_FragColor = vec4(mix(vec3(0.05,0.02,0.15), vec3(0.02,0.05,0.15), n), n*vig*0.08);
    }
  `
};
