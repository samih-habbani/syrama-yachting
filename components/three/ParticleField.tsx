'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 400

    // Stars
    const count = 3000
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 1200
      positions[i * 3 + 1] = (Math.random() - 0.5) * 1200
      positions[i * 3 + 2] = (Math.random() - 0.5) * 800
      sizes[i] = Math.random() * 2.5 + 0.5
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0xd4b472) },
      },
      vertexShader: `
        attribute float size;
        uniform float uTime;
        void main() {
          vec3 pos = position;
          pos.y += sin(uTime * 0.3 + position.x * 0.01) * 1.5;
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        void main() {
          float d = distance(gl_PointCoord, vec2(0.5));
          if (d > 0.5) discard;
          float alpha = 1.0 - smoothstep(0.2, 0.5, d);
          gl_FragColor = vec4(uColor, alpha * 0.7);
        }
      `,
      transparent: true,
      depthWrite: false,
    })

    const points = new THREE.Points(geo, mat)
    scene.add(points)

    // Gold dust – smaller, more stars
    const dustCount = 800
    const dustPos = new Float32Array(dustCount * 3)
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3]     = (Math.random() - 0.5) * 600
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * 600
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 200
    }
    const dustGeo = new THREE.BufferGeometry()
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3))
    const dustMat = new THREE.PointsMaterial({
      size: 1.2,
      color: new THREE.Color(0xb8974a),
      transparent: true,
      opacity: 0.4,
    })
    scene.add(new THREE.Points(dustGeo, dustMat))

    let mouseX = 0, mouseY = 0
    const onMouse = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouse)

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    let clock = new THREE.Clock()
    let animId: number
    const render = () => {
      animId = requestAnimationFrame(render)
      const t = clock.getElapsedTime()
      mat.uniforms.uTime.value = t
      points.rotation.y = t * 0.015 + mouseX * 0.05
      points.rotation.x = mouseY * 0.03
      renderer.render(scene, camera)
    }
    render()

    return () => {
      cancelAnimationFrame(animId)
      renderer.dispose()
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  )
}
