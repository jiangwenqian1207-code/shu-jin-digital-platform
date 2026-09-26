# 游粒成纹

Entry: `particles.html`, third artwork cover. Uses only the three specifically supplied images; the AI wisteria is labelled as AI, not a historical textile.

Reference inspected with installed TD toeexpand (copy only), and video frames sampled every 3 seconds in `touchdesigner-source/particle-review/overview.jpg`. TD geo1 uses RGB-position/color instancing; noise1 period .72, spread 1.8, gain .75, time-driven Z .1/s. Web reinterpretation uses 57,600 GPU points with correlated 3D flow, not image fades. Single formation uniform contracts the flow toward texture-sampled target positions. Original TD gesture mappings are not used.

Single pinch controls formation and relative mirrored palm displacement controls Y rotation (bounded ±1.15 radians, damped). Shared tested dual-hand latch takes priority; 240ms dwell, 1800ms cooldown, two visible released hands required to rearm. Missing tracking holds 650ms before dispersing. Transitions retract for 1 second then change particle colors in the free-flowing state over .9 seconds. New pattern stays dispersed until single-hand input resumes.

MediaPipe inference reuses local worker/assets without modifying the weaving installation. Hidden video stays on device; no camera image is uploaded. Denial/errors retain mouse/space controls. Background/exit stops camera and disposes render resources.

Tests: `node --test tests/particles.test.mjs`. Real camera gesture quality remains dependent on lighting, motion blur and two-hand framing; validate with a person, not only synthetic landmarks.
