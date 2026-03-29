/**
 * Fusion System - Manages fusion phases and attack mechanics
 */
class FusionSystem {
  constructor(scene, blue, red, fx, camera) {
    this.scene = scene;
    this.blue = blue;
    this.red = red;
    this.fx = fx;
    this.camera = camera;

    this.state = 'idle';
    this.fusionTimer = 0;
    this.proximityTimer = 0;
    this.fusionCenter = new THREE.Vector3();
    this.purplePos = new THREE.Vector3();
    this.fireVel = new THREE.Vector3();
    this.fireTime = 0;

    // ===== PURPLE ORB PARTICLES =====
    this.pp = new ParticleSystem(
      CONFIG.PURPLE_PARTICLES,
      CONFIG.COLORS.PURPLE,
      0.01,
      1.3
    );
    this.pp.mesh.visible = false;
    scene.add(this.pp.mesh);

    // ===== PURPLE ORB CORE =====
    this.pCoreMat = new THREE.ShaderMaterial({
      vertexShader: Shaders.orbVert,
      fragmentShader: Shaders.orbFrag,
      uniforms: {
        uColor: { value: CONFIG.COLORS.PURPLE.clone() },
        uIntensity: { value: 2 },
        uTime: { value: 0 }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    this.pCore = new THREE.Mesh(new THREE.SphereGeometry(0.4, 32, 32), this.pCoreMat);
    this.pCore.visible = false;
    scene.add(this.pCore);

    // ===== PURPLE ORB GLOW =====
    this.pGlowMat = new THREE.ShaderMaterial({
      vertexShader: Shaders.orbVert,
      fragmentShader: Shaders.orbFrag,
      uniforms: {
        uColor: { value: CONFIG.COLORS.PURPLE_GLOW.clone() },
        uIntensity: { value: 1 },
        uTime: { value: 0 }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.BackSide,
    });
    this.pGlow = new THREE.Mesh(new THREE.SphereGeometry(1.2, 32, 32), this.pGlowMat);
    this.pGlow.visible = false;
    scene.add(this.pGlow);

    // ===== PURPLE ORB LIGHT =====
    this.pLight = new THREE.PointLight(0x8811ff, 0, 20);
    scene.add(this.pLight);
  }

  /**
   * Update hand positions and check for fusion triggers
   */
  updateHands(leftPalm, rightPalm, leftPushing, rightPushing, dt, time) {
    if (this.state === 'idle' || this.state === 'charging') {
      // Track hand positions
      if (leftPalm) {
        this.blue.target.set(
          (leftPalm.x - 0.5) * 10,
          -(leftPalm.y - 0.5) * 6,
          leftPalm.z * -5
        );
        this.blue.detected = true;
      } else {
        this.blue.detected = false;
      }

      if (rightPalm) {
        this.red.target.set(
          (rightPalm.x - 0.5) * 10,
          -(rightPalm.y - 0.5) * 6,
          rightPalm.z * -5
        );
        this.red.detected = true;
      } else {
        this.red.detected = false;
      }

      // Check for fusion proximity
      if (leftPalm && rightPalm) {
        const dx = leftPalm.x - rightPalm.x;
        const dy = leftPalm.y - rightPalm.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Update distance bar visualization
        const proximity = Math.max(0, 1 - dist / 0.4);
        document.getElementById('distance-fill').style.height = (proximity * 100) + '%';

        if (dist < CONFIG.FUSION_TRIGGER_DIST) {
          this.proximityTimer += dt;
          this.blue.shake = Math.min(this.proximityTimer * 0.3, 0.3);
          this.red.shake = Math.min(this.proximityTimer * 0.4, 0.4);

          if (this.state === 'idle') {
            this.state = 'charging';
            setPhase('CONVERGING...');
          }

          if (this.proximityTimer > CONFIG.FUSION_HOLD_TIME) {
            // TRIGGER FUSION
            this.state = 'fusing';
            this.fusionTimer = 0;
            this.fusionCenter.addVectors(this.blue.pos, this.red.pos).multiplyScalar(0.5);
            setPhase('INSTABILITY');
          }
        } else {
          this.proximityTimer = Math.max(0, this.proximityTimer - dt * 2);
          if (this.state === 'charging' && this.proximityTimer <= 0) {
            this.state = 'idle';
            setPhase('');
          }
          this.blue.shake *= 0.9;
          this.red.shake *= 0.9;
        }
      } else {
        this.proximityTimer = Math.max(0, this.proximityTimer - dt * 3);
        document.getElementById('distance-fill').style.height = '0%';
      }
    }

    if (this.state === 'fused') {
      // Detect push-forward gesture to fire
      if (leftPushing && rightPushing) {
        this.fire(new THREE.Vector3(0, 0, -1));
      } else if (leftPalm && rightPalm) {
        // Purple orb follows average hand position
        const avgX = (leftPalm.x + rightPalm.x) / 2;
        const avgY = (leftPalm.y + rightPalm.y) / 2;
        this.purplePos.lerp(
          new THREE.Vector3(
            (avgX - 0.5) * 10,
            -(avgY - 0.5) * 6,
            0
          ),
          0.05
        );
      }
    }
  }

  /**
   * Fire the purple blast
   */
  fire(dir) {
    if (this.state !== 'fused') return;

    this.state = 'firing';
    this.fireVel.copy(dir).normalize().multiplyScalar(0.8);
    this.fireTime = 0;

    this.fx.shake(0.8);
    this.fx.flash(0.7);
    this.fx.shockwave(this.purplePos.clone(), CONFIG.COLORS.PURPLE, 22);
    this.fx.shockwave(this.purplePos.clone(), CONFIG.COLORS.WHITE, 15);

    setPhase('虚式・茈');
  }

  /**
   * Main fusion update routine
   */
  update(time, dt) {
    const D = CONFIG.FUSION_DURATION;
    switch (this.state) {
      case 'fusing':
        this.updateFusion(time, dt, D);
        break;
      case 'fused':
        this.updateFused(time, dt);
        break;
      case 'firing':
        this.updateFiring(time, dt);
        break;
      case 'cooldown':
        this.updateCooldown(time, dt);
        break;
    }
  }

  /**
   * Fusion animation sequence with 6 major phases
   */
  updateFusion(time, dt, D) {
    this.fusionTimer += dt;
    const ft = this.fusionTimer;
    const center = this.fusionCenter;

    const t1 = D.INSTABILITY;
    const t2 = t1 + D.ORBIT;
    const t3 = t2 + D.STRETCH;
    const t3b = t3 + D.ANTICIPATION;
    const t4 = t3b + D.COLLAPSE;
    const t5 = t4 + D.FLASH;
    const t6 = t5 + D.BIRTH;

    if (ft < t1) {
      // PHASE 1: INSTABILITY - energy fluctuation
      const p = ft / t1;
      const e = p * p;
      this.blue.shake = 0.05 + e * 0.4;
      this.red.shake = 0.08 + e * 0.55;
      this.blue.light.intensity = 2 + Math.random() * e * 5;
      this.red.light.intensity = 2 + Math.random() * e * 6;
      this.fx.shake(e * 0.1);
      setPhase('INSTABILITY');
    }
    else if (ft < t2) {
      // PHASE 2: ORBIT - orbs spiral toward center
      setPhase('CONVERGENCE');
      const p = (ft - t1) / D.ORBIT;
      const spd = 1.5 + Math.pow(p, 2) * 14;
      const ang = ft * spd;
      const r = 2.0 * (1 - Math.pow(p, 1.5) * 0.75);

      this.blue.target.set(
        center.x + Math.cos(ang) * r,
        center.y + Math.sin(ang) * r * 0.6,
        center.z + Math.sin(ang * 0.7) * r * 0.3
      );
      this.red.target.set(
        center.x - Math.cos(ang) * r,
        center.y - Math.sin(ang) * r * 0.6,
        center.z - Math.sin(ang * 0.7) * r * 0.3
      );

      this.blue.shake = 0.2 + p * 0.3;
      this.red.shake = 0.3 + p * 0.4;
      this.fx.shake(p * 0.14);
    }
    else if (ft < t3) {
      // PHASE 3: STRETCH - particles stretch toward center
      setPhase('RESONANCE');
      const p = (ft - t2) / D.STRETCH;
      const e = 1 - Math.pow(1 - p, 3);

      this.blue.target.lerp(center, e * 0.15);
      this.red.target.lerp(center, e * 0.15);
      this.stretchTo(this.blue.particles, center, this.blue.pos, e);
      this.stretchTo(this.red.particles, center, this.red.pos, e);
      this.blendCol(this.blue.particles, CONFIG.COLORS.BLUE, CONFIG.COLORS.PURPLE, e * 0.5);
      this.blendCol(this.red.particles, CONFIG.COLORS.RED, CONFIG.COLORS.PURPLE, e * 0.5);

      this.blue.shake = 0.4;
      this.red.shake = 0.5;
      this.fx.shake(0.15 + e * 0.1);
    }
    else if (ft < t3b) {
      // PHASE 3.5: ANTICIPATION - dramatic pause
      setPhase('CRITICAL MASS');
      const p = (ft - t3) / D.ANTICIPATION;
      const hover = 0.6 * (1 - p * 0.3);
      const tremble = Math.sin(ft * 40) * 0.03 * (1 + p * 2);

      this.blue.target.copy(center).add(new THREE.Vector3(-hover + tremble, tremble, 0));
      this.red.target.copy(center).add(new THREE.Vector3(hover + tremble, -tremble, 0));

      const pulse = Math.pow(Math.sin(ft * 3 + p * 5), 2);
      this.blue.light.intensity = 4 + pulse * 6;
      this.red.light.intensity = 4 + pulse * 7;
      this.blue.core.scale.setScalar(1 + pulse * 0.4);
      this.red.core.scale.setScalar(1 + pulse * 0.5);

      this.blue.shake = 0.06 + p * 0.15;
      this.red.shake = 0.08 + p * 0.2;

      if (Math.random() < 0.03 * (1 + p * 3)) {
        this.fx.shockwave(center.clone(), CONFIG.COLORS.PURPLE, 3 + p * 3);
      }

      this.camera.fov = 60 - p * 8;
      this.camera.updateProjectionMatrix();
      this.fx.shake(0.03 + p * 0.05);

      this.blendCol(this.blue.particles, CONFIG.COLORS.BLUE, CONFIG.COLORS.PURPLE, 0.5 + p * 0.3);
      this.blendCol(this.red.particles, CONFIG.COLORS.RED, CONFIG.COLORS.PURPLE, 0.5 + p * 0.3);
    }
    else if (ft < t4) {
      // PHASE 4: COLLAPSE - orbs compress together
      setPhase('COLLAPSE');
      const p = (ft - t3b) / D.COLLAPSE;
      const e = Math.pow(p, 0.3);

      this.blue.target.lerp(center, e);
      this.red.target.lerp(center, e);

      const sc = Math.max(1 - e * 0.8, 0.1);
      this.blue.core.scale.setScalar(sc);
      this.red.core.scale.setScalar(sc);
      this.blue.glow.scale.setScalar(sc * 1.5);
      this.red.glow.scale.setScalar(sc * 1.5);

      this.blue.light.intensity = 3 + e * 12;
      this.red.light.intensity = 3 + e * 15;

      this.camera.fov = 52 + (1 - e) * 8;
      this.camera.updateProjectionMatrix();
      this.fx.shake(e * 0.4);
    }
    else if (ft < t5) {
      // PHASE 5: FLASH - bright white flash
      setPhase('');
      const p = (ft - t4) / D.FLASH;

      if (p < 0.1) {
        this.fx.flash(1.3);
        this.fx.shake(0.8);
        this.fx.shockwave(center.clone(), CONFIG.COLORS.WHITE, 20);
        this.fx.shockwave(center.clone(), CONFIG.COLORS.PURPLE, 14);

        this.camera.fov = 60;
        this.camera.updateProjectionMatrix();
      }

      this.blue.setVisible(false);
      this.red.setVisible(false);
    }
    else if (ft < t6) {
      // PHASE 6: BIRTH - purple orb appears
      setPhase('FUSION COMPLETE');
      const p = (ft - t5) / D.BIRTH;
      const e = 1 - Math.pow(1 - p, 4);

      this.purplePos.copy(center);
      this.pCore.visible = true;
      this.pGlow.visible = true;
      this.pp.mesh.visible = true;

      this.pCore.position.copy(center);
      this.pGlow.position.copy(center);
      this.pp.mesh.position.copy(center);

      this.pCore.scale.setScalar(e * 1.2);
      this.pGlow.scale.setScalar(e * 1.8);

      this.pCoreMat.uniforms.uTime.value = time;
      this.pCoreMat.uniforms.uIntensity.value = 2 + (1 - e) * 3;
      this.pGlowMat.uniforms.uTime.value = time;
      this.pGlowMat.uniforms.uIntensity.value = 1 + (1 - e) * 2;
      this.pp.mat.uniforms.uTime.value = time;
      this.pp.mat.uniforms.uEnergy.value = 1.5;

      this.pLight.position.copy(center);
      this.pLight.intensity = e * 5;

      this.updatePurple(time, dt, center, e);

      if (p >= 1) {
        this.state = 'fused';
        setPhase('PUSH FORWARD TO FIRE');
      }
    }
  }

  /**
   * Stretch particle system toward target
   */
  stretchTo(ps, target, orbPos, amt) {
    const wt = new THREE.Vector3().subVectors(target, orbPos);
    for (let i = 0; i < ps.count; i++) {
      const i3 = i * 3;
      ps.pos[i3] += wt.x * amt * 0.03 * (0.5 + Math.random() * 0.5);
      ps.pos[i3 + 1] += wt.y * amt * 0.03 * (0.5 + Math.random() * 0.5);
      ps.pos[i3 + 2] += wt.z * amt * 0.03 * (0.5 + Math.random() * 0.5);
    }
    ps.geo.attributes.position.needsUpdate = true;
  }

  /**
   * Blend particle color from one to another
   */
  blendCol(ps, from, to, amt) {
    for (let i = 0; i < ps.count; i++) {
      const i3 = i * 3;
      const v = 0.1;
      ps.colors[i3] = from.r * (1 - amt) + to.r * amt + (Math.random() - 0.5) * v;
      ps.colors[i3 + 1] = from.g * (1 - amt) + to.g * amt + (Math.random() - 0.5) * v;
      ps.colors[i3 + 2] = from.b * (1 - amt) + to.b * amt + (Math.random() - 0.5) * v;
    }
    ps.geo.attributes.aColor.needsUpdate = true;
  }

  /**
   * Update purple particle physics
   */
  updatePurple(time, dt, center, birth) {
    const p = this.pp.pos;
    const v = this.pp.vel;
    const al = this.pp.alphas;
    const ph = this.pp.phases;

    for (let i = 0; i < this.pp.count; i++) {
      const i3 = i * 3;
      const px = p[i3];
      const py = p[i3 + 1];
      const pz = p[i3 + 2];
      const d = Math.sqrt(px * px + py * py + pz * pz) + 0.001;

      const tR = 0.3 + Math.sin(time * 3 + ph[i]) * 0.5;
      const pull = (d - tR) * 0.04;
      const ang = Math.atan2(py, px) + 0.06;

      v[i3] += (-px / d * pull + Math.cos(ang) * 0.008 + (Math.random() - 0.5) * 0.005) * dt * 60;
      v[i3 + 1] += (-py / d * pull + Math.sin(ang) * 0.008 + (Math.random() - 0.5) * 0.005) * dt * 60;
      v[i3 + 2] += (-pz / d * pull + Math.sin(time * 2 + ph[i]) * 0.003) * dt * 60;

      v[i3] *= 0.95;
      v[i3 + 1] *= 0.95;
      v[i3 + 2] *= 0.95;

      p[i3] += v[i3] * dt * 60;
      p[i3 + 1] += v[i3 + 1] * dt * 60;
      p[i3 + 2] += v[i3 + 2] * dt * 60;

      al[i] = Math.min(birth * 1.5, 1) * (0.3 + (1 - Math.min(d / 1.5, 1)) * 0.7);
    }

    this.pp.geo.attributes.position.needsUpdate = true;
    this.pp.geo.attributes.aAlpha.needsUpdate = true;
  }

  /**
   * Update fused purple orb state
   */
  updateFused(time, dt) {
    this.pCoreMat.uniforms.uTime.value = time;
    this.pGlowMat.uniforms.uTime.value = time;
    this.pp.mat.uniforms.uTime.value = time;

    const pulse = 1 + Math.sin(time * 3) * 0.1;
    this.pCore.scale.setScalar(1.2 * pulse);
    this.pGlow.scale.setScalar(1.8 * pulse);
    this.pLight.intensity = 5 + Math.sin(time * 4);

    this.updatePurple(time, dt, this.purplePos, 1);

    this.pCore.position.copy(this.purplePos);
    this.pGlow.position.copy(this.purplePos);
    this.pp.mesh.position.copy(this.purplePos);
    this.pLight.position.copy(this.purplePos);
  }

  /**
   * Update firing state - projectile motion
   */
  updateFiring(time, dt) {
    this.fireTime += dt;
    this.purplePos.add(this.fireVel.clone().multiplyScalar(dt * 60));
    this.fireVel.multiplyScalar(1.02);

    this.pCore.position.copy(this.purplePos);
    this.pGlow.position.copy(this.purplePos);
    this.pp.mesh.position.copy(this.purplePos);
    this.pLight.position.copy(this.purplePos);

    this.pCoreMat.uniforms.uTime.value = time;
    this.pGlowMat.uniforms.uTime.value = time;
    this.pp.mat.uniforms.uTime.value = time;

    if (Math.random() < 0.15) {
      this.fx.shockwave(this.purplePos.clone(), CONFIG.COLORS.PURPLE, 5);
    }

    // Add particle chaos
    const p = this.pp.pos;
    const v = this.pp.vel;
    for (let i = 0; i < this.pp.count; i++) {
      const i3 = i * 3;
      v[i3] += (Math.random() - 0.5) * 0.05;
      v[i3 + 1] += (Math.random() - 0.5) * 0.05;
      v[i3 + 2] += (Math.random() - 0.5) * 0.03;

      p[i3] += v[i3] * dt * 60;
      p[i3 + 1] += v[i3 + 1] * dt * 60;
      p[i3 + 2] += v[i3 + 2] * dt * 60;
    }
    this.pp.geo.attributes.position.needsUpdate = true;

    this.fx.shake(0.15 * Math.max(0, 1 - this.fireTime));

    if (this.fireTime > 3) {
      this.state = 'cooldown';
      this.fireTime = 0;
    }
  }

  /**
   * Cooldown state - fade out
   */
  updateCooldown(time, dt) {
    this.fireTime += dt;
    const fade = 1 - Math.min(this.fireTime / 1.5, 1);

    this.pCoreMat.uniforms.uIntensity.value = fade * 2;
    this.pGlowMat.uniforms.uIntensity.value = fade;
    this.pLight.intensity = fade * 5;

    if (this.fireTime > 1.5) {
      this.reset();
    }
  }

  /**
   * Reset fusion system to idle state
   */
  reset() {
    this.state = 'idle';
    this.fusionTimer = 0;
    this.proximityTimer = 0;
    this.fireTime = 0;

    this.blue.setVisible(true);
    this.red.setVisible(true);
    this.blue.shake = 0;
    this.red.shake = 0;

    this.blue.core.scale.setScalar(1);
    this.red.core.scale.setScalar(1);
    this.blue.glow.scale.setScalar(1);
    this.red.glow.scale.setScalar(1);

    this.pCore.visible = false;
    this.pGlow.visible = false;
    this.pp.mesh.visible = false;
    this.pLight.intensity = 0;

    this.pp.resetPositions(0.01);
    this.blue.particles.setColor(CONFIG.COLORS.BLUE);
    this.red.particles.setColor(CONFIG.COLORS.RED);

    this.camera.fov = 60;
    this.camera.updateProjectionMatrix();

    setPhase('');
    document.getElementById('distance-fill').style.height = '0%';
  }
}
