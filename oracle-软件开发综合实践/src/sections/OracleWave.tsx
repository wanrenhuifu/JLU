import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function OracleWave() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xf8fafc, 50, 400);

    const w = container.offsetWidth || window.innerWidth;
    const h = container.offsetHeight || 600;

    const camera = new THREE.PerspectiveCamera(45, w / h, 1, 1000);
    camera.position.set(0, 50, 120);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio));
    renderer.setSize(w, h);
    renderer.setClearColor(0xf8fafc, 0);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const mouse = { x: 0, y: 0, px: 0, py: 0, active: false };

    const vertexShader = `
      varying vec2 vUv;
      varying float vElevation;
      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uMouseStrength;

      void main() {
        vUv = uv;
        vec3 pos = position;
        float dist = distance(uv, uMouse);
        float wave = sin(pos.x * 0.1 + uTime) * 2.0 
                   + sin(pos.z * 0.08 + uTime * 0.8) * 2.0
                   + sin((pos.x + pos.z) * 0.05 + uTime * 0.5) * 1.5;
        float mouseWave = exp(-dist * dist * 30.0) * uMouseStrength * 12.0;
        pos.y += wave + mouseWave;
        vElevation = wave + mouseWave;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `;

    const fragmentShader = `
      varying vec2 vUv;
      varying float vElevation;
      void main() {
        float t = clamp((vElevation + 5.0) / 15.0, 0.0, 1.0);
        vec3 colorLow = vec3(0.13, 0.82, 0.93);
        vec3 colorHigh = vec3(0.75, 0.52, 0.99);
        vec3 color = mix(colorLow, colorHigh, t);
        float alpha = 0.5 + t * 0.4;
        gl_FragColor = vec4(color, alpha);
      }
    `;

    const geometry = new THREE.PlaneGeometry(200, 200, 80, 80);
    geometry.rotateX(-Math.PI / 2.5);

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uMouseStrength: { value: 0 },
      },
      transparent: true,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const gridHelper = new THREE.GridHelper(200, 40, 0xcbd5e1, 0xe2e8f0);
    gridHelper.position.y = -20;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.3;
    scene.add(gridHelper);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = (e.clientX - rect.left) / rect.width;
      mouse.y = (e.clientY - rect.top) / rect.height;
      mouse.active = true;
      material.uniforms.uMouse.value.set(mouse.x, 1 - mouse.y);
    };
    const handleMouseLeave = () => {
      mouse.active = false;
    };
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      material.uniforms.uTime.value = elapsed;

      if (mouse.active) {
        material.uniforms.uMouseStrength.value = THREE.MathUtils.lerp(
          material.uniforms.uMouseStrength.value,
          1,
          0.05
        );
      } else {
        material.uniforms.uMouseStrength.value = THREE.MathUtils.lerp(
          material.uniforms.uMouseStrength.value,
          0,
          0.03
        );
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const nw = container.offsetWidth || window.innerWidth;
      const nh = container.offsetHeight || 600;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 1,
      }}
    />
  );
}
