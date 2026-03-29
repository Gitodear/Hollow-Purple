/**
 * Configuration constants for the Hollow Purple experience
 */
const CONFIG = {
  // Particle counts
  BLUE_PARTICLES: 3000,
  RED_PARTICLES: 3000,
  PURPLE_PARTICLES: 5000,

  // Fusion mechanics
  FUSION_TRIGGER_DIST: 0.13,    // Distance between hands to trigger fusion (normalized)
  FUSION_HOLD_TIME: 0.8,        // Time hands must stay close to initiate fusion (seconds)

  // Color definitions (RGB 0-1 range)
  COLORS: {
    BLUE: new THREE.Color(0.15, 0.35, 1.0),
    BLUE_GLOW: new THREE.Color(0.1, 0.2, 0.9),
    RED: new THREE.Color(1.0, 0.15, 0.2),
    RED_GLOW: new THREE.Color(0.9, 0.1, 0.15),
    PURPLE: new THREE.Color(0.6, 0.1, 1.0),
    PURPLE_GLOW: new THREE.Color(0.5, 0.05, 0.9),
    WHITE: new THREE.Color(1, 1, 1),
  },

  // Phase durations (seconds)
  FUSION_DURATION: {
    INSTABILITY: 2.0,      // Energy fluctuation phase
    ORBIT: 2.5,            // Orbital converging phase
    STRETCH: 2.0,          // Energy stretching phase
    ANTICIPATION: 1.8,     // Dramatic buildup
    COLLAPSE: 0.8,         // Orbs compress
    FLASH: 0.5,            // White flash
    BIRTH: 2.5,            // Purple orb appears
  }
};
