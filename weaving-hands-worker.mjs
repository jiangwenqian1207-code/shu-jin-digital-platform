let detector;
self.onmessage = async ({ data }) => {
  try {
    if (data.type === 'init') {
      // Classic worker is intentional: MediaPipe's WASM loader uses importScripts.
      const { FilesetResolver, HandLandmarker } = await import('./public/weaving/vendor/vision_bundle.mjs');
      const files = await FilesetResolver.forVisionTasks(new URL('./public/weaving/vendor/wasm', self.location.href).href);
      const options = {
        baseOptions: { modelAssetPath: new URL('./public/weaving/vendor/hand_landmarker.task', self.location.href).href, delegate: 'GPU' },
        runningMode: 'VIDEO', numHands: 2,
        minHandDetectionConfidence: .45, minHandPresenceConfidence: .5, minTrackingConfidence: .45
      };
      let delegate='GPU';
      try { detector = await HandLandmarker.createFromOptions(files, options); }
      catch { delegate='CPU';options.baseOptions.delegate=delegate;detector = await HandLandmarker.createFromOptions(files, options); }
      self.postMessage({ type: 'ready', delegate });
    } else if (data.type === 'frame') {
      try {
        const result = detector.detectForVideo(data.frame, data.time);
        self.postMessage({ type: 'landmarks', hands: result.landmarks, labels: result.handedness.map(h=>h[0]?.categoryName), time: data.time });
      } finally { data.frame.close(); }
    }
  } catch (error) { self.postMessage({ type: 'error', message: String(error) }); }
};
