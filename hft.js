
const scene = new THREE.Scene();
scene.background = new THREE.Color().setHSL(0.6, 0, 1);
scene.fog = new THREE.Fog(scene.background, 1, 3000);

const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 5000);
camera.position.set(10, 80, 300);
camera.lookAt(0, 0, 100);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

function addLight(x, y, z) {
  const l = new THREE.PointLight(0xffffff, 1, 0);
  l.position.set(x, y, z);
  scene.add(l);
}

function addLights() {
  const l = new THREE.HemisphereLight();
  l.color.setHSL(0.6, 1, 0.99);
  l.groundColor.setHSL(0.6, 0, 0.5);

  addLight(0, 200, 0);
  addLight(100, 200, 100);
  addLight(-100, -200, -100);
  scene.add(l);
}

function addGround() {
  const geo = new THREE.PlaneBufferGeometry(10000, 10000);
  const mat = new THREE.MeshLambertMaterial({ color: 0x0c364b });
  const ground = new THREE.Mesh(geo, mat);
  ground.rotation.x = - Math.PI / 2;
  scene.add(ground);
}

function addSky() {
  const vertexShader = `
    varying vec3 vWorldPosition;
    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `;
  const fragmentShader = `
    varying vec3 vWorldPosition;
    void main() {
      float h = normalize(vWorldPosition).y;
      vec3 top = vec3(0, 0.5, 1);
      vec3 bottom = vec3(1, 1, 1);
      gl_FragColor = vec4(mix(bottom, top, max(pow(max(h, 0.0), 0.6), 0.0)), 1.0);
    }
    `;
  var geo = new THREE.SphereBufferGeometry(4000, 32, 15);
  var mat = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    side: THREE.BackSide,
  });
  var sky = new THREE.Mesh(geo, mat);
  scene.add(sky);
}

addLights();
addGround();
addSky();

function addStocks() {
  const stocks = [];
  for (let i = 0; i < 20; ++i) {
    const row = [];
    for (let j = 0; j < 20; ++j) {
      const geo = new THREE.BoxGeometry(5, 20, 5);
      const mat = new THREE.MeshPhongMaterial( { color: 0x156289, emissive: 0x072534, flatShading: true } );
      const block = new THREE.Mesh(geo, mat);
      block.position.x = -100 + i * 10;
      block.position.z = j * 10;
      scene.add(block);
      row.push(block);
    }
    stocks.push(row);
  }
  return stocks;
}
const stocks = addStocks();

function addPlayer() {
  const geo = new THREE.SphereGeometry(3, 4, 2);
  const mat = new THREE.MeshPhongMaterial( { color: 0x896215, emissive: 0x342507, flatShading: true } );
  const obj = new THREE.Mesh(geo, mat);
  scene.add(obj);
  return obj;
}
const player = { i: 10, j: 10, money: 1000, obj: addPlayer() };

const map = {
  height: function(i, j, t) {
    const phi = 0.005 * t - 0.5 * Math.sqrt((i - 10) * (i - 10) + (j - 10) * (j - 10));
    return 1 + 0.2 * Math.sin(phi);
  },
};

let startTime;
function animate(timestamp) {
	requestAnimationFrame(animate);
  if (startTime === undefined) { startTime = timestamp; }
  const t = timestamp - startTime;
  for (let i = 0; i < 20; ++i) {
    for (let j = 0; j < 20; ++j) {
      stocks[i][j].scale.y = map.height(i, j, t);
    }
  }
  const pt = new THREE.Vector3(
    player.i * 10 - 100,
    3 + 10 * map.height(player.i, player.j, t),
    player.j * 10);
  player.obj.position = player.obj.position.lerp(pt, 0.4);
  player.obj.rotation.y = 0.01 * t;
	renderer.render(scene, camera);
}
animate();

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize, false);

function onKeyDown(evt) {
  if (evt.key === 'ArrowLeft') {
    player.i -= 1;
  } else if (evt.key === 'ArrowRight') {
    player.i += 1;
  } else if (evt.key === 'ArrowUp') {
    player.j -= 1;
  } else if (evt.key === 'ArrowDown') {
    player.j += 1;
  }
}
document.addEventListener('keydown', onKeyDown, false);
