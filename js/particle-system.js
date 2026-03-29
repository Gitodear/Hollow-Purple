/**
 * ParticleSystem - Manages particle physics and rendering
 */
class ParticleSystem {
  constructor(count, color, radius, pSize) {
    this.count = count;
    this.geo = new THREE.BufferGeometry();
    this.pos = new Float32Array(count * 3);
    this.vel = new Float32Array(count * 3);
    this.sizes = new Float32Array(count);
    this.alphas = new Float32Array(count);
    this.colors = new Float32Array(count * 3);
    this.phases = new Float32Array(count);
    this.speeds = new Float32Array(count);

    // Initialize particles with random distribution
    for (let i = 0; i < count; i++) {
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      const r = Math.pow(Math.random(), 0.5) * radius;

      // Position - random point on sphere
      this.pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      this.pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      this.pos[i * 3 + 2] = r * Math.cos(ph);

      // Velocity - starts at zero
      this.vel[i * 3] = 0;
      this.vel[i * 3 + 1] = 0;
      this.vel[i * 3 + 2] = 0;

      // Size variation
      this.sizes[i] = (0.5 + Math.random() * 1.5) * pSize;
      
      // Alpha variation
      this.alphas[i] = 0.3 + Math.random() * 0.7;
      
      // Phase for animation offset
      this.phases[i] = Math.random() * Math.PI * 2;
      
      // Individual speed multiplier
      this.speeds[i] = 0.5 + Math.random() * 1.5;

      // Color variation
      const v = 0.15;
      this.colors[i * 3] = color.r + (Math.random() - 0.5) * v;
      this.colors[i * 3 + 1] = color.g + (Math.random() - 0.5) * v;
      this.colors[i * 3 + 2] = color.b + (Math.random() - 0.5) * v;
    }

    // Setup geometry attributes
    this.geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    this.geo.setAttribute('aSize', new THREE.BufferAttribute(this.sizes, 1));
    this.geo.setAttribute('aAlpha', new THREE.BufferAttribute(this.alphas, 1));
    this.geo.setAttribute('aColor', new THREE.BufferAttribute(this.colors, 3));
    this.geo.setAttribute('aPhase', new THREE.BufferAttribute(this.phases, 1));

    // Material with custom shaders
    this.mat = new THREE.ShaderMaterial({
      vertexShader: Shaders.particleVert,
      fragmentShader: Shaders.particleFrag,
      uniforms: {
        uTime: { value: 0 },
        uEnergy: { value: 1 }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.mesh = new THREE.Points(this.geo, this.mat);
  }

  /**
   * Change particle color with variation
   */
  setColor(c) {
    for (let i = 0; i < this.count; i++) {
      this.colors[i * 3] = c.r + (Math.random() - 0.5) * 0.15;
      this.colors[i * 3 + 1] = c.g + (Math.random() - 0.5) * 0.15;
      this.colors[i * 3 + 2] = c.b + (Math.random() - 0.5) * 0.15;
    }
    this.geo.attributes.aColor.needsUpdate = true;
  }

  /**
   * Reset particle positions to sphere distribution
   */
  resetPositions(radius) {
    for (let i = 0; i < this.count; i++) {
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      const r = Math.random() * radius;

      this.pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      this.pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      this.pos[i * 3 + 2] = r * Math.cos(ph);

      // Reset velocity
      this.vel[i * 3] = 0;
      this.vel[i * 3 + 1] = 0;
      this.vel[i * 3 + 2] = 0;
    }
    this.geo.attributes.position.needsUpdate = true;
  }
}
