/**
 * EnergyOrb - Represents blue or red orb with particles, core, and glow
 */
class EnergyOrb {
  constructor(type, scene) {
    this.type = type;
    this.pos = new THREE.Vector3(type === 'blue' ? -3 : 3, 0, 0);
    this.target = this.pos.clone();
    this.group = new THREE.Group();
    this.shake = 0;
    this.detected = false;

    const isB = type === 'blue';
    const col = isB ? CONFIG.COLORS.BLUE : CONFIG.COLORS.RED;
    const gCol = isB ? CONFIG.COLORS.BLUE_GLOW : CONFIG.COLORS.RED_GLOW;

    // ===== CORE =====
    this.coreMat = new THREE.ShaderMaterial({
      vertexShader: Shaders.orbVert,
      fragmentShader: Shaders.orbFrag,
      uniforms: {
        uColor: { value: col.clone() },
        uIntensity: { value: 1.5 },
        uTime: { value: 0 }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    this.core = new THREE.Mesh(new THREE.SphereGeometry(0.3, 32, 32), this.coreMat);
    this.group.add(this.core);

    // ===== GLOW =====
    this.glowMat = new THREE.ShaderMaterial({
      vertexShader: Shaders.orbVert,
      fragmentShader: Shaders.orbFrag,
      uniforms: {
        uColor: { value: gCol.clone() },
        uIntensity: { value: 0.6 },
        uTime: { value: 0 }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.BackSide,
    });
    this.glow = new THREE.Mesh(new THREE.SphereGeometry(0.8, 32, 32), this.glowMat);
    this.group.add(this.glow);

    // ===== PARTICLE SYSTEM =====
    this.particles = new ParticleSystem(
      isB ? CONFIG.BLUE_PARTICLES : CONFIG.RED_PARTICLES,
      col,
      isB ? 1.8 : 2.2,
      isB ? 1.0 : 1.2
    );
    this.group.add(this.particles.mesh);

    // ===== LIGHT =====
    this.light = new THREE.PointLight(col.getHex(), 2, 15);
    this.group.add(this.light);

    scene.add(this.group);
  }

  /**
   * Update orb position, particles, and visual effects
   */
  update(time, dt, energy) {
    const isB = this.type === 'blue';

    // Smooth movement toward target
    this.pos.lerp(this.target, isB ? 0.1 : 0.07);

    // Shake effect
    if (this.shake > 0) {
      this.pos.x += (Math.random() - 0.5) * this.shake;
      this.pos.y += (Math.random() - 0.5) * this.shake;
      this.pos.z += (Math.random() - 0.5) * this.shake * 0.5;
    }

    // Update group position
    this.group.position.copy(this.pos);

    // Update material uniforms
    this.coreMat.uniforms.uTime.value = time;
    this.coreMat.uniforms.uIntensity.value = 1.5 * energy;
    this.glowMat.uniforms.uTime.value = time;
    this.glowMat.uniforms.uIntensity.value = 0.6 * energy;
    this.particles.mat.uniforms.uTime.value = time;
    this.particles.mat.uniforms.uEnergy.value = energy;

    // Update light
    this.light.intensity = 2 * energy;

    // ===== PARTICLE PHYSICS =====
    const p = this.particles.pos;
    const v = this.particles.vel;
    const sp = this.particles.speeds;
    const ph = this.particles.phases;
    const al = this.particles.alphas;
    const cnt = this.particles.count;

    for (let i = 0; i < cnt; i++) {
      const i3 = i * 3;
      const px = p[i3];
      const py = p[i3 + 1];
      const pz = p[i3 + 2];
      const d = Math.sqrt(px * px + py * py + pz * pz) + 0.001;
      const s = sp[i] * energy;

      if (isB) {
        // BLUE: Orbital motion with inward pull
        const ang = Math.atan2(py, px) + 0.03 * s;
        const tR = 0.8 + Math.sin(time * 2 + ph[i]) * 0.4;
        const pull = (d - tR) * 0.02 * s;

        v[i3] += (-px / d * pull + Math.cos(ang) * 0.005 * s) * dt * 60;
        v[i3 + 1] += (-py / d * pull + Math.sin(ang) * 0.005 * s) * dt * 60;
        v[i3 + 2] += (-pz / d * pull + Math.sin(time + ph[i]) * 0.002) * dt * 60;

        v[i3] *= 0.96;
        v[i3 + 1] *= 0.96;
        v[i3 + 2] *= 0.96;

        al[i] = 0.3 + (1 - Math.min(d / 2, 1)) * 0.7;
      } else {
        // RED: Radial expansion with outward push
        const push = 0.015 * s / (d + 0.5);
        const jit = 0.01 * energy;

        v[i3] += (px / d * push + (Math.random() - 0.5) * jit) * dt * 60;
        v[i3 + 1] += (py / d * push + (Math.random() - 0.5) * jit) * dt * 60;
        v[i3 + 2] += (pz / d * push + (Math.random() - 0.5) * jit) * dt * 60;

        // Bound checking
        if (d > 2.5) {
          v[i3] -= px * 0.01;
          v[i3 + 1] -= py * 0.01;
          v[i3 + 2] -= pz * 0.01;
        }

        v[i3] *= 0.93;
        v[i3 + 1] *= 0.93;
        v[i3 + 2] *= 0.93;

        al[i] = 0.2 + Math.random() * 0.5 * energy;
      }

      // Update position
      p[i3] += v[i3] * dt * 60;
      p[i3 + 1] += v[i3 + 1] * dt * 60;
      p[i3 + 2] += v[i3 + 2] * dt * 60;
    }

    this.particles.geo.attributes.position.needsUpdate = true;
    this.particles.geo.attributes.aAlpha.needsUpdate = true;

    // Scale based on energy
    const sc = 0.8 + energy * 0.3;
    this.core.scale.setScalar(sc);
    this.glow.scale.setScalar(sc * 1.2);
  }

  /**
   * Toggle visibility
   */
  setVisible(v) {
    this.group.visible = v;
  }
}
