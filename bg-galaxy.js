import * as THREE from 'three';

export function initGalaxyBackground() {
  const canvas = document.getElementById('bg-galaxy-canvas');
  if (!canvas) return;

  const isMobile = window.innerWidth < 768;
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
  const count = isMobile ? 5000 : isTablet ? 9000 : 15000;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: !isMobile,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2('#050508', 0.0035);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 30, 85);
  camera.lookAt(0, 0, 0);

  const geometry = new THREE.TetrahedronGeometry(isMobile ? 0.35 : 0.28);
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const instancedMesh = new THREE.InstancedMesh(geometry, material, count);

  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  const target = new THREE.Vector3();
  const currentPositions = [];

  for (let i = 0; i < count; i++) {
    currentPositions.push(
      new THREE.Vector3(
        (Math.random() - 0.5) * 120,
        (Math.random() - 0.5) * 120,
        (Math.random() - 0.5) * 120
      )
    );
  }

  const PARAMS = { radius: 110, arms: 4, twist: 3.5, spin: 0.35 };

  let mouseX = 0;
  let mouseY = 0;
  let targetMouseX = 0;
  let targetMouseY = 0;

  window.addEventListener('mousemove', (e) => {
    targetMouseX = (e.clientX / window.innerWidth - 0.5) * 0.5;
    targetMouseY = (e.clientY / window.innerHeight - 0.5) * 0.5;
  });

  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      targetMouseX = (e.touches[0].clientX / window.innerWidth - 0.5) * 0.5;
      targetMouseY = (e.touches[0].clientY / window.innerHeight - 0.5) * 0.5;
    }
  }, { passive: true });

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();

    mouseX += (targetMouseX - mouseX) * 0.04;
    mouseY += (targetMouseY - mouseY) * 0.04;

    const rotAngle = time * 0.05;
    camera.position.x = Math.sin(rotAngle) * 85 + mouseX * 35;
    camera.position.z = Math.cos(rotAngle) * 85 + mouseY * 25;
    camera.position.y = 30 + mouseY * 25;
    camera.lookAt(0, 0, 0);

    const radius = PARAMS.radius;
    const arms = PARAMS.arms;
    const twist = PARAMS.twist;
    const spin = PARAMS.spin;
    const g = 2.399963229728653;

    for (let i = 0; i < count; i++) {
      const u = (i + 0.5) / count;
      const r = radius * Math.sqrt(u);
      const arm = (i % arms) / arms;
      const angle = arm * Math.PI * 2 + r * twist * 0.08 + i * g * 0.01 + time * spin;

      const wave = Math.sin(r * 0.18 - time * 1.2);
      const spread = (1.0 - u) * radius * 0.12;

      const x = Math.cos(angle) * (r + spread * wave);
      const z = Math.sin(angle) * (r + spread * wave);
      const y = (1.0 - u) * (1.0 - u) * radius * 0.08 * Math.sin(angle * 3.0 + time);

      target.set(x, y, z);

      const h = 0.72 - 0.18 * (1.0 - u);
      const s = 0.70 + 0.30 * u;
      const l = 0.88 - 0.40 * u;

      color.setHSL(h, s, l);

      currentPositions[i].lerp(target, 0.07);
      dummy.position.copy(currentPositions[i]);
      const pulse = 0.75 + 0.45 * Math.sin(i * 0.5 + time * 2.5);
      dummy.scale.setScalar(pulse);
      dummy.updateMatrix();

      instancedMesh.setMatrixAt(i, dummy.matrix);
      instancedMesh.setColorAt(i, color);
    }

    instancedMesh.instanceMatrix.needsUpdate = true;
    if (instancedMesh.instanceColor) instancedMesh.instanceColor.needsUpdate = true;

    renderer.render(scene, camera);
  }

  scene.add(instancedMesh);
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
