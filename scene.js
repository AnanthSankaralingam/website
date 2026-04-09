import * as THREE from 'three';

// ============================================
// FULL-PAGE 3D PARTICLE SYSTEM
// Extends behind all content, morphs on scroll
// ============================================

const canvas = document.getElementById('hero-canvas');
if (!canvas) throw new Error('No canvas');

const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

function setRendererSize() {
  const w = window.innerWidth;
  const h = document.documentElement.scrollHeight;
  renderer.setSize(w, h);
  camera.aspect = w / window.innerHeight;
  camera.updateProjectionMatrix();
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 4.5;

// ============================================
// PARTICLES — sphere that morphs into helix, wave, etc.
// ============================================
const PARTICLE_COUNT = 2000;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(PARTICLE_COUNT * 3);
const colors = new Float32Array(PARTICLE_COUNT * 3);
const sizes = new Float32Array(PARTICLE_COUNT);
const speeds = new Float32Array(PARTICLE_COUNT);
const offsets = new Float32Array(PARTICLE_COUNT);

// Store multiple shape targets
const spherePositions = new Float32Array(PARTICLE_COUNT * 3);
const helixPositions = new Float32Array(PARTICLE_COUNT * 3);
const wavePositions = new Float32Array(PARTICLE_COUNT * 3);
const expandedPositions = new Float32Array(PARTICLE_COUNT * 3);

for (let i = 0; i < PARTICLE_COUNT; i++) {
  // Sphere
  const phi = Math.acos(2 * Math.random() - 1);
  const theta = Math.random() * Math.PI * 2;
  const radius = 1.6 + (Math.random() - 0.5) * 0.3;
  spherePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
  spherePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
  spherePositions[i * 3 + 2] = radius * Math.cos(phi);

  // Helix
  const t = (i / PARTICLE_COUNT) * Math.PI * 6;
  const helixR = 1.8 + (Math.random() - 0.5) * 0.2;
  helixPositions[i * 3] = helixR * Math.cos(t);
  helixPositions[i * 3 + 1] = ((i / PARTICLE_COUNT) - 0.5) * 5;
  helixPositions[i * 3 + 2] = helixR * Math.sin(t);

  // Wave plane
  const wx = ((i % 50) / 50 - 0.5) * 6;
  const wz = (Math.floor(i / 50) / 40 - 0.5) * 6;
  wavePositions[i * 3] = wx;
  wavePositions[i * 3 + 1] = Math.sin(wx * 1.5) * Math.cos(wz * 1.5) * 0.8;
  wavePositions[i * 3 + 2] = wz;

  // Expanded scatter
  expandedPositions[i * 3] = (Math.random() - 0.5) * 8;
  expandedPositions[i * 3 + 1] = (Math.random() - 0.5) * 8;
  expandedPositions[i * 3 + 2] = (Math.random() - 0.5) * 8;

  // Initial positions = sphere
  positions[i * 3] = spherePositions[i * 3];
  positions[i * 3 + 1] = spherePositions[i * 3 + 1];
  positions[i * 3 + 2] = spherePositions[i * 3 + 2];

  // Warm amber palette
  const r = 0.95 + Math.random() * 0.05;
  const g = 0.5 + Math.random() * 0.3;
  const b = 0.04 + Math.random() * 0.1;
  colors[i * 3] = r;
  colors[i * 3 + 1] = g;
  colors[i * 3 + 2] = b;

  sizes[i] = Math.random() * 3 + 1;
  speeds[i] = 0.3 + Math.random() * 0.7;
  offsets[i] = Math.random() * Math.PI * 2;
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

const vertexShader = `
  attribute float size;
  varying vec3 vColor;
  void main() {
    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (200.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    float alpha = 1.0 - smoothstep(0.15, 0.5, dist);
    gl_FragColor = vec4(vColor, alpha * 0.75);
  }
`;

const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  transparent: true,
  vertexColors: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});

const particles = new THREE.Points(geometry, material);
scene.add(particles);

// ============================================
// RINGS
// ============================================
const ringGeo = new THREE.TorusGeometry(2.2, 0.005, 8, 120);
const ringMat = new THREE.MeshBasicMaterial({
  color: new THREE.Color(0.96, 0.62, 0.04),
  transparent: true,
  opacity: 0.15,
});
const ring = new THREE.Mesh(ringGeo, ringMat);
ring.rotation.x = Math.PI * 0.5;
scene.add(ring);

const ring2Geo = new THREE.TorusGeometry(2.5, 0.005, 8, 120);
const ring2Mat = new THREE.MeshBasicMaterial({
  color: new THREE.Color(0.96, 0.62, 0.04),
  transparent: true,
  opacity: 0.08,
});
const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
ring2.rotation.x = Math.PI * 0.35;
ring2.rotation.z = Math.PI * 0.15;
scene.add(ring2);

// ============================================
// CONSTELLATION LINES
// ============================================
const lineGeo = new THREE.BufferGeometry();
const MAX_LINES = 500;
const linePositions = new Float32Array(MAX_LINES * 6);
const lineColors = new Float32Array(MAX_LINES * 6);
lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
lineGeo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));
lineGeo.setDrawRange(0, 0);

const lineMat = new THREE.LineBasicMaterial({
  vertexColors: true,
  transparent: true,
  opacity: 0.25,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
const lines = new THREE.LineSegments(lineGeo, lineMat);
scene.add(lines);

// ============================================
// MOUSE + SCROLL
// ============================================
let mouseX = 0, mouseY = 0;
let scrollProgress = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

window.addEventListener('scroll', () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  scrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
});

// ============================================
// LERP HELPERS
// ============================================
function lerp(a, b, t) {
  return a + (b - a) * t;
}

function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

// ============================================
// LINE UPDATE
// ============================================
function updateLines() {
  let lineIndex = 0;
  const threshold = 0.7;
  const posArray = geometry.attributes.position.array;

  for (let i = 0; i < PARTICLE_COUNT && lineIndex < MAX_LINES; i += 4) {
    for (let j = i + 4; j < PARTICLE_COUNT && lineIndex < MAX_LINES; j += 4) {
      const dx = posArray[i * 3] - posArray[j * 3];
      const dy = posArray[i * 3 + 1] - posArray[j * 3 + 1];
      const dz = posArray[i * 3 + 2] - posArray[j * 3 + 2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist < threshold) {
        const alpha = 1 - dist / threshold;
        linePositions[lineIndex * 6] = posArray[i * 3];
        linePositions[lineIndex * 6 + 1] = posArray[i * 3 + 1];
        linePositions[lineIndex * 6 + 2] = posArray[i * 3 + 2];
        linePositions[lineIndex * 6 + 3] = posArray[j * 3];
        linePositions[lineIndex * 6 + 4] = posArray[j * 3 + 1];
        linePositions[lineIndex * 6 + 5] = posArray[j * 3 + 2];

        const c = alpha * 0.5;
        lineColors[lineIndex * 6] = 0.96 * c;
        lineColors[lineIndex * 6 + 1] = 0.62 * c;
        lineColors[lineIndex * 6 + 2] = 0.04 * c;
        lineColors[lineIndex * 6 + 3] = 0.96 * c;
        lineColors[lineIndex * 6 + 4] = 0.62 * c;
        lineColors[lineIndex * 6 + 5] = 0.04 * c;
        lineIndex++;
      }
    }
  }
  lineGeo.setDrawRange(0, lineIndex * 2);
  lineGeo.attributes.position.needsUpdate = true;
  lineGeo.attributes.color.needsUpdate = true;
}

// ============================================
// ANIMATION LOOP
// ============================================
const clock = new THREE.Clock();
const posArray = geometry.attributes.position.array;

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  // Scroll-based morphing between shapes
  // 0-0.15: sphere, 0.15-0.35: sphere→helix, 0.35-0.55: helix→wave, 0.55-0.75: wave→expanded, 0.75-1: expanded drift
  const sp = scrollProgress;

  const sphereToHelix = smoothstep(0.1, 0.3, sp);
  const helixToWave = smoothstep(0.35, 0.55, sp);
  const waveToExpanded = smoothstep(0.6, 0.8, sp);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;
    const offset = offsets[i];
    const breathe = 1 + Math.sin(t * 0.4 + offset) * 0.06;

    let tx, ty, tz;

    if (sp < 0.35) {
      // Sphere → Helix
      tx = lerp(spherePositions[i3], helixPositions[i3], sphereToHelix);
      ty = lerp(spherePositions[i3 + 1], helixPositions[i3 + 1], sphereToHelix);
      tz = lerp(spherePositions[i3 + 2], helixPositions[i3 + 2], sphereToHelix);
    } else if (sp < 0.6) {
      // Helix → Wave
      tx = lerp(helixPositions[i3], wavePositions[i3], helixToWave);
      ty = lerp(helixPositions[i3 + 1], wavePositions[i3 + 1], helixToWave);
      tz = lerp(helixPositions[i3 + 2], wavePositions[i3 + 2], helixToWave);
    } else {
      // Wave → Expanded
      tx = lerp(wavePositions[i3], expandedPositions[i3], waveToExpanded);
      ty = lerp(wavePositions[i3 + 1], expandedPositions[i3 + 1], waveToExpanded);
      tz = lerp(wavePositions[i3 + 2], expandedPositions[i3 + 2], waveToExpanded);
    }

    posArray[i3] = tx * breathe;
    posArray[i3 + 1] = ty * breathe;
    posArray[i3 + 2] = tz * breathe;
  }
  geometry.attributes.position.needsUpdate = true;

  // Continuous rotation — speed varies with scroll
  const rotSpeed = 0.06 + sp * 0.08;
  particles.rotation.y = t * rotSpeed + mouseX * 0.2;
  particles.rotation.x = Math.sin(t * 0.03) * 0.2 + mouseY * 0.1;

  // Opacity — full in hero, gentle fade below (particles only on margins)
  const heroFade = sp < 0.08 ? 1 : sp < 0.2 ? 1 - (sp - 0.08) / 0.12 * 0.55 : 0.45;
  material.opacity = heroFade * 0.7;

  // Rings morph
  const ringScale = 1 + sp * 0.5;
  ring.scale.setScalar(ringScale);
  ring.rotation.z = t * 0.04 + sp * Math.PI;
  ring.rotation.x = Math.PI * 0.5 + sp * 0.5;
  ringMat.opacity = 0.15 * heroFade;

  ring2.scale.setScalar(ringScale * 1.1);
  ring2.rotation.y = t * 0.025 + sp * Math.PI * 0.5;
  ring2Mat.opacity = 0.08 * heroFade;

  // Constellation lines
  if (Math.floor(t * 60) % 4 === 0) {
    updateLines();
  }
  lines.rotation.copy(particles.rotation);
  lines.scale.copy(particles.scale);
  lineMat.opacity = heroFade * 0.15;

  // Camera follows scroll slightly
  camera.position.z = 4.5 + sp * 1.5;
  camera.position.y = sp * -0.5;

  renderer.render(scene, camera);
}

// ============================================
// INIT + RESIZE
// ============================================
setRendererSize();
animate();

window.addEventListener('resize', setRendererSize);

// Recalc canvas size when content loads
const resizeObserver = new ResizeObserver(() => {
  setRendererSize();
});
resizeObserver.observe(document.body);
