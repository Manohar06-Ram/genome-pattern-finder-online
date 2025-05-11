
import * as THREE from 'three';

declare global {
  interface HTMLDivElement {
    __scene?: THREE.Scene;
  }
  
  interface HTMLElement {
    __scene?: THREE.Scene;
  }
}

export {};
