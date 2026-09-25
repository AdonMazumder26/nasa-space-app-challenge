import { useMemo } from "react";
import * as THREE from "three";
import { brightStars } from "../../data/brightStars";

const SKY_RADIUS = 86;

function equatorial(raDeg: number, decDeg: number): THREE.Vector3 {
  const ra = THREE.MathUtils.degToRad(raDeg);
  const dec = THREE.MathUtils.degToRad(decDeg);
  return new THREE.Vector3(Math.cos(dec) * Math.cos(ra), Math.sin(dec), -Math.cos(dec) * Math.sin(ra));
}

function starColor(colorIndex: number | null): THREE.Color {
  if (colorIndex === null) return new THREE.Color("#f3efe6");
  const t = THREE.MathUtils.clamp((colorIndex + 0.35) / 2, 0, 1);
  return new THREE.Color(
    THREE.MathUtils.lerp(0.62, 1, Math.min(1, t * 1.35)),
    THREE.MathUtils.lerp(0.8, 0.7, t),
    THREE.MathUtils.lerp(1, 0.4, t),
  );
}

function softStarTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext("2d");
  if (!context) return new THREE.CanvasTexture(canvas);
  const glow = context.createRadialGradient(32, 32, 0, 32, 32, 32);
  glow.addColorStop(0, "rgba(255,255,255,1)");
  glow.addColorStop(0.25, "rgba(255,255,255,0.9)");
  glow.addColorStop(0.55, "rgba(255,255,255,0.25)");
  glow.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, 64, 64);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function MilkyWay() {
  const material = useMemo(() => {
    const north = equatorial(192.85948, 27.12825).normalize();
    const center = equatorial(266.405, -28.936175).normalize();
    return new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      toneMapped: false,
      uniforms: {
        galNorth: { value: north },
        galCenter: { value: center },
      },
      vertexShader: `
        varying vec3 vDir;
        void main() {
          vDir = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vDir;
        uniform vec3 galNorth;
        uniform vec3 galCenter;
        void main() {
          vec3 dir = normalize(vDir);
          float latitude = asin(clamp(dot(dir, galNorth), -1.0, 1.0));
          float band = exp(-pow(latitude / 0.22, 2.0));
          float core = pow(max(dot(dir, galCenter), 0.0), 1.6);
          vec3 dust = vec3(0.55, 0.46, 0.68);
          vec3 heart = vec3(1.0, 0.82, 0.62);
          vec3 night = vec3(0.015, 0.017, 0.028);
          vec3 color = night + mix(dust, heart, core) * band * (0.42 + core * 0.7);
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
  }, []);

  return (
    <mesh material={material}>
      <sphereGeometry args={[SKY_RADIUS, 64, 48]} />
    </mesh>
  );
}

function CatalogStars() {
  const texture = useMemo(() => softStarTexture(), []);
  const geometry = useMemo(() => {
    const positions = new Float32Array(brightStars.length * 3);
    const colors = new Float32Array(brightStars.length * 3);
    const sizes = new Float32Array(brightStars.length);
    brightStars.forEach(([ra, dec, magnitude, colorIndex], index) => {
      const direction = equatorial(ra, dec).multiplyScalar(SKY_RADIUS - 2);
      positions[index * 3] = direction.x;
      positions[index * 3 + 1] = direction.y;
      positions[index * 3 + 2] = direction.z;
      const color = starColor(colorIndex);
      colors[index * 3] = color.r;
      colors[index * 3 + 1] = color.g;
      colors[index * 3 + 2] = color.b;
      const brightness = Math.pow(2.512, 1.2 - magnitude);
      sizes[index] = THREE.MathUtils.clamp(2.8 * Math.sqrt(brightness), 1.8, 11);
    });
    const buffer = new THREE.BufferGeometry();
    buffer.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    buffer.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    buffer.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    return buffer;
  }, []);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { starMap: { value: texture } },
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: `
          attribute float size;
          varying vec3 vColor;
          void main() {
            vColor = color;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (260.0 / -mv.z);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: `
          uniform sampler2D starMap;
          varying vec3 vColor;
          void main() {
            vec4 sprite = texture2D(starMap, gl_PointCoord);
            if (sprite.a < 0.04) discard;
            gl_FragColor = vec4(vColor, 1.0) * sprite;
          }
        `,
      }),
    [texture],
  );

  return <points geometry={geometry} material={material} />;
}

function SunDisc() {
  const position = useMemo(() => new THREE.Vector3(4.5, 2.2, 1.4).normalize().multiplyScalar(62), []);
  const glow = useMemo(() => softStarTexture(), []);
  return (
    <group position={position}>
      <sprite scale={[2.8, 2.8, 1]}>
        <spriteMaterial map={glow} transparent depthWrite={false} blending={THREE.AdditiveBlending} color="#ffd7a8" toneMapped={false} />
      </sprite>
      <mesh>
        <sphereGeometry args={[0.42, 20, 20]} />
        <meshBasicMaterial color="#fff6e4" toneMapped={false} />
      </mesh>
    </group>
  );
}

export function StarField() {
  return (
    <>
      <MilkyWay />
      <CatalogStars />
      <SunDisc />
    </>
  );
}
