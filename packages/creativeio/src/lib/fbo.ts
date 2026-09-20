import * as THREE from 'three'

export interface DoubleFBO {
  read: THREE.WebGLRenderTarget
  write: THREE.WebGLRenderTarget
  swap(): void
}

export function createDoubleFBO(
  width: number,
  height: number,
  type: THREE.TextureDataType = THREE.HalfFloatType,
): DoubleFBO {
  const params = {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    type,
    depthBuffer: false,
    stencilBuffer: false,
  }
  return {
    read: new THREE.WebGLRenderTarget(width, height, params),
    write: new THREE.WebGLRenderTarget(width, height, params),
    swap() {
      const temp = this.read
      this.read = this.write
      this.write = temp
    },
  }
}
