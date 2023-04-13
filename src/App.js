import { Suspense, useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, createPortal, useThree } from 'react-three-fiber'
import TypeShaderMaterial from './TypeShaderMaterial'
import { useFBO, PerspectiveCamera, Loader, TorusKnot, Text } from '@react-three/drei'
import { useControls, folder } from 'leva'
import { spring } from '@leva-ui/plugin-spring'
import { useDrag } from 'react-use-gesture'
import { useSpring } from '@react-spring/core'

import './styles.css'

const fonts = {
  Orbitron: 'https://fonts.gstatic.com/s/orbitron/v17/yMJMMIlzdpvBhQQL_SC3X9yhF25-T1nysimBoWg1fDAlp7lk.woff',
  Lobster: 'https://fonts.gstatic.com/s/lobstertwo/v13/BngTUXZGTXPUvIoyV6yN5-fI3hyEwRuoefDo.woff',
  Monoton: 'https://fonts.gstatic.com/s/monoton/v10/5h1aiZUrOngCibe4fkXBRWS6.woff'
}

function Type() {
  const { string, font, scale, size, repeat, textColor, sceneColor, dragConfig } = useControls({
    text: folder({
      string: 'POIMANDRES',
      size: { value: 108, min: 50, max: 300, step: 1 },
      textColor: { value: '#fff', label: 'color' },
      font: { options: fonts }
    }),
    shape: folder({
      scale: { value: [0.2, 0.2, 0.2], min: 0.1, max: 1, lock: true },
      sceneColor: '#000',
      repeat: { value: [12, 3], label: 'text. repeat', joystick: false },
      dragConfig: { ...spring(), label: 'interaction' }
    })
  })

  const fbo = useFBO(500, 500, { multisample: true })
  const threeSceneColor = useMemo(() => new THREE.Color('#000'), [])
  const scene = useMemo(() => {
    const _scene = new THREE.Scene()
    _scene.background = threeSceneColor
    return _scene
  }, [threeSceneColor])

  const { aspect, viewport } = useThree()
  const { factor } = viewport()

  useEffect(() => {
    threeSceneColor.set(sceneColor)
  }, [sceneColor, threeSceneColor])

  useFrame((state) => {
    state.gl.setRenderTarget(fbo)
    state.gl.render(scene, camRef.current)
    state.gl.setRenderTarget(null)
    state.gl.render(state.scene, state.camera)
  })

  const camRef = useRef()
  const objRef = useRef()

  const rEuler = useMemo(() => new THREE.Euler(), [])

  const [, set] = useSpring(() => ({
    x: 0,
    y: 0,
    onChange: (v, { key }) => {
      rEuler[key] = v / factor
      objRef.current.quaternion.setFromEuler(rEuler)
    }
  }))

  const bind = useDrag(({ offset: [x, y] }) => {
    set({ x: y, y: x, config: dragConfig })
  })
  return (
    <>
      <PerspectiveCamera ref={camRef} position-z={2.4} far={1000} near={0.1} fov={45} />
      <TorusKnot ref={objRef} {...bind()} args={[9, 3, 768, 3, 4, 3]} scale={scale}>
        <TypeShaderMaterial attach="material" uTexture={fbo.texture} uRepeat={repeat} />
      </TorusKnot>
      {createPortal(
        <Text font={font} fontSize={(size / 100) * aspect} color={textColor} scale={[0.3, 0.5 + 1 / aspect, 1]}>
          {string}
        </Text>,
        scene
      )}
    </>
  )
}

export default function App() {
  const { bg } = useControls({ bg: { value: '#000', label: 'background' } })
  return (
    <div className="wrapper" style={{ backgroundColor: bg }}>
      <Canvas pixelRatio={[1, 2]}>
        <Suspense fallback={null}>
          <Type />
        </Suspense>
        {/* <OrbitControls /> */}
      </Canvas>
      <Loader />
    </div>
  )
}
