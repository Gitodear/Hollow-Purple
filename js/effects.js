/**
 * Effects system - Manages visual effects like shockwaves, flashes, and camera shake
 */
class Effects {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.shockwaves = [];
    this.camShake = 0;
    this.flashVal = 0;

    // ===== BACKGROUND =====
    const bgMat = new THREE.ShaderMaterial({
      vertexShader: Shaders.bgVert,
      fragmentShader: Shaders.bgFrag,
      uniforms: { uTime: { value: 0 } },
      transparent: true,
      depthWrite: false,
    });
    this.bg = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), bgMat);
    this.bg.position.z = -20;
    scene.add(this.bg);

    // ===== DUST PARTICLES =====
    const dCnt = 400;
    const dGeo = new THREE.BufferGeometry();
    const dP = new Float32Array(dCnt * 3);
    const dS = new Float32Array(dCnt);
    const dA = new Float32Array(dCnt);
    const dC = new Float32Array(dCnt * 3);
    const dPh = new Float32Array(dCnt);

    for (let i = 0; i < dCnt; i++) {
      dP[i * 3] = (Math.random() - 0.5) * 30;
      dP[i * 3 + 1] = (Math.random() - 0.5) * 30;
      dP[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;

      dS[i] = 0.3 + Math.random() * 0.5;
      dA[i] = 0.1 + Math.random() * 0.12;

      dC[i * 3] = 0.5;
      dC[i * 3 + 1] = 0.4;
      dC[i * 3 + 2] = 0.7;

      dPh[i] = Math.random() * Math.PI * 2;
    }

    dGeo.setAttribute('position', new THREE.BufferAttribute(dP, 3));
    dGeo.setAttribute('aSize', new THREE.BufferAttribute(dS, 1));
    dGeo.setAttribute('aAlpha', new THREE.BufferAttribute(dA, 1));
    dGeo.setAttribute('aColor', new THREE.BufferAttribute(dC, 3));
    dGeo.setAttribute('aPhase', new THREE.BufferAttribute(dPh, 1));

    this.dust = new THREE.Points(dGeo, new THREE.ShaderMaterial({
      vertexShader: Shaders.particleVert,
      fragmentShader: Shaders.particleFrag,
      uniforms: {
        uTime: { value: 0 },
        uEnergy: { value: 0.5 }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }));
    scene.add(this.dust);
  }

  /**
   * Create a shockwave effect
   */
  shockwave(pos, color, maxScale) {
    const mat = new THREE.ShaderMaterial({
      vertexShader: Shaders.shockVert,
      fragmentShader: Shaders.shockFrag,
      uniforms: {
        uProgress: { value: 0 },
        uColor: { value: color.clone() }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
    m.position.copy(pos);
    m.lookAt(this.camera.position);

    this.scene.add(m);
    this.shockwaves.push({
      mesh: m,
      progress: 0,
      speed: 0.8,
      maxScale: maxScale || 15
    });
  }

  /**
   * Trigger a white flash
   */
  flash(v) {
    this.flashVal = v;
  }

  /**
   * Trigger camera shake
   */
  shake(v) {
    this.camShake = Math.max(this.camShake, v);
  }

  /**
   * Update all effects
   */
  update(time, dt) {
    // Update background
    this.bg.material.uniforms.uTime.value = time;
    this.dust.material.uniforms.uTime.value = time;

    // Update shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const s = this.shockwaves[i];
      s.progress += s.speed * dt;
      s.mesh.material.uniforms.uProgress.value = s.progress;
      s.mesh.scale.setScalar(s.progress * s.maxScale);

      if (s.progress >= 1) {
        this.scene.remove(s.mesh);
        s.mesh.geometry.dispose();
        s.mesh.material.dispose();
        this.shockwaves.splice(i, 1);
      }
    }

    // Update camera shake
    if (this.camShake > 0.001) {
      this.camera.position.x = (Math.random() - 0.5) * this.camShake;
      this.camera.position.y = (Math.random() - 0.5) * this.camShake;
      this.camShake *= 0.92;
    } else {
      this.camera.position.x *= 0.9;
      this.camera.position.y *= 0.9;
    }

    // Update flash overlay
    const fl = document.getElementById('flash-overlay');
    if (this.flashVal > 0.001) {
      fl.style.opacity = Math.min(this.flashVal, 1);
      this.flashVal *= 0.88;
    } else {
      fl.style.opacity = 0;
    }
  }
}
