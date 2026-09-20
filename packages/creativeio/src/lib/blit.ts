import * as THREE from 'three'

export function blit(
  gl: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  quadMesh: THREE.Mesh,
  material: THREE.Material,
  target: THREE.WebGLRenderTarget | null,
) {
  quadMesh.material = material
  gl.setRenderTarget(target)
  gl.render(scene, camera)
}
