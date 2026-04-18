LIVE DEMO: [ https://hollow-purple-tau.vercel.app/ ]
# 虚式・茈 — Hollow Purple | Hand Tracking Experience

An interactive, real-time hand tracking visualization inspired by Jujutsu Kaisen's "Hollow Purple" technique. This project uses Three.js for 3D rendering and MediaPipe for hand detection to create a stunning visual experience where both hands control blue and red energy orbs that fuse into a powerful purple blast.

## Features

- 🎮 **Real-time Hand Tracking** - Uses MediaPipe to detect both hands in real-time
- 🌟 **Particle Effects** - Advanced particle systems with custom shaders
- 🎨 **Energy Orbs** - Interactive blue and red orbs that follow hand positions
- ⚡ **Fusion Mechanic** - Bring hands together to trigger an epic fusion animation
- 🎯 **Gesture Detection** - Recognize hand pushing gestures to fire energy blasts
- 🎮 **Mouse Fallback** - Press 'M' to use mouse control if camera is unavailable
- 📱 **Responsive Design** - Works on desktop and tablet devices
- ✨ **Advanced Shaders** - Custom GLSL shaders for particle rendering and effects

## Project Structure

```
hollow-purple/
├── index.html              # Main HTML entry point
├── styles.css              # All styling
├── js/
│   ├── main.js             # Main application & animation loop
│   ├── config.js           # Configuration constants
│   ├── shaders.js          # GLSL shader definitions
│   ├── particle-system.js  # Particle system class
│   ├── energy-orb.js       # Energy orb class
│   ├── effects.js          # Visual effects system
│   ├── hand-tracker.js     # Hand detection & tracking
│   └── fusion-system.js    # Fusion & attack system
├── README.md               # This file
└── package.json            # Project metadata (optional)
```

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge)
- A webcam for hand tracking (or use mouse fallback)
- Internet connection (for CDN libraries)

### Usage

1. **Open `index.html`** in your web browser
2. **Click "ACTIVATE CAMERA"** to request camera permissions
3. **Show both hands** to activate the experience
4. **Bring hands together** (close proximity) to trigger fusion
5. **Push hands forward** (together) to fire the attack
6. **Press 'M'** to toggle mouse mode if camera unavailable

## How It Works

### Hand Detection Flow

1. MediaPipe Hands detects up to 2 hands with 21 landmarks each
2. Palm centers are computed by averaging key hand points
3. Hand pushing is detected by comparing wrist and fingertip distances
4. Positions are normalized to 0-1 range and mapped to 3D world space

### Fusion Sequence

The fusion process has multiple phases:

1. **IDLE** - Orbs await hand positioning
2. **CONVERGING** - Hands close to fusion distance
3. **INSTABILITY** - Orbs begin violent energy fluctuations
4. **CONVERGENCE** - Orbs orbit around fusion point
5. **RESONANCE** - Energy stretching and color blending
6. **CRITICAL MASS** - Anticipation/tension buildup
7. **COLLAPSE** - Orbs compress together
8. **FLASH** - Bright white flash effect
9. **FUSION COMPLETE** - Purple orb born and ready to fire
10. **HOLLOW PURPLE** - Attack fires and dissipates

### Particle Systems

Three independent particle systems run in parallel:

- **Blue Particles** (3000) - Orbital motion, inward attraction
- **Red Particles** (3000) - Radial expansion, outward push
- **Purple Particles** (5000) - Hybrid behavior during and after fusion

Each particle is rendered as a point sprite with custom shader-based shading, glow effects, and alpha blending.

## Technologies Used

### Frontend Libraries

- **Three.js (r128)** - 3D rendering engine
  - Custom shader materials
  - Point sprite rendering
  - Lighting and effects
- **MediaPipe Hands (0.4)** - Hand detection
  - 21-point hand landmarks
  - Multi-hand tracking
  - High accuracy at various angles

- **Camera Utils** - Webcam stream management
  - Auto-scaling to canvas
  - Frame-by-frame processing

### Graphics Pipeline

- **GLSL Shaders** - Custom vertex & fragment shaders
  - Particle effects with glow
  - Energy orb visualization
  - Shockwave animations
  - Dynamic background noise

- **Advanced Blending**
  - Additive blending for light effects
  - Screen blending for flashes
  - Dynamic exposure mapping

## Controls Reference

| Input                    | Action                         |
| ------------------------ | ------------------------------ |
| Click "ACTIVATE CAMERA"  | Start hand tracking            |
| Show both hands          | Activate energy orbs           |
| Bring hands close        | Charging fusion                |
| Hold hands together      | Trigger fusion sequence        |
| Push hands forward       | Fire purple blast (when fused) |
| Press 'M'                | Toggle mouse mode              |
| Mouse move (mouse mode)  | Position hands                 |
| Mouse click (mouse mode) | Charge/fire                    |

## Configuration

Edit `config.js` to customize:

```javascript
CONFIG = {
  BLUE_PARTICLES: 3000,           // Number of blue particles
  RED_PARTICLES: 3000,            // Number of red particles
  PURPLE_PARTICLES: 5000,         // Number of purple particles
  FUSION_TRIGGER_DIST: 0.13,      // Hand distance to trigger fusion
  FUSION_HOLD_TIME: 0.8,          // Time hands must stay together
  COLORS: { ... },                // RGB color values
  FUSION_DURATION: { ... }        // Phase durations in seconds
}
```

## Performance Optimization

- Uses device pixel ratio clamping (max 2x)
- WebGL ACES filmic tone mapping for realistic colors
- Adaptive delta time clamping (max 50ms per frame)
- Efficient particle updates with typed arrays
- Single webgl context with shared buffer geometry

## Browser Compatibility

| Browser       | Support                                    |
| ------------- | ------------------------------------------ |
| Chrome/Edge   | ✅ Full                                    |
| Firefox       | ✅ Full                                    |
| Safari        | ⚠️ Limited (hand tracking may have issues) |
| Mobile Chrome | ✅ Full                                    |
| iOS Safari    | ❌ No (WebGL/MediaPipe limitations)        |

## Troubleshooting

### Camera won't start

- Check browser permissions for camera access
- Ensure camera is not in use by another application
- Try mouse mode (press 'M')

### Low FPS / Lag

- Reduce particle counts in `config.js`
- Close other browser tabs
- Use lower device pixel ratio
- Try a different browser

### Hand tracking inaccurate

- Ensure good lighting
- Position hands fully in frame
- Use hand gesture more deliberately
- Adjust `minDetectionConfidence` in `hand-tracker.js`

## Future Enhancements

- [ ] Mobile-optimized UI
- [ ] Multiple attack patterns
- [ ] Sound effects synchronized with animations
- [ ] Multiplayer hand tracking
- [ ] VR support
- [ ] Recording/replay system
- [ ] Custom color palettes
- [ ] Advanced gesture recognition

## Credits

- Inspired by Jujutsu Kaisen's "Hollow Purple" technique
- Hand tracking powered by [MediaPipe](https://mediapipe.dev/)
- 3D rendering with [Three.js](https://threejs.org/)
- Original HTML by Abhim

## License

This project is provided as-is for educational and entertainment purposes.

## Notes

For the best experience:

- Use a well-lit environment
- Maintain hands within camera view
- Use modern hardware for smooth 60 FPS
- Connect external speakers for potential future sound features

---

**Enjoy the experience! 虚式・茈**
