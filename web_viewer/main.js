import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import URDFLoader from 'urdf-loader';
import GUI from 'lil-gui';

// =====================================================
// TF AXES
// =====================================================

// function createThickAxes(size = 0.075) {

//   const group = new THREE.Group();

//   const radius = size * 0.04;

//   const xAxis = new THREE.ArrowHelper(
//     new THREE.Vector3(1, 0, 0),
//     new THREE.Vector3(0, 0, 0),
//     size,
//     0xff0000,
//     size * 0.2,
//     radius * 4
//   );

//   const yAxis = new THREE.ArrowHelper(
//     new THREE.Vector3(0, 1, 0),
//     new THREE.Vector3(0, 0, 0),
//     size,
//     0x00ff00,
//     size * 0.2,
//     radius * 4
//   );

//   const zAxis = new THREE.ArrowHelper(
//     new THREE.Vector3(0, 0, 1),
//     new THREE.Vector3(0, 0, 0),
//     size,
//     0x0000ff,
//     size * 0.2,
//     radius * 4
//   );

//   group.add(xAxis, yAxis, zAxis);

//   return group;
// }

function createThickAxes(
  length = 0.08,
  radius = 0.004
) {

  const group = new THREE.Group();

  const cylinderGeometry =
    new THREE.CylinderGeometry(
      radius,
      radius,
      length,
      16
    );

  // --------------------------------------------------
  // X (RED)
  // --------------------------------------------------

  const xMaterial =
    new THREE.MeshStandardMaterial({
      color: 0xff0000
    });

  const xAxis =
    new THREE.Mesh(
      cylinderGeometry,
      xMaterial
    );

  xAxis.rotation.z = -Math.PI / 2;
  xAxis.position.x = length / 2;

  // --------------------------------------------------
  // Y (GREEN)
  // --------------------------------------------------

  const yMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x00ff00
    });

  const yAxis =
    new THREE.Mesh(
      cylinderGeometry,
      yMaterial
    );

  yAxis.position.y = length / 2;

  // --------------------------------------------------
  // Z (BLUE)
  // --------------------------------------------------

  const zMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x0000ff
    });

  const zAxis =
    new THREE.Mesh(
      cylinderGeometry,
      zMaterial
    );

  zAxis.rotation.x = Math.PI / 2;
  zAxis.position.z = length / 2;

  group.add(
    xAxis,
    yAxis,
    zAxis
  );

  return group;
}

// =====================================================
// SCENE
// =====================================================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x5f5f5f);
// scene.fog = new THREE.Fog(0x707070, 3, 12);

// =====================================================
// CAMERA
// =====================================================

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.01,
  100
);

camera.position.set(0.5, 0.3, 0.5);

// =====================================================
// RENDERER
// =====================================================

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// =====================================================
// TITLE
// =====================================================

// =====================================================
// HEADER (LOGO + TITLE + SUBTITLE)
// =====================================================

const header = document.createElement('div');

Object.assign(header.style, {
  position: 'absolute',
  top: '25px',
  left: '25px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  color: 'white',
  fontFamily: 'sans-serif',
  pointerEvents: 'none',
  userSelect: 'none'
});

// -----------------------------------------------------
// LOGO
// -----------------------------------------------------

const logo = document.createElement('img');

logo.src = './logo.png';

Object.assign(logo.style, {
  width: '48px',
  height: '48px',
  objectFit: 'contain'
});

// -----------------------------------------------------
// TEXT CONTAINER
// -----------------------------------------------------

const textContainer = document.createElement('div');

// -----------------------------------------------------
// TITLE
// -----------------------------------------------------

const title = document.createElement('div');

title.textContent = 'LMR URDF Visualization';

Object.assign(title.style, {
  fontSize: '25px',
  fontWeight: '700',
  lineHeight: '1'
});

// -----------------------------------------------------
// SUBTITLE
// -----------------------------------------------------

const subtitle = document.createElement('div');

subtitle.textContent = 'LENNA Robotics Research Lab.';

Object.assign(subtitle.style, {
  marginTop: '4px',
  fontSize: '14px',
  fontWeight: '400',
  color: '#d0d0d0',
  letterSpacing: '0.5px'
});

textContainer.appendChild(title);
textContainer.appendChild(subtitle);

header.appendChild(logo);
header.appendChild(textContainer);

document.body.appendChild(header);

// =====================================================
// CONTROLS
// =====================================================

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 0.2;
controls.maxDistance = 10;
controls.update();

function disableAutoOrbit() {

  autoOrbit = false;

  window.removeEventListener('pointerdown', disableAutoOrbit);
  window.removeEventListener('wheel', disableAutoOrbit);
  window.removeEventListener('touchstart', disableAutoOrbit);

}

window.addEventListener('pointerdown', disableAutoOrbit);
window.addEventListener('wheel', disableAutoOrbit);
window.addEventListener('touchstart', disableAutoOrbit);

// =====================================================
// CAMERA INTRO ANIMATION
// =====================================================

let autoOrbit = false;

const orbitRadius = Math.sqrt(
  camera.position.x * camera.position.x +
  camera.position.z * camera.position.z
);

let orbitAngle = Math.atan2(
  camera.position.z,
  camera.position.x
);

const orbitSpeed = 0.157; // rad/sec

// =====================================================
// LIGHTING
// =====================================================

scene.add(new THREE.AmbientLight(0xffffff, 1.2));

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 5, 5);
scene.add(dirLight);

// =====================================================
// CAD-STYLE GRID (FADE EFFECT)
// =====================================================

const grid = new THREE.GridHelper(10, 20, 0x222222, 0xaaaaaa);
scene.add(grid);

