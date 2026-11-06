// Post-processing controller / fallback renderer for NetizenCity 3D
import * as THREE from 'three';

export function makePost(renderer, scene, camera, width, height, opts = {}) {
  const dof = {
    focus: 30,
    aper: 0,
    maxCoc: 20,
    ao: {
      overrideVisibility: () => {},
    },
  };

  const vig = {
    uniforms: {
      amt: { value: 0.3 },
      sat: { value: 1.42 },
      contrast: { value: 0.3 },
      warm: { value: 0.25 },
    },
  };

  const bloom = {
    strength: 0.12,
    threshold: 1.0,
  };

  const composer = {
    render: () => {
      renderer.render(scene, camera);
    },
    setSize: (w, h) => {
      renderer.setSize(w, h, false);
    },
  };

  return {
    composer,
    dof,
    vig,
    bloom,
  };
}
