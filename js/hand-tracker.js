/**
 * Hand Tracking Module - Uses MediaPipe to detect hand landmarks and gestures
 */
const HandTracker = (() => {
  let hands = null;
  let camUtil = null;
  let leftHand = null;       // {landmarks, handedness}
  let rightHand = null;
  let onResultsCb = null;
  const handCtx = document.getElementById('hand-overlay').getContext('2d');

  /**
   * Initialize MediaPipe hand detection
   */
  async function init() {
    const video = document.getElementById('webcam');

    // Create Hands detector
    hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.6,
    });

    hands.onResults(handleResults);

    // Setup camera utility
    camUtil = new Camera(video, {
      onFrame: async () => {
        await hands.send({ image: video });
      },
      width: 640,
      height: 480,
    });

    await camUtil.start();
  }

  /**
   * Handle MediaPipe results
   */
  function handleResults(results) {
    // Clear overlay
    handCtx.clearRect(0, 0, 320, 240);

    leftHand = null;
    rightHand = null;

    if (results.multiHandLandmarks && results.multiHandedness) {
      for (let i = 0; i < results.multiHandLandmarks.length; i++) {
        const landmarks = results.multiHandLandmarks[i];
        const handedness = results.multiHandedness[i].label; // "Left" or "Right"

        // Mirror landmarks to match user perspective
        const mirroredLandmarks = landmarks.map(l => ({
          x: 1 - l.x,
          y: l.y,
          z: l.z
        }));

        // Assign to left or right hand
        // MediaPipe labels from camera perspective, we mirror the x coordinate
        if (handedness === 'Left') {
          rightHand = { landmarks: mirroredLandmarks, raw: landmarks };
        } else {
          leftHand = { landmarks: mirroredLandmarks, raw: landmarks };
        }

        // Draw hand visualization on overlay
        drawHand(landmarks, handedness === 'Left' ? '#ff4466' : '#4488ff');
      }
    }

    // Update HUD indicators
    document.getElementById('left-hand-status').style.opacity = leftHand ? 1 : 0.3;
    document.getElementById('right-hand-status').style.opacity = rightHand ? 1 : 0.3;

    if (onResultsCb) {
      onResultsCb(leftHand, rightHand);
    }
  }

  /**
   * Draw hand landmarks on canvas overlay
   */
  function drawHand(landmarks, color) {
    // Draw landmark points
    handCtx.fillStyle = color;
    for (const lm of landmarks) {
      handCtx.beginPath();
      handCtx.arc(lm.x * 320, lm.y * 240, 2, 0, Math.PI * 2);
      handCtx.fill();
    }

    // Draw connections between landmarks
    handCtx.strokeStyle = color;
    handCtx.lineWidth = 1;
    handCtx.globalAlpha = 0.5;

    // Landmark connections (21 points)
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4],
      [0, 5], [5, 6], [6, 7], [7, 8],
      [5, 9], [9, 10], [10, 11], [11, 12],
      [9, 13], [13, 14], [14, 15], [15, 16],
      [13, 17], [17, 18], [18, 19], [19, 20],
      [0, 17]
    ];

    for (const [a, b] of connections) {
      handCtx.beginPath();
      handCtx.moveTo(landmarks[a].x * 320, landmarks[a].y * 240);
      handCtx.lineTo(landmarks[b].x * 320, landmarks[b].y * 240);
      handCtx.stroke();
    }

    handCtx.globalAlpha = 1;
  }

  /**
   * Get palm center position (average of wrist and finger bases)
   * Returns {x, y, z} in normalized 0-1 range
   */
  function getPalmCenter(hand) {
    if (!hand) return null;

    const lm = hand.landmarks;
    // Landmarks: 0=wrist, 5=index_mcp, 9=middle_mcp, 13=ring_mcp, 17=pinky_mcp
    const indices = [0, 5, 9, 13, 17];
    let x = 0, y = 0, z = 0;

    for (const idx of indices) {
      x += lm[idx].x;
      y += lm[idx].y;
      z += lm[idx].z;
    }

    return {
      x: x / 5,
      y: y / 5,
      z: z / 5
    };
  }

  /**
   * Detect if hand is pushing forward (toward camera)
   * Returns true if fingertips are significantly closer to camera than wrist
   */
  function isPushing(hand) {
    if (!hand) return false;

    const lm = hand.landmarks;
    // Landmark 0 = wrist, 8 = middle finger tip, 12 = ring finger tip
    const wristZ = lm[0].z;
    const tipZ = (lm[8].z + lm[12].z) / 2;

    return tipZ < wristZ - 0.05;
  }

  /**
   * Get hand openness score (how spread out fingers are)
   * Returns distance from wrist to middle fingertip
   */
  function getOpenness(hand) {
    if (!hand) return 0;

    const lm = hand.landmarks;
    const dx = lm[12].x - lm[0].x;
    const dy = lm[12].y - lm[0].y;

    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Register callback for hand tracking results
   */
  function onResults(cb) {
    onResultsCb = cb;
  }

  // Public API
  return {
    init,
    getPalmCenter,
    isPushing,
    getOpenness,
    getLeft: () => leftHand,
    getRight: () => rightHand,
    onResults,
  };
})();
