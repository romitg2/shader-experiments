import { useEffect, useState } from 'react'
import * as THREE from 'three'

/**
 * Loads a texture manually (not via drei's cached useLoader/Suspense) so it
 * can be disposed deterministically whenever the URL changes or the
 * component unmounts, instead of living in a shared global cache.
 *
 * Returns React state (not a ref): sampler2D uniforms whose `.value` starts
 * `null` and is later mutated in place to point at a resolved texture never
 * get properly picked up by Three.js's WebGLProgram for some
 * texture/renderer version combinations — unlike float/vector uniforms,
 * which mutate-in-place fine (that's why Fluid/Gradient's per-frame uniform
 * updates work). The reliable fix is to never mutate a sampler2D uniform's
 * `.value` after the material exists — bake the resolved texture into a
 * *new* uniforms object (keyed on the texture in a `useMemo`) and only
 * mount the mesh once it's ready, mirroring drei's Suspense-based
 * `useTexture` (which stages the component tree until the texture is
 * loaded, so its uniforms object is only ever constructed with a real
 * texture already in hand).
 */
export function useDisposableTexture(url: string): THREE.Texture | null {
  const [texture, setTexture] = useState<THREE.Texture | null>(null)

  useEffect(() => {
    let cancelled = false
    let loaded: THREE.Texture | undefined
    const loader = new THREE.TextureLoader()

    loader.load(url, (tex) => {
      if (cancelled) {
        tex.dispose()
        return
      }
      tex.colorSpace = THREE.SRGBColorSpace
      loaded = tex
      setTexture(tex)
    })

    return () => {
      cancelled = true
      loaded?.dispose()
      setTexture(null)
    }
  }, [url])

  return texture
}
