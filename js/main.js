/**
 * Main application entry point - Sets up Three.js scene, animation loop, and hand tracking
 */

// Helper function to set phase text in HUD
function setPhase(t) {
  document.getElementById('phase-text').textContent = t;
}

// Main application initialization
(async function main() {
  // ============================================================
  // THREE.JS SETUP
  // ============================================================
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000005, 0.015);

  const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 12);

  const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('three-canvas'),
    antialias: true,
    powerPreference: 'high-performance',
  });

  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  // Handle window resize
  window.addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  // ============================================================
  // SCENE SETUP
  // ============================================================
  const clock = new THREE.Clock();

  // Create energy orbs
  const blueOrb = new EnergyOrb('blue', scene);
  const redOrb = new EnergyOrb('red', scene);

  // Effects system
  const fx = new Effects(scene, camera);

  // Fusion system
  const fusion = new FusionSystem(scene, blueOrb, redOrb, fx, camera);

  // ============================================================
  // UI SETUP
  // ============================================================
  const startBtn = document.getElementById('start-btn');
  const loadingStatus = document.getElementById('loading-status');

  startBtn.addEventListener('click', async () => {
    startBtn.disabled = true;
    startBtn.textContent = 'INITIALIZING...';
    loadingStatus.textContent = 'Loading hand tracking model...';

    try {
      await HandTracker.init();
      loadingStatus.textContent = 'Camera active. Show your hands!';

      setTimeout(() => {
        document.getElementById('loading-screen').classList.add('hidden');
      }, 800);
    } catch (err) {
      loadingStatus.textContent = 'Camera access failed. Please allow camera permissions.';
      startBtn.textContent = 'RETRY';
      startBtn.disabled = false;
      console.error(err);
      return;
    }
  });

  // ============================================================
  // MOUSE FALLBACK MODE
  // ============================================================
  let mouseMode = false;
  let mouseX = 0;
  let mouseY = 0;
  let mouseDown = false;

  window.addEventListener('keydown', (e) => {
    if (e.key === 'm' || e.key === 'M') {
      mouseMode = !mouseMode;
      document.getElementById('hud-sub').textContent = mouseMode ? 'MOUSE MODE' : 'HAND TRACKING ACTIVE';

      if (mouseMode) {
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('webcam').style.display = 'none';
        document.getElementById('hand-overlay').style.display = 'none';
      }
    }
  });

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX / innerWidth;
    mouseY = e.clientY / innerHeight;
  });

  window.addEventListener('mousedown', () => {
    mouseDown = true;
  });

  window.addEventListener('mouseup', () => {
    mouseDown = false;
  });

  // ============================================================
  // ANIMATION LOOP
  // ============================================================
  function animate() {
    requestAnimationFrame(animate);

    // Time calculations
    const dt = Math.min(clock.getDelta(), 0.05);
    const time = clock.getElapsedTime();
    const energy = 1.2;

    // ===== INPUT HANDLING =====
    if (mouseMode) {
      // Mouse control mode - simulates both hands from cursor
      // Left half = blue hand, right half = red hand
      const lp = {
        x: mouseX - 0.15,
        y: mouseY,
        z: 0
      };
      const rp = {
        x: mouseX + 0.15,
        y: mouseY,
        z: 0
      };

      // When clicking, bring hands closer together
      if (mouseDown) {
        lp.x = mouseX - 0.02;
        rp.x = mouseX + 0.02;
      }

      fusion.updateHands(lp, rp, false, false, dt, time);

      // Click to fire when fused
      if (mouseDown && fusion.state === 'fused') {
        fusion.fire(new THREE.Vector3(0, 0, -1));
      }
    } else {
      // Hand tracking mode
      const lp = HandTracker.getPalmCenter(HandTracker.getLeft());
      const rp = HandTracker.getPalmCenter(HandTracker.getRight());
      const lPush = HandTracker.isPushing(HandTracker.getLeft());
      const rPush = HandTracker.isPushing(HandTracker.getRight());

      fusion.updateHands(lp, rp, lPush, rPush, dt, time);
    }

    // ===== UPDATE SYSTEMS =====
    // Update orbs
    if (blueOrb.group.visible) {
      blueOrb.update(time, dt, energy);
    }
    if (redOrb.group.visible) {
      redOrb.update(time, dt, energy);
    }

    // Update fusion
    fusion.update(time, dt);

    // Update effects
    fx.update(time, dt);

    // ===== DYNAMIC EXPOSURE =====
    // Bright exposure during certain fusion phases for dramatic effect
    let exp = 1.0;
    if (fusion.state === 'fusing') {
      exp = 1 + Math.sin(time * 5) * 0.15;
    } else if (fusion.state === 'fused') {
      exp = 1.2;
    }
    renderer.toneMappingExposure = exp;

    // ===== RENDER =====
    renderer.render(scene, camera);
  }

  animate();
})();