// fake fade effect
grid.material.opacity = 0.6;
grid.material.transparent = true;

// =====================================================
// LOAD TIMING
// =====================================================

const loadStart = performance.now();

// =====================================================
// URDF LOADER
// =====================================================

const loader = new URDFLoader();

loader.load('./robot/robot.urdf', robot => {

  const loadTime = performance.now() - loadStart;
  console.log(`URDF loaded in ${loadTime.toFixed(2)} ms`);

  robot.rotation.x = -Math.PI / 2;
  scene.add(robot);

  // ================================================
  // START CAMERA INTRO AFTER MODEL IS LOADED
  // ================================================

  requestAnimationFrame(() => {

    requestAnimationFrame(() => {

      setTimeout(() => {

        autoOrbit = true;

      }, 1000);

    });

  });

  // =====================================================
  // GUI
  // =====================================================

  const guiStyle = document.createElement('style');

  guiStyle.textContent = `
  .lil-gui {
      font-size: 15px !important;
  }

  .lil-gui .title {
      font-size: 16px !important;
      font-weight: 600 !important;
  }

  .lil-gui .controller {
      min-height: 28px !important;
  }

  .lil-gui input,
  .lil-gui select,
  .lil-gui button {
      font-size: 14px !important;
  }

  .lil-gui .name {
      font-size: 14px !important;
  }
  `;

document.head.appendChild(guiStyle);

  const gui = new GUI();
  gui.width = 350;

  console.log(gui.domElement);

  gui.domElement.style.minWidth = '350px';
  gui.domElement.style.width = '350px';
  gui.domElement.style.maxWidth = '350px';

  Object.assign(gui.domElement.style, {
    position: 'absolute',
    top: '100px',
    left: '25px'
  });

  // =====================================================
  // TF SYSTEM (HIERARCHICAL)
  // =====================================================

  const tfFolder = gui.addFolder('🧭 TF');

  const tfHelpers = {};
  const tfControllers = [];

  const tfConfig = { enabled: true };

  robot.traverse(node => {

    if (node.isURDFLink) {

      const tf = createThickAxes(
        0.075,
        0.004
      );

      node.add(tf);
      tfHelpers[node.name] = tf;

    }

  });

  tfFolder.add(tfConfig, 'enabled')
    .name('👁 Show TF')
    .onChange(enabled => {

      Object.values(tfHelpers).forEach(tf => {
        tf.visible = enabled;
      });

      tfControllers.forEach(c => {
        c.domElement.style.pointerEvents = enabled ? 'auto' : 'none';
        c.domElement.style.opacity = enabled ? '1' : '0.35';
      });

    });

  Object.entries(tfHelpers).forEach(([name, tf]) => {

    const obj = { visible: true };

    const controller = tfFolder.add(obj, 'visible')
      .name(`📍 ${name}`)
      .onChange(v => tf.visible = tfConfig.enabled && v);

    tfControllers.push(controller);
  });

  tfFolder.close();

  // =====================================================
  // JOINT SYSTEM (DEG + TOOLS)
  // =====================================================

  const jointFolder = gui.addFolder('⚙️ Joints');

  const jointControllers = [];

  const jointTools = {

    center: () => {

      jointControllers.forEach(j => {
        j.obj.value = 0;
        j.joint.setJointValue(0);
        j.controller.updateDisplay();
      });

    },

    random: () => {

      jointControllers.forEach(j => {

        const v = THREE.MathUtils.randFloat(-180, 180);
        const rounded = Math.round(v * 100) / 100;

        j.obj.value = rounded;
        j.joint.setJointValue(rounded * Math.PI / 180);
        j.controller.updateDisplay();

      });

    }

  };

  jointFolder.add(jointTools, 'center').name('Center');
  jointFolder.add(jointTools, 'random').name('🎲');

  Object.values(robot.joints).forEach(joint => {

    if (
      joint.jointType === 'revolute' ||
      joint.jointType === 'continuous'
    ) {

      const obj = { value: 0 };

      const controller = jointFolder.add(
        obj,
        'value',
        -180,
        180,
        1
      )
      .name(`🔄 ${joint.name}`)
      .onChange(val => {
        joint.setJointValue(val * Math.PI / 180);
      });

      jointControllers.push({
        joint,
        obj,
        controller
      });

    }

  });

  jointFolder.open();

  // =====================================================
  // HOVER HIGHLIGHT (LIGHT VERSION)
  // =====================================================

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let lastHover = null;

  window.addEventListener('mousemove', (e) => {

    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const meshes = [];
    robot.traverse(n => {
      if (n.isMesh) meshes.push(n);
    });

    const hits = raycaster.intersectObjects(meshes, true);

    if (lastHover) lastHover.material.emissive?.set(0x000000);

    if (hits.length > 0) {

      const obj = hits[0].object;

      if (obj.material && obj.material.emissive) {
        obj.material.emissive.set(0x222222);
        lastHover = obj;
      }

    }

  });

});

// =====================================================
// RESIZE
// =====================================================

window.addEventListener('resize', () => {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

});

// =====================================================
// LOOP
// =====================================================

const clock = new THREE.Clock();

function animate() {

  requestAnimationFrame(animate);

  const dt = clock.getDelta();

  if (autoOrbit) {

    orbitAngle += orbitSpeed * dt;

    camera.position.x =
      orbitRadius * Math.cos(orbitAngle);

    camera.position.z =
      orbitRadius * Math.sin(orbitAngle);

    camera.lookAt(controls.target);

  } else {

    controls.update();

  }

  renderer.render(scene, camera);

}

animate();