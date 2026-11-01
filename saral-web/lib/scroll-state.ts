/**
 * Mutable scroll/pointer state read by the 3D scene every frame.
 * Kept OUTSIDE React state on purpose: updating it never triggers a re-render.
 */
export const scrollState = {
  /** Continuous scene position: integer part = section index, fraction = progress through it. */
  scene: 0,
  /** 0..1 progress of the whole page. */
  progress: 0,
  /** 0..4 float: which "How it works" step is centred in the viewport (drives the 3D step object). */
  stage: 0,
  pointerX: 0,
  pointerY: 0,
  /** performance.now() of the last theme change, used to keep rendering during the colour blend. */
  themeChangedAt: 0,
  sceneCount: 11,
};
