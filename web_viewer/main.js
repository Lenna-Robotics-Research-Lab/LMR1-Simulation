import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import URDFLoader from 'urdf-loader';
import GUI from 'lil-gui';

// =====================================================
// TF AXES
// =====================================================

function createThickAxes(size = 0.075) {

  const group = new THREE.Group();

  const radius = size * 0.04;

  const xAxis = new THREE.ArrowHelper(
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(0, 0, 0),
    size,
    0xff0000,
    size * 0.2,
    radius * 4
  );

  const yAxis = new THREE.ArrowHelper(
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, 0, 0),
    size,
    0x00ff00,
    size * 0.2,
    radius * 4
  );

  const zAxis = new THREE.ArrowHelper(
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(0, 0, 0),
    size,
    0x0000ff,
    size * 0.2,
    radius * 4
  );

  group.add(xAxis, yAxis, zAxis);

  return group;
}

// =====================================================
// SCENE
// =====================================================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x6e6e6e);
scene.fog = new THREE.Fog(0x707070, 3, 12);

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

const title = document.createElement('div');
title.innerHTML = 'LMR1 URDF Visualization';

Object.assign(title.style, {
  position: 'absolute',
  top: '16px',
  left: '12px',
  color: 'white',
  fontFamily: 'sans-serif',
  fontSize: '20px',
  fontWeight: 'bold',
  pointerEvents: 'none',
  userSelect: 'none'
});

document.body.appendChild(title);

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

  // =====================================================
  // GUI
  // =====================================================

  const gui = new GUI();
  gui.width = 300;

  Object.assign(gui.domElement.style, {
    position: 'absolute',
    top: '55px',
    left: '12px'
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

      const tf = createThickAxes(0.075);
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

function animate() {

  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);

}

animate();