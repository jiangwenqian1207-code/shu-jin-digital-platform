let detector;
self.onmessage = async ({ data }) => {
  try {
    if (data.type === 'init') {
      // Classic worker is intentional: MediaPipe's WASM loader uses importScripts.
      const { FilesetResolver, HandLandmarker } = await import('./public/weaving/vendor/vision_bundle.mjs');
      const files = await FilesetResolver.forVisionTasks(new URL('./public/weaving/vendor/wasm', self.location.href).href);
      detector = await HandLandmarker.createFromOptions(files, {
        baseOptions: { modelAssetPath: new URL('./public/weaving/vendor/hand_landmarker.task', self.location.href).href, delegate: 'CPU' },
        runningMode: 'VIDEO', numHands: 1,
        minHandDetectionConfidence: .65, minHandPresenceConfidence: .65, minTrackingConfidence: .65
      });
      self.postMessage({ type: 'ready' });
    } else if (data.type === 'frame') {
      try {
        const result = detector.detectForVideo(data.frame, data.time);
        self.postMessage({ type: 'landmarks', points: result.landmarks[0] || null, time: data.time });
      } finally { data.frame.close(); }
    }
  } catch (error) { self.postMessage({ type: 'error', message: String(error) }); }
};
