import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const canvas  = document.getElementById('cloud-canvas');
const stage   = canvas.parentElement;
const loading = document.getElementById('cloud-loading');
const hud     = document.getElementById('cloud-hud');
const tabs    = document.getElementById('cloud-tabs');

// ---- renderer / scene / camera ----
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 5000);
camera.up.set(0, 0, 1);          // LiDAR data is Z-up

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.rotateSpeed = 0.7;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.6;

let current = null;              // THREE.Points currently in scene

function resize() {
  const w = stage.clientWidth, h = stage.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);

function frameCloud(radius) {
  const d = radius * 1.35;
  camera.position.set(d * 0.7, -d, d * 0.5);
  controls.target.set(0, 0, 0);
  controls.minDistance = radius * 0.1;
  controls.maxDistance = radius * 8;
  controls.update();
}

// ---- parse the compact .pcw binary ----
async function loadCloud(meta) {
  loading.style.display = 'grid';
  loading.textContent = 'Loading point cloud…';
  try {
    const buf = await (await fetch(meta.url)).arrayBuffer();
    const dv = new DataView(buf);
    const magic = String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3));
    if (magic !== 'PCLW') throw new Error('bad file');
    const count = dv.getUint32(8, true);
    let off = 12;
    const positions = new Float32Array(buf, off, count * 3); off += count * 3 * 4;
    const colors8   = new Uint8Array(buf, off, count * 3);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < colors.length; i++) colors[i] = colors8[i] / 255;

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: meta.pointSize || 0.03,
      sizeAttenuation: true,
      vertexColors: true,
    });
    const pts = new THREE.Points(geom, mat);

    if (current) { scene.remove(current); current.geometry.dispose(); current.material.dispose(); }
    current = pts;
    scene.add(pts);
    frameCloud(meta.radius || 20);

    hud.textContent = `${meta.label} · ${count.toLocaleString()} pts`;
    loading.style.display = 'none';
  } catch (e) {
    loading.textContent = 'Could not load this cloud.';
    console.error(e);
  }
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

// ---- boot: read manifest, build tabs, load first ----
(async function init() {
  resize();
  animate();
  let clouds;
  try {
    clouds = await (await fetch('assets/clouds/clouds.json')).json();
  } catch (e) {
    loading.textContent = 'Viewer data unavailable.';
    return;
  }
  clouds.forEach((meta, i) => {
    const b = document.createElement('button');
    b.className = 'viewer-tab' + (i === 0 ? ' active' : '');
    b.textContent = meta.label;
    b.onclick = () => {
      tabs.querySelectorAll('.viewer-tab').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      loadCloud(meta);
    };
    tabs.appendChild(b);
  });
  loadCloud(clouds[0]);
})();
