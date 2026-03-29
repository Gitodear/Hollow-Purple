# Setup Guide

## Quick Start

### Option 1: Direct Browser Access (Easiest)

1. Locate the project folder: `hollow purple/`
2. Double-click `index.html` - it will open in your default browser
3. Click **"ACTIVATE CAMERA"** button
4. Allow camera permissions when prompted

### Option 2: Local Web Server (Recommended)

Using a local server can prevent CORS issues and provide better performance.

#### Python 3

```bash
cd "hollow purple"
python -m http.server 8000
```

Then open: `http://localhost:8000`

#### Python 2

```bash
cd "hollow purple"
python -m SimpleHTTPServer 8000
```

Then open: `http://localhost:8000`

#### Node.js (http-server)

```bash
npm install -g http-server
cd "hollow purple"
http-server
```

Then open: `http://localhost:8080`

#### VS Code Live Server

1. Install "Live Server" extension in VS Code
2. Right-click `index.html`
3. Select "Open with Live Server"

## System Requirements

### Hardware

- **CPU**: Modern processor (Intel i5+, AMD Ryzen 5+, or equivalent)
- **GPU**: Dedicated graphics card recommended (NVIDIA, AMD, or integrated Intel/Apple)
- **RAM**: 4GB minimum, 8GB+ recommended
- **Webcam**: Standard USB webcam or built-in laptop webcam
- **Display**: 1080p or higher recommended

### Software

- **Browser**:
  - Chrome/Edge 90+ (recommended)
  - Firefox 88+
  - Safari 14+ (limited support)
- **Internet**: Required for loading CDN libraries
  - MediaPipe Hands model
  - Three.js library

### Permissions Required

- **Camera Access** - for hand tracking
- **Microphone** - not required (can deny safely)

## File Structure Explanation

```
hollow purple/
├── index.html                 # Main entry point - HTML structure
├── styles.css                 # All CSS styling for UI elements
├── README.md                  # Full documentation
├── SETUP.md                   # This file
├── package.json               # Project metadata
└── js/
    ├── config.js              # Configuration constants
    ├── shaders.js             # GLSL shader code
    ├── particle-system.js     # Particle physics
    ├── energy-orb.js          # Blue/Red orb classes
    ├── effects.js             # Visual effects system
    ├── hand-tracker.js        # MediaPipe integration
    ├── fusion-system.js       # Fusion mechanics & states
    └── main.js                # Application entry & loop
```

## How to Use

### Basic Controls

| Input                       | Action                   |
| --------------------------- | ------------------------ |
| Click "ACTIVATE CAMERA"     | Start hand tracking      |
| Show both hands to camera   | Visible in bottom-right  |
| Bring hands together        | Proximity bar fills      |
| Hold hands close (~0.5 sec) | Triggers fusion sequence |
| Push both hands forward     | Fire purple blast        |

### Mouse Mode (No Camera Required)

1. Press **M** key to toggle mouse mode
2. Move mouse to position hands
3. Click & hold to bring hands together
4. Click to fire when fused

### Tips for Best Results

- **Lighting**: Good ambient lighting helps hand detection
- **Distance**: Keep hands 0.5-1.5 meters from camera
- **Angle**: Face the camera directly
- **Background**: Plain background works better than busy patterns
- **Speed**: Move hands deliberately and smoothly

## Customization

### Adjust Particle Counts

Edit `js/config.js`:

```javascript
CONFIG.BLUE_PARTICLES: 3000      // Lower = better performance
CONFIG.RED_PARTICLES: 3000
CONFIG.PURPLE_PARTICLES: 5000
```

### Change Fusion Trigger Distance

```javascript
CONFIG.FUSION_TRIGGER_DIST: 0.13  // Larger = easier to trigger
CONFIG.FUSION_HOLD_TIME: 0.8      // Shorter = quicker fusion
```

### Modify Colors

```javascript
CONFIG.COLORS.BLUE: new THREE.Color(0.15, 0.35, 1.0)
// RGB format (0.0 - 1.0 for each channel)
```

## Troubleshooting

### Camera Won't Start

- **Browser permissions**: Check if browser has camera permission
  - Chrome: Settings → Privacy → Camera
  - Firefox: Preferences → Privacy → Permissions → Camera
  - Safari: Develop → User Media Devices
- **Camera in use**: Close other apps using the camera (Zoom, Discord, etc.)
- **Try mouse mode**: Press 'M' to use mouse instead

### Low Framerate / Stuttering

1. Reduce particle counts in `js/config.js`
2. Lower device pixel ratio:
   - Edit `js/main.js`, find: `Math.min(devicePixelRatio, 2)`
   - Change `2` to `1`
3. Close other browser tabs
4. Update graphics drivers

### Hand Tracking Inaccurate

- Ensure good lighting conditions
- Keep hands fully in camera frame
- Make deliberate hand movements
- Adjust `minDetectionConfidence` in `js/hand-tracker.js`

### Browser Crashes / Crashes

- Reduce particle counts (see "Low Framerate" above)
- Try a different browser
- Clear browser cache
- Disable browser extensions

### CORS / Security Errors

- Use a local web server instead of direct file access
- See "Option 2: Local Web Server" above

## Performance Optimization

### For Low-End Devices

```javascript
// In js/config.js
CONFIG.BLUE_PARTICLES: 1000;
CONFIG.RED_PARTICLES: 1000;
CONFIG.PURPLE_PARTICLES: 2000;

// In js/main.js, find the renderer setup:
renderer.setPixelRatio(1);  // Instead of Math.min(devicePixelRatio, 2)
```

### For High-End Devices

```javascript
// In js/config.js
CONFIG.BLUE_PARTICLES: 5000;
CONFIG.RED_PARTICLES: 5000;
CONFIG.PURPLE_PARTICLES: 8000;

// Increase resolution if desired
```

## Browser DevTools Debugging

### Chrome/Edge

1. Press `F12` to open DevTools
2. Go to **Console** tab to see errors
3. **Performance** tab to check framerate
4. **Network** tab to verify libraries loaded

### Firefox

1. Press `F12` to open Developer Tools
2. Go to **Console** tab
3. **Performance** tab for profiling

## Need Help?

- Check the **README.md** for detailed documentation
- Review error messages in browser console (DevTools)
- Try mouse mode if hand tracking has issues
- Verify all libraries loaded correctly in Network tab

---

**Enjoy the experience! 虚式・茈**
