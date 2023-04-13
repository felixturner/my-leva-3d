import { useRef } from 'react'
import { extend, useFrame } from 'react-three-fiber'
import { shaderMaterial } from '@react-three/drei'
import glsl from 'babel-plugin-glsl/macro'
import { useControls } from 'leva'

const TShaderMaterial = shaderMaterial(
  { uTime: 0, uTexture: null, uRepeat: [12, 3], speed: 0.4 },
  glsl`
  varying vec2 vUv;
  varying vec3 vPosition;

  uniform float uTime;

  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
  }
`,
  glsl`
  varying vec2 vUv;
  varying vec3 vPosition;
  
  uniform float uTime;
  uniform sampler2D uTexture;
  uniform vec2 uRepeat;
  uniform float speed;

  void main() {
    float time = uTime * speed;
    vec2 repeat = uRepeat;
    vec2 uv = fract(vUv * repeat - vec2(time, 0.));

    vec3 texture = texture2D(uTexture, uv).rgb;

    float fog = clamp(vPosition.z / 6., 0., 1.);
    vec3 fragColor = mix(vec3(0.), texture, fog);

    gl_FragColor = vec4(fragColor, 1.);
  }
`
)

extend({ TShaderMaterial })

export default function TypeFadeMaterial(props) {
  const ref = useRef()
  const { animate, speed } = useControls('animation', {
    animate: true,
    speed: { value: 0.3, min: 0, max: 2, render: (get) => get('animation.animate') }
  })

  useFrame(({ clock }) => {
    if (animate) ref.current.uTime = clock.elapsedTime
  })

  return <tShaderMaterial ref={ref} {...props} speed={speed} />
}
