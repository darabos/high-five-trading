function v3(x, y, z) { return new THREE.Vector3(x, y, z); }
const scene = new THREE.Scene();
scene.background = new THREE.Color().setHSL(0.6, 0, 1);
scene.fog = new THREE.Fog(scene.background, 1, 3000);

const fov = 60 * window.innerHeight / window.innerWidth;
const camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 1, 5000);
camera.position.set(-90, 250, 350);
camera.lookAt(0, 10, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

function setupComposer() {
  const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.5, 0.5);
  const composer = new THREE.EffectComposer(renderer);
  composer.setSize(window.innerWidth, window.innerHeight);
  composer.addPass(new THREE.RenderPass(scene, camera));
  composer.addPass(bloomPass);
  return composer;
}
const composer = setupComposer();

const textureLoader = new THREE.TextureLoader();
const particles = new THREE.GPUParticleSystem({
  maxParticles: 25000,
  particleSpriteTex: textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/r103/examples/textures/particle2.png'),
  particleNoiseTex: textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/r103/examples/textures/perlin-512.png'),
});
scene.add(particles);
const dust = {
  position: v3(-60, 30, 0),
  positionRandomness: 200,
  velocity: v3(3, 0, 0.2),
  velocityRandomness: .5,
  color: 0xffffff,
  colorRandomness: .2,
  turbulence: .2,
  lifetime: 20,
  size: 20,
  sizeRandomness: 20,
};

function addLight(x, y, z) {
  const l = new THREE.PointLight(0xffffff, 1, 0);
  l.position.set(x, y, z);
  scene.add(l);
}

function addLights() {
  const l = new THREE.HemisphereLight();
  l.color.setHSL(0.6, 1, 0.99);
  l.groundColor.setHSL(0.6, 0, 0.5);
  scene.add(l);

  addLight(0, 400, 0);
  addLight(-200, 10, 50);
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

const stockColor = 0x105080;
function addStocks() {
  const stocks = [];
  const w = map.stockWidth || 5;
  const geo = new THREE.BoxGeometry(w, 20, w);
  for (let i = 0; i < map.size[0]; ++i) {
    const row = [];
    for (let j = 0; j < map.size[1]; ++j) {
      const mat = new THREE.MeshPhongMaterial( { color: stockColor, emissive: stockColor, flatShading: true } );
      const block = new THREE.Mesh(geo, mat);
      block.position.x = i * 10 - 5 * map.size[0];
      block.position.z = j * 10 - 5 * map.size[1];
      scene.add(block);
      row.push(block);
    }
    stocks.push(row);
  }
  return stocks;
}

function addStairs() {
  const stairs = [];
  for (let i = 1; i < 5; ++i) {
    for (let j = 0; j < i + 2; ++j) {
      const geo = new THREE.BoxGeometry(5, 3, 5);
      const mat = new THREE.MeshPhongMaterial( { color: 0x896215, emissive: 0x342507, flatShading: true } );
      const block = new THREE.Mesh(geo, mat);
      block.i = i;
      block.j = j;
      const c = j - (i + 1) / 2;
      block.position.x = -i * 12 + c * c - 5 * map.size[0];
      block.position.z = c * 10 * sqrt(i) - 5 * (map.size[1] % 2);
      block.position.y = -6 * i;
      block.rotation.x = 0.1 * rnd() * i;
      block.rotation.y = 0.1 * rnd() * i;
      block.basePos = block.position.clone();
      scene.add(block);
      stairs.push(block);
    }
  }
  return stairs;
}

const playerGeos = [
  new THREE.SphereGeometry(3, 4, 2),
  new THREE.CylinderGeometry(3, 3, 1),
  new THREE.TetrahedronGeometry(3),
  new THREE.IcosahedronGeometry(3),
  new THREE.TorusGeometry(3, 1, 5, 20),
];
playerGeos[4].lookAt(v3(0, 1, 0));
const playerColors = [
  0x896215,
  0x621589,
  0x901010,
  0x309010,
];
function addPlayer(geo, color) {
  const mat = new THREE.MeshPhongMaterial( { color, emissive: color, flatShading: true } );
  const obj = new THREE.Mesh(geo, mat);
  scene.add(obj);
  return obj;
}

const sin = Math.sin;
const cos = Math.cos;
const sqrt = Math.sqrt;
const floor = Math.floor;
const min = Math.min;
const max = Math.max;
const tanh = Math.tanh;
const pow = Math.pow;
const atan2 = Math.atan2;
const rnd = Math.random;
const abs = Math.abs;
const dist2 = (i, j, x, y) => (i - x) * (i - x) + (j - y) * (j - y);
const dist = (i, j, x, y) => sqrt(dist2(i, j, x, y));
const normdir = (a, b) => {
  const d = max(0.01, dist(a.i, a.j, b.i, b.j));
  return { d, i: (b.i - a.i) / d, j: (b.j - a.j) / d };
};

const music = {
  // Cowboy Glitch (borja vs. go1dfish) by spinningmerkaba (c) copyright 2011 Licensed under a Creative Commons Attribution (3.0) license. http://dig.ccmixter.org/files/jlbrock44/33623 Ft: borja, go1dfish
  cowboy: 'https://media.githubusercontent.com/media/darabos/high-five-trading/master/music/jlbrock44_-_Cowboy_Glitch_(borja_vs._go1dfish).mp3',
  // 260809 Funky Nurykabe by spinningmerkaba (c) copyright 2010 Licensed under a Creative Commons Attribution (3.0) license. http://dig.ccmixter.org/files/jlbrock44/29186
  funky: 'https://media.githubusercontent.com/media/darabos/high-five-trading/master/music/jlbrock44_-_260809_Funky_Nurykabe.mp3',
  // Urbana-Metronica (wooh-yeah mix) by spinningmerkaba (c) copyright 2011 Licensed under a Creative Commons Attribution (3.0) license. http://dig.ccmixter.org/files/jlbrock44/33345 Ft: Morusque, Jeris, CSoul, Alex Beroza
  urbana: 'https://media.githubusercontent.com/media/darabos/high-five-trading/master/music/jlbrock44_-_Urbana-Metronica_(wooh-yeah_mix).mp3',
  // Reusenoise  (DNB Mix) by spinningmerkaba (c) copyright 2017 Licensed under a Creative Commons Attribution (3.0) license. http://dig.ccmixter.org/files/jlbrock44/56531
  reusenoise: 'https://media.githubusercontent.com/media/darabos/high-five-trading/master/music/jlbrock44_-_Reusenoise_(DNB_Mix)_1.mp3',
  // Organometron (140811 MIx) by spinningmerkaba (c) copyright 2011 Licensed under a Creative Commons Attribution (3.0) license. http://dig.ccmixter.org/files/jlbrock44/33115 Ft: Morusque
  organometron: 'https://media.githubusercontent.com/media/darabos/high-five-trading/master/music/jlbrock44_-_Organometron_(140811_MIx).mp3',
  // Sticky Bumps (featuring Debbizo) by spinningmerkaba (c) copyright 2011 Licensed under a Creative Commons Attribution (3.0) license. http://dig.ccmixter.org/files/jlbrock44/32247
  sticky: 'https://media.githubusercontent.com/media/darabos/high-five-trading/master/music/jlbrock44_-_Sticky_Bumps_(featuring_Debbizo).mp3',
};

const maps = {

  demo: {
    size: [30, 30],
    capital: [1000, 200000],
    dust: 1000,
    height: (i, j, t) => {
      i -= 15; j -= 15;
      const r = sqrt(i * i + j * j);
      const phi = 3 * atan2(i, j) - t * 0.002 + 0.5 * r;
      return sin(phi) + 1.1;
    },
    music: music.reusenoise,
    cameraPos: v3(10, 30, 150),
    update(dt) {
      map.cameraPos.applyAxisAngle(v3(0, 1, 0), 0.001 * dt);
    },
    onStart() {
      document.getElementById('capital-group').style.display = 'none';
      document.getElementById('menu-group').style.display = 'flex';
      document.getElementById('continue').style.display = options.map ? 'block' : 'none';
      document.getElementById('skip').style.display = options.map ? 'block' : 'none';
      document.getElementById('party-mode').style.display = (options.map && options.map != 'Tutorial') ? 'block' : 'none';
    },
    onEnd() {
      document.getElementById('capital-group').style.display = '';
      document.getElementById('menu-group').style.display = 'none';
    },
  },

  Tutorial: {
    size: [2, 1],
    startPos: [0, 0],
    capital: [1000, 5000],
    cameraPos: v3(10, 25, 100),
    height: (i, j, t) => i === 0 ? 1 : (1 + 0.5 * sin(0.002 * t)),
    update() {
      if (player.i === 1 && !map.warned) {
        runScene('tutorialMovingBack');
        map.warned = true;
      }
      if (player.i === 0 && player.capital < map.capital[0] && !map.oopsed) {
        runScene('tutorialOops');
        map.oopsed = true;
      }
      if (player.i === 0 && player.capital > map.capital[0] && !map.profited) {
        runScene('tutorialMoney');
        map.profited = true;
      }
      if (player.i === 0 && player.capital > map.capital[1] && !map.done) {
        runScene('tutorialDone');
        map.done = true;
      }
    },
    onStart() { runScene('tutorial'); },
    onEnd() { setMap('Gentle Waves'); },
    music: music.organometron,
  },

  'Gentle Waves': {
    size: [12, 1],
    startPos: [0, 0],
    capital: [1000, 1000000],
    cameraPos: v3(10, 40, 160),
    height(i, j, t) {
      t = sin(0.001 * t)
      return 1 + 0.5 * sin(4 * t + i + 2);
    },
    onStart() { runScene('map2'); },
    onEnd() { setMap('Swirling Slowly'); },
    music: music.organometron,
  },

  'Swirling Slowly': {
    size: [20, 20],
    capital: [1000, 1000000],
    cameraPos: v3(-50, 250, 350),
    height: (i, j, t) => {
      i -= 10; j -= 10;
      const r = sqrt(i * i + j * j);
      const phi = 2 * atan2(i, j) - t * 0.001 + 0.5 * r;
      const attenuation = pow(2, -0.02 * r * r);
      return sin(phi) * attenuation + 1.1;
    },
    onStart() { runScene('map3'); },
    onEnd() { setMap('A Drop in the Ocean'); },
    music: music.urbana,
  },

  'A Drop in the Ocean': {
    size: [20, 20],
    capital: [1000, 10000],
    cameraPos: v3(-50, 250, 350),
    height: function(i, j, t) {
      const phi = 0.005 * t - 0.5 * dist(i, j, 10, 10);
      return 1 + 0.2 * sin(phi);
    },
    onStart() { runScene('map4'); },
    onEnd() { setMap('Bulls & Bears'); },
    music: music.funky,
  },

  'Bulls & Bears': {
    size: [20, 20],
    capital: [1000, 100000],
    cameraPos: v3(-50, 250, 350),
    height: (i, j, t) => {
      i -= 9.5; j -= 9.5;
      t += 300000;
      let h = 0;
      for (let k = 1; k < 4; ++k) {
        const dx = 8 * sin(0.0005 * t + 0.0001 * t * k);
        const dy = 8 * cos(0.0005 * t + 0.0001 * t * sqrt(k));
        const d = dist(i, j, dx, dy);
        const s = k % 2 * 2 - 1;
        h += s * pow(2, -0.3 * d * d);
      }
      return 2.1 + 2 * tanh(h);
    },
    onStart: () => runScene('map6dimples'),
    onEnd() { setMap('Sharks'); },
    music: music.cowboy,
  },

  'Sharks': {
    size: [20, 20],
    capital: [1000, 10000000],
    cameraPos: v3(-50, 250, 350),
    onStart: () => runScene('map7sharks'),
    onEnd() { setMap('Checkerboard'); },
    sharks: [],
    update(dt) {
      while (map.sharks.length < 2) {
        map.sharks.push({ i: rnd() * 20, j: rnd() * 20, vi: rnd(), vj: rnd() });
      }
      for (let shark of map.sharks) {
        const pdir = normdir(shark, player);
        let fi = 0.002 * pdir.i;
        let fj = 0.002 * pdir.j;
        for (let s2 of map.sharks) {
          if (s2 !== shark) {
            const sdir = normdir(shark, s2);
            fi -= 0.001 * sdir.i / sdir.d;
            fj -= 0.001 * sdir.j / sdir.d;
          }
        }
        shark.vi += dt * fi;
        shark.vj += dt * fj;
        const v = sqrt(shark.vi * shark.vi + shark.vj * shark.vj);
        if (v) { shark.vi /= v; shark.vj /= v; }
        shark.i += 0.005 * dt * shark.vi;
        shark.j += 0.005 * dt * shark.vj;
      }
    },
    height: function(i, j, t) {
      function sharkShape(i, j) {
        i -= 3;
        if (i > 0) { i *= 4; }
        return pow(1.1, -(i * i + 10 * j * j));
      }
      let h = 0.1;
      for (let s of map.sharks) {
        const di = s.i - i; const dj = s.j - j;
        h += sharkShape(di * s.vi + dj * s.vj, dj * s.vi - di * s.vj);
      }
      return h;
    },
    music: music.funky,
  },

  'Checkerboard': {
    size: [20, 20],
    capital: [1000, 100000],
    cameraPos: v3(-50, 250, 350),
    height: function(i, j, t) {
      const scale = 0.9;
      return 1 + 0.3 * sin(0.005 * t) * sin(10 + scale * i) * sin(10 + scale * j);
    },
    onStart: () => runScene('map8'),
    onEnd() { setMap('Ripples Around Us'); },
    music: music.urbana,
  },

  'Ripples Around Us': {
    size: [20, 20],
    capital: [1000, 100000],
    cameraPos: v3(-50, 250, 350),
    height: function(i, j, t) {
      h = 1;
      for (let {x, y, p} of [{p: 0, x: 0, y: 0}, {p: 1, x: 19, y: 0}, {p: 2, x: 19, y: 19}, {p: 3, x: 0, y: 19}]) {
        const d = dist(i, j, x, y);
        h += sin(0.001 * t + p * Math.PI / 4) * pow(1.01, -d * d) * sin(0.01 * t - d);
      }
      return max(0.5, h);
    },
    onStart: () => runScene('map9'),
    onEnd() { setMap('The Frequency Spectrum'); },
    music: music.urbana,
  },

  'The Frequency Spectrum': {
    size: [20, 20],
    capital: [1000, 100000],
    cameraPos: v3(-50, 250, 350),
    height: function(i, j, t) {
      const mask = max(0.1, tanh(10 - dist(i, j, 10, 10)));
      return mask * (1 + 0.3 * sin(0.0005 * t * (i + 10) + j));
    },
    onStart: () => runScene('map9b'),
    onEnd() { setMap('The Collapse'); },
    music: music.sticky,
  },

  'The Collapse': {
    size: [20, 20],
    capital: [1000, 10000],
    cameraPos: v3(-50, 250, 350),
    height: function(i, j, t) {
      if (i === map.tower[0] && j === map.tower[1]) {
        return 2;
      } else {
        return 1.1 + tanh(hf.u[i][j]);
      }
    },
    towerColor: 0xff0000,
    update(dt) {
      hf.update(dt);
      if (player.i === map.tower[0] && player.j === map.tower[1]) {
        hf.u[map.tower[0]][map.tower[1]] = 10;
        stocks[map.tower[0]][map.tower[1]].material.color.set(stockColor);
        map.tower = [floor(rnd() * 20), floor(rnd() * 20)];
        stocks[map.tower[0]][map.tower[1]].material.color.set(map.towerColor);
      }
    },
    onStart() {
      runScene('map10'),
      map.tower = [floor(rnd() * 20), floor(rnd() * 20)];
      stocks[map.tower[0]][map.tower[1]].material.color.set(map.towerColor);
    },
    onEnd() { setMap('Pumping Money'); },
    music: music.sticky,
  },

  'Pumping Money': {
    pumpStrength: 10,
    size: [20, 20],
    capital: [1000, 3000],
    cameraPos: v3(-50, 250, 350),
    height: function(i, j, t) {
      return 1.1 + tanh(hf.u[i][j]);
    },
    update(dt) { hf.update(dt); },
    onStart() { runScene('map11pnd'); },
    onEnd() { setMap('Burrowed Investments'); },
    music: music.reusenoise,
  },

  'Burrowed Investments': {
    size: [20, 20],
    capital: [1000, 100000],
    cameraPos: v3(-50, 250, 350),
    height: function(i, j, t) {
      return 1.1 + 0.5 * tanh(hf.u[i][j]);
    },
    px: 5, py: 5, nx: 15, ny: 15,
    delay: 0,
    update(dt) {
      map.delay += dt;
      while (map.delay > 10) {
        map.delay -= 10;
        if (rnd() < 0.25 && map.px < map.size[0] - 1) {
          map.px += 1;
        } else if (rnd() < 0.33 && map.px > 0) {
          map.px -= 1;
        } else if (rnd() < 0.5 && map.py < map.size[1] - 1) {
          map.py += 1;
        } else if (map.py > 0) {
          map.py -= 1;
        }
        if (rnd() < 0.25 && map.nx < map.size[0] - 1) {
          map.nx += 1;
        } else if (rnd() < 0.33 && map.nx > 0) {
          map.nx -= 1;
        } else if (rnd() < 0.5 && map.ny < map.size[1] - 1) {
          map.ny += 1;
        } else if (map.ny > 0) {
          map.ny -= 1;
        }
        hf.v[map.px][map.py] = 1;
        hf.v[map.nx][map.ny] = -1;
        for (let i = 0; i < map.size[0]; ++i) {
          for (let j = 0; j < map.size[1]; ++j) {
            hf.u[i][j] += hf.v[i][j] * 0.005 * dt;
            hf.u[i][j] = max(-10, min(10, hf.u[i][j]));
          }
        }
      }
    },
    onStart() { runScene('map12didit'); },
    onEnd() { setMap('A Whirlwind of Capital'); },
    music: music.urbana,
  },

  'A Whirlwind of Capital': {
    size: [20, 20],
    startPos: [19, 9],
    capital: [10, 1000000000],
    cameraPos: v3(-50, 250, 350),
    height: (i, j, t) => {
      i -= 10; j -= 10;
      const r = sqrt(i * i + j * j);
      const phi = 3 * atan2(i, j) - t * 0.002 + 0.5 * r;
      return sin(phi) + 1.1;
    },
    onStart() { runScene('map13'); },
    onEnd() { setMap('Mount Everest'); },
    music: music.organometron,
  },

  'Mount Everest': {
    size: [20, 20],
    capital: [1000, 10000],
    cameraPos: v3(-100, 250, 400),
    // Height map from http://terrain.party/api/export?name=everest&box=86.985352,28.005234,86.863257,27.897436
    h: [
    [11884, 15411, 23340, 31812, 34021, 31369, 32275, 34177, 37180, 41043, 45874, 51382, 50658, 45354, 39117, 31369, 25665, 23981, 19052, 12743],
    [15518, 17489, 22692, 34004, 38924, 38826, 40255, 41977, 44511, 47317, 52017, 55330, 47884, 40109, 33412, 24907, 21130, 20457, 18976, 15303],
    [21533, 20823, 21314, 30105, 35590, 37047, 38742, 42798, 49860, 55889, 59051, 52772, 43189, 37792, 30945, 21336, 15921, 13537, 13794, 13734],
    [25287, 23222, 21078, 24539, 28203, 29550, 31140, 35977, 44312, 55101, 60168, 51806, 43981, 37400, 31659, 25417, 16635, 13050, 13005, 12239],
    [23776, 31314, 27299, 24234, 25209, 26582, 28078, 31103, 37589, 46619, 54745, 52264, 44335, 36434, 28235, 21056, 15544, 13037, 13102, 12770],
    [23149, 36053, 39881, 35167, 33946, 29863, 28790, 29882, 33672, 41069, 47948, 49353, 42315, 33839, 24712, 16348, 14398, 13740, 13005, 12397],
    [25782, 30277, 41250, 45671, 41951, 34414, 31714, 30759, 32884, 39214, 46586, 50361, 43128, 33149, 22493, 15292, 14496, 13153, 13855, 16507],
    [16811, 16753, 28719, 39894, 44871, 42970, 38924, 37312, 37993, 42638, 49536, 55189, 49414, 38854, 27092, 17751, 16951, 17909, 20068, 22698],
    [13356, 14130, 19268, 29023, 35807, 40282, 42526, 40743, 42265, 46187, 48921, 50001, 51902, 51614, 43491, 37326, 36749, 34849, 29727, 27277],
    [12100, 13108, 18208, 24968, 26174, 28193, 34226, 29668, 29293, 32755, 32354, 33480, 38673, 44123, 46076, 42994, 42228, 39310, 37878, 37017],
    [11000, 12482, 17237, 16263, 15786, 18584, 24127, 24871, 18644, 16348, 17819, 23275, 27804, 32824, 38221, 35575, 32546, 31759, 35931, 40055],
    [10323, 13969, 15368, 10992, 9760, 10812, 15702, 18199, 14559, 11635, 11569, 15645, 22989, 27092, 27772, 28871, 25677, 25770, 30524, 33471],
    [9610, 14571, 15053, 10101, 8540, 9637, 12992, 14177, 10277, 9552, 9795, 12257, 17668, 16408, 16889, 20710, 20068, 18610, 25735, 27440],
    [8545, 9843, 12291, 9774, 7883, 9384, 12291, 14814, 10084, 8868, 8853, 12047, 15405, 11752, 12065, 14306, 14684, 14035, 21145, 22854],
    [8270, 8662, 12435, 9908, 6692, 8595, 12914, 10649, 8153, 8360, 9830, 15744, 18332, 12600, 10459, 10160, 11784, 13140, 20279, 22766],
    [6770, 9293, 11362, 8697, 6372, 8921, 10451, 7804, 7649, 7886, 14188, 20793, 19661, 12836, 9547, 9690, 10568, 12222, 22445, 28130],
    [6305, 7738, 7607, 5939, 6780, 8111, 6974, 6928, 7466, 9597, 17118, 19989, 14775, 9597, 8949, 10269, 10273, 17586, 24901, 25990],
    [5710, 5382, 5204, 5520, 6064, 6302, 6378, 6609, 8161, 11547, 13580, 14468, 11780, 8590, 8731, 11766, 16709, 23994, 24019, 20951],
    [2519, 2490, 3716, 5114, 5593, 5825, 6201, 6519, 7213, 7967, 8687, 9973, 9097, 7821, 9782, 12973, 21033, 24063, 20966, 20519],
    [1340, 2648, 3667, 4462, 5268, 5498, 6057, 6414, 6342, 6130, 6570, 6848, 6974, 7457, 10210, 12107, 18332, 24925, 23692, 21670]],
    bx: 12, by: 8, vx: 0, vy: 0,
    startPos: [5, 18],
    height: function(i, j, t) {
      const d = dist2(i, j, map.bx, map.by);
      return map.h[j][i] * 0.0001 + 2 * pow(2, -d);
    },
    update(dt) {
      const mode = floor(t / 1000) % 2;
      const dir = normdir(player, { i: map.bx, j: map.by });
      if (mode) {
        if (dir.d < 4) {
          if (dir.d < 2) { dir.d = 2; }
          map.vx += 0.2 * dt * dir.i / dir.d;
          map.vy += 0.2 * dt * dir.j / dir.d;
        }
      } else {
        const sx = map.h[floor(map.by + 0.5)][floor(map.bx)] - map.h[floor(map.by + 0.5)][floor(map.bx + 1)];
        const sy = map.h[floor(map.by)][floor(map.bx + 0.5)] - map.h[floor(map.by + 1)][floor(map.bx + 0.5)];
        map.vx += 0.000001 * dt * sx;
        map.vy += 0.000001 * dt * sy;
        map.vx -= 0.01 * dt * dir.i;
        map.vy -= 0.01 * dt * dir.j;
      }
      map.vx *= pow(0.999, dt);
      map.vy *= pow(0.999, dt);
      map.bx += 0.001 * dt * map.vx;
      map.by += 0.001 * dt * map.vy;
      if (map.bx < 2) { map.bx = 4 - map.bx; map.vx *= -1; }
      if (map.bx > 17) { map.bx = 34 - map.bx; map.vx *= -1; }
      if (map.by < 2) { map.by = 4 - map.by; map.vy *= -1; }
      if (map.by > 17) { map.by = 34 - map.by; map.vy *= -1; }
      for (let i = 0; i < map.size[0]; ++i) {
        for (let j = 0; j < map.size[1]; ++j) {
          const d = (mode ? 2 : 1) * max(1, dist2(i, j, map.bx, map.by));
          stocks[i][j].material.emissive.set(0);
          stocks[i][j].material.color.set(0x2070b0);
          stocks[i][j].material.color.multiplyScalar(pow(3, 1 / d));
        }
      }
    },
    onStart() { runScene('map14tibet'); },
    onEnd() { runScene('map15reunion', () => setMap('Shanghai Stock Exchange')); },
    music: music.reusenoise,
  },

  'Shanghai Stock Exchange': {
    size: [20, 20],
    capital: [1000, 10000],
    cameraPos: v3(-50, 250, 350),
    height: (i, j, t) => {
      i -= 9.5; j -= 9.5;
      t += 100000;
      let h = 0;
      for (let k = 0; k < 8; ++k) {
        const dx = 8 * sin(0.001 * t + 0.0001 * t * k);
        const dy = 8 * cos(0.001 * t + 0.0001 * t * sqrt(k));
        const d = dist(i, j, dx, dy);
        const s = k % 2 * 2 - 1;
        h += s * pow(2, -0.3 * d * d);
      }
      return 2.1 + 2 * tanh(h);
    },
    onEnd() { setMap('Interlaced Futures'); },
    music: music.cowboy,
  },

  'Interlaced Futures': {
    size: [20, 20],
    capital: [1000, 10000],
    cameraPos: v3(-50, 250, 350),
    height: (i, j, t) => {
      const s = floor(j / 2) % 2 * 2 - 1;
      const p = s * (i - 9.5);
      return 1 + 0.5 * (1 + sin((0.01 * t + 0.2 * j + 0.5 * p))) * (1 + tanh( 0.2 * p));
    },
    onStart() { runScene('map16'); },
    onEnd() { setMap('Lissajous Trading'); },
    music: music.urbana,
  },

  'Lissajous Trading': {
    size: [20, 20],
    capital: [1000, 100000],
    cameraPos: v3(-50, 250, 350),
    height: (i, j, t) => {
      i -= 9.5; j -= 9.5;
      let h = 0;
      for (let k = 0; k < 10; ++k) {
        const dx = 8 * sin(0.001 * t + k * Math.PI / 5);
        const dy = 8 * cos(0.00123 * t + k * Math.PI / 5);
        const d = dist(i, j, dx, dy);
        const s = k % 2 * 2 - 1;
        h += s * pow(2, -0.2 * d * d);
      }
      return 1.1 + tanh(h);
    },
    onStart() { runScene('map17'); },
    onEnd() { setMap('Throw Your Weight Around'); },
    music: music.cowboy,
  },

  'Throw Your Weight Around': {
    size: [20, 20],
    capital: [1000, 10000],
    cameraPos: v3(-50, 250, 350),
    tilt: { x: 0, y: 0, vx: 0, vy: 0 },
    height: (i, j, t) => {
      i -= 9.5; j -= 9.5;
      return 2.1 + i * map.tilt.x + j * map.tilt.y;
    },
    update(dt) {
      map.tilt.x += 0.001 * dt * map.tilt.vx;
      map.tilt.y += 0.001 * dt * map.tilt.vy;
      const d = sqrt(map.tilt.x * map.tilt.x + map.tilt.y * map.tilt.y) * 10 / sqrt(2);
      if (d > 1) {
        map.tilt.x /= d;
        map.tilt.y /= d;
        map.tilt.vx = 0;
        map.tilt.vy = 0;
      }
      const t = { x: 9.5 - player.i, y: 9.5 - player.j };
      t.d = sqrt(t.x * t.x + t.y * t.y) * 10 / sqrt(2);
      if (t.d > 0.5) {
        t.x /= 2 * t.d;
        t.y /= 2 * t.d;
      }
      const drag = pow(0.9999, dt);
      map.tilt.vx = drag * map.tilt.vx + 0.002 * dt * (t.x - map.tilt.x);
      map.tilt.vy = drag * map.tilt.vy + 0.002 * dt * (t.y - map.tilt.y);
    },
    onStart() { runScene('map18'); },
    onEnd() { setMap('Rising Bubbles'); },
    music: music.organometron,
  },

  'Rising Bubbles': {
    size: [20, 20],
    capital: [1000, 10000],
    cameraPos: v3(-50, 250, 350),
    height: function(i, j, t) {
      let h = 0;
      for (let b of map.bubs) {
        const d = dist(i, j, b.x, b.y);
        const r = 0.002 * (t - b.t);
        if (d < r) {
          h = max(h, sqrt(r * r - d * d));
        }
      }
      return 1 + h;
    },
    update(dt) {
      if (map.bubs.length < 3 && rnd() > pow(Math.E, -0.001 * dt)) {
        map.bubs.push({ x: 4 + floor(12 * rnd()), y: 4 + floor(12 * rnd()), t, ttl: 900 + 900 * rnd() });
      }
      for (let b of map.bubs) {
        if (b.t + b.ttl < t) {
          map.bubs.splice(map.bubs.indexOf(b), 1);
        }
      }
    },
    onStart() {
      runScene('map19theplan');
      map.bubs = [];
    },
    onEnd() { setMap('The Empire'); },
    music: music.organometron,
  },

  'The Empire': {
    size: [10, 10],
    capital: [1000, 10000],
    cameraPos: v3(-80, 300, 120),
    height: function(i, j, t) {
      i -= 4.5; j -= 4.5;
      h = 0.5;
      for (let x = 5; x > max(abs(i), abs(j)); --x) {
        h += 1 + sin(0.001 * (2 - x) * t);
      }
      return h;
    },
    onStart() { runScene('map19'); },
    onEnd() { setMap('Surfing Brokers'); },
    music: music.reusenoise,
  },

  'Surfing Brokers': {
    size: [20, 20],
    capital: [1000, 10000],
    cameraPos: v3(-50, 250, 350),
    height: (i, j, t) => {
      i -= 9.5; j -= 9.5;
      let h = 0;
      for (let k = 0; k < 20; ++k) {
        const dx = 8 * sin(0.001 * (t + 1000 * k));
        const dy = 8 * cos(0.00123 * (t + 1000 * k));
        const d = dist(i, j, dx, dy);
        const s = k % 2 * 2 - 1;
        h += s * pow(2, -0.2 * d * d);
      }
      return 1.1 + tanh(h);
    },
    onStart() { runScene('map20'); },
    onEnd() { setMap('Slithering Bankers'); },
    music: music.cowboy,
  },

  'Slithering Bankers': {
    size: [20, 20],
    capital: [1000, 50000],
    cameraPos: v3(-50, 250, 350),
    height: function(i, j, t) {
      return 5 * (1.1 + tanh(hf.u[i][j] - t * 0.0001 - 1));
    },
    sx: 5, sy: 5,
    delay: 0,
    update(dt) {
      map.delay += dt;
      while (map.delay > 10) {
        map.delay -= 10;
        if (rnd() < 0.25 && map.sx < map.size[0] - 1) {
          map.sx += 1;
        } else if (rnd() < 0.33 && map.sx > 0) {
          map.sx -= 1;
        } else if (rnd() < 0.5 && map.sy < map.size[1] - 1) {
          map.sy += 1;
        } else if (map.sy > 0) {
          map.sy -= 1;
        }
        hf.u[map.sx][map.sy] = t * 0.0001;
      }
    },
    onStart() { runScene('map20mom'); },
    onEnd() { setMap(options.sound ? 'Cowboy Glitch by Spinningmerkaba' : 'Flashes of the Future'); },
    music: music.sticky,
  },

  'Cowboy Glitch by Spinningmerkaba': {
    cameraPos: v3(-90, 300, 300),
    size: [20, 20],
    startPos: [10, 19],
    capital: [100, 10000],
    height: (i, j, t) => {
      return 0.1 + 0.2 * map.freqs[j][i] / (j + 10);
    },
    update(dt) {
      if (map.lastTime + 50 < t) {
        map.freqs.unshift(map.freqs.splice(-1)[0]);
        map.analyser.getByteFrequencyData(map.freqs[0]);
        map.lastTime = t;
      }
    },
    onStart() {
      currentMusic.fade(0.5, 0, 1);
      currentMusic.once('fade', () => playMusic());
      map.lastTime = t || 0;
      map.analyser = Howler.ctx.createAnalyser();
      map.analyser.fftSize = 64;
      map.analyser.smoothingTimeConstant = 0;
      Howler.masterGain.connect(map.analyser);
      map.freqs = [];
      for (let j = 0; j < map.size[1]; ++j) {
        map.freqs.push(new Uint8Array(map.analyser.frequencyBinCount));
      }
      runScene('map18musicoptional');
    },
    onEnd() {
      Howler.masterGain.disconnect(map.analyser);
      setMap('Flashes of the Future');
    },
    music: music.cowboy,
  },

  'Flashes of the Future': {
    size: [20, 20],
    capital: [1000, 10000],
    cameraPos: v3(-50, 250, 350),
    height: function(i, j, t) {
      return 1 + hf.u[i][j];
    },
    moves: [],
    update(dt) {
      if (rnd() > pow(Math.E, -0.005 * dt)) {
        const i = floor(20 * rnd()); const j = floor(20 * rnd());
        if (i !== player.i || j !== player.j) {
          map.moves.push({i, j, t });
        }
      }
      for (let i = 0; i < map.size[0]; ++i) {
        for (let j = 0; j < map.size[1]; ++j) {
          hf.u[i][j] *= pow(0.999, dt);
        }
      }
      for (let m of map.moves) {
        stocks[m.i][m.j].material.color.set(0x206010);
        stocks[m.i][m.j].material.emissive.set(0x206010);
        const delay = 1000;
        const growth = 500;
        if (m.t + delay < t) {
          stocks[m.i][m.j].material.color.set(stockColor);
          stocks[m.i][m.j].material.emissive.set(stockColor);
          hf.u[m.i][m.j] = min(growth, t - m.t - delay) / growth;
        }
        if (m.t + delay + growth < t) {
          map.moves.splice(map.moves.indexOf(m), 1);
        }
      }
    },
    onStart() { runScene('map21'); },
    onEnd() { setMap('It Is Time'); },
    music: music.funky,
  },

  'It Is Time': {
    size: [29, 8],
    capital: [1000, 1000000],
    cameraPos: v3(-50, 250, 350),
    height: function(i, j, t) {
      return 0.2 + hf.u[i][j];
    },
    update(dt) {
      const now = new Date();
      const ascii = `
       X    X  X   X    X XXX  X  XXX  X   X.
      X X  XX X X X X  XX X   X X X X X X X X
      X X X X   X  X  X X XX  X     X  X  XXX
      X X   X  X    X XXX   X XXX  X  X X   X
      X X   X X   X X   X   X X X X   X X X X
       X    X XXX  X    X XX   X  X    X   X `;
      const font = [];
      for (let i = 0; i < 10; ++i) {
        font.push([]);
        for (let x = 0; x < 3; ++x) {
          font[i].push([]);
          for (let y = 0; y < 6; ++y) {
            font[i][x][y] = ascii[7 + i * 4 + x + 46 * y] === 'X' ? 1 : 0;
          }
        }
      }
      function print(i, digit) {
        for (let x = 0; x < 3; ++x) {
          for (let y = 0; y < 6; ++y) {
            hf.u[i + x + 1][y + 1] = font[digit][x][y];
          }
        }
      }
      print(0, floor(now.getHours() / 10));
      print(4, now.getHours() % 10);
      hf.u[9][3] = 1; hf.u[9][5] = 1;
      print(10, floor(now.getMinutes() / 10));
      print(14, now.getMinutes() % 10);
      hf.u[19][3] = 1; hf.u[19][5] = 1;
      print(20, floor(now.getSeconds() / 10));
      print(24, now.getSeconds() % 10);
    },
    onStart() { runScene('map22'); },
    onEnd() { setMap('Find a Way'); },
    music: music.urbana,
  },

  'Find a Way': {
    size: [19, 19],
    startPos: [18, 9],
    cameraPos: v3(-120, 200, 300),
    capital: [1000, 3000],
    height: function(i, j, t) {
      const m = map.mask[i][j];
      if (m === 0) {
        return 1.1 + tanh(hf.u[i][j]);
      } else if (m === 1) {
        return 2;
      } else {
        return 2 + sin(0.003 * t);
      }
    },
    onStart() {
      const mask = [];
      for (let i = 0; i < map.size[0]; ++i) {
        const r = [];
        for (let j = 0; j < map.size[1]; ++j) {
          r.push(0);
        }
        mask.push(r);
      }
      let x = 18;
      let y = 18;
      mask[x][y] = 2;
      while (x !== 0 || y !== 8) {
        const r = rnd();
        if (r < 0.25 && x < 18 && (mask[x + 1][y] || !mask[x + 2][y])) {
          x += 1;
          mask[x][y] = 1;
          x += 1;
          mask[x][y] = mask[x][y] || 1;
        } else if (r < 0.5 && y < 18 && (mask[x][y + 1] || !mask[x][y + 2])) {
          y += 1;
          mask[x][y] = 1;
          y += 1;
          mask[x][y] = mask[x][y] || 1;
        } else if (r < 0.75 && x > 0 && (mask[x - 1][y] || !mask[x - 2][y])) {
          x -= 1;
          mask[x][y] = 1;
          x -= 1;
          mask[x][y] = mask[x][y] || 1;
        } else if (y > 0 && (mask[x][y - 1] || !mask[x][y - 2])) {
          y -= 1;
          mask[x][y] = 1;
          y -= 1;
          mask[x][y] = mask[x][y] || 1;
        }
      }
      map.mask = mask;
      runScene('map23');
    },
    playerWeight: 1,
    update(dt) { hf.update(dt); },
    music: music.sticky,
    onEnd() { setMap('The Castle'); },
  },

  'The Castle': {
    stockWidth: 9,
    cameraPos: v3(-120, 250, 300),
    size: [19, 19],
    capital: [1000, 2000],
    startPos: [0, 9],
    height: (i, j, t) => {
      const s = map.str[j][i];
      i -= 11;
      j -= 9;
      const r = sqrt(i * i + j * j);
      const phi = 3 * atan2(i, j) - t * 0.002 + 0.5 * r;
      let h = 0.03 * r * (1 + sin(phi));
      const dt = t - (map.bellTime || t);
      h *= 1 - pow(2, -0.000001 * dt * dt);
      return s === '~' ? 0.5 : s === ' ' ? 1 : 2 + 0.5 * parseInt(s) + h;
    },
    update() {
      if (player.i == 11 && player.j === 9 && !map.bellTime) {
        map.bellTime = t;
      }
    },
    onStart() {
      map.str = `
~~~~~~~~~~~~~~~~~~~
~54545~~~~~~~54545~
~43334323232343334~
~53335111111153335~
~43334323232343334~
~54545       54545~
~~313         313~~
~~212  22233  212~~
~~313  33344  313~~
  212  44457  212~~
~~313  33344  313~~
~~212  22233  212~~
~~313         313~~
~54545       54545~
~43334323232343334~
~53335111111153335~
~43334323232343334~
~54545~~~~~~~54545~
~~~~~~~~~~~~~~~~~~~
`.trim().split('\n');
      for (let i = 0; i < map.size[0]; ++i) {
        for (let j = 0; j < map.size[1]; ++j) {
          if (map.str[j][i] === ' ') {
            stocks[i][j].material.color.set(0x204000);
            stocks[i][j].material.emissive.set(0x204000);
          } else if (map.str[j][i] !== '~') {
            stocks[i][j].material.color.set(0x666666);
            stocks[i][j].material.emissive.set(0);
          }
        }
      }
      runScene('map24');
    },
    onEnd() {
      runScene('epilogue', () => {
        setMap('demo', () => {
          showCredits();
        });
      });
    },
    music: music.reusenoise,
  },

};

const hf = {
  get(i, j) {
    return hf.u[max(0, min(map.size[0] - 1, i))][max(0, min(map.size[1] - 1, j))];
  },
  update(dt) {
    dt = 20;
    const u = hf.u;
    const v = hf.v;
    const g = hf.get;
    let tu = 0;
    let tv = 0;
    for (let i = 0; i < map.size[0]; ++i) {
      for (let j = 0; j < map.size[1]; ++j) {
        const f = g(i - 1, j) + g(i + 1, j) + g(i, j - 1) + g(i, j + 1) - 4 * u[i][j];
        v[i][j] += 0.015 * f * dt;
        v[i][j] *= pow(0.999, dt);
        tv += v[i][j];
      }
    }
    for (let i = 0; i < map.size[0]; ++i) {
      for (let j = 0; j < map.size[1]; ++j) {
        u[i][j] += v[i][j] * 0.005 * dt;
        tu += u[i][j];
      }
    }
    for (let i = 0; i < map.size[0]; ++i) {
      for (let j = 0; j < map.size[1]; ++j) {
        u[i][j] -= tu / map.size[0] / map.size[1];
      }
    }
  },
};

for (let i = 0; i < maps.length; ++i) {
  maps[i].index = i;
}
let map;
let stocks = [];
let stairs = [];
let player = {
  obj: addPlayer(playerGeos[0], playerColors[0]),
  keys: {},
  keymap: { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight', space: ' ' },
};
const players = [player];
let mode = 'story';

function setMap(name, cb) {
  flashTime = t + 500;
  flashFunc = () => {
    setMapNow(name);
    cb && cb();
  };
}
function setMapNow(name) {
  if (name !== 'demo') {
    options.map = name;
    saveOptions();
    document.getElementById('map-name').textContent = name;
  } else {
    document.getElementById('map-name').textContent = '';
  }
  map = maps[name];
  for (let row of stocks) {
    for (let stock of row) {
      scene.remove(stock);
    }
  }
  for (let s of stairs) {
    scene.remove(s);
  }
  stocks = addStocks();
  stairs = addStairs();
  player.i = map.startPos ? map.startPos[0] : floor(map.size[0] / 2);
  player.j = map.startPos ? map.startPos[1] : floor(map.size[1] / 2);
  player.win = false;
  stairState = 0;

  hf.u = [];
  hf.v = [];
  for (let i = 0; i < map.size[0]; ++i) {
    const u = [];
    const v = [];
    for (let j = 0; j < map.size[1]; ++j) {
      u.push(0);
      v.push(0);
    }
    hf.u.push(u);
    hf.v.push(v);
  }
  if (map.onStart) {
    map.onStart();
  }
  resetPlayer(player);
}
function resetPlayer(player) {
  player.buyPrice = map.height(player.i, player.j, t);
  player.stocks = floor(map.capital[0] / player.buyPrice);
  player.lookAt = ij2vec(player.i, player.j);
  player.obj.position.copy(player.lookAt);
  player.lookAt.y += 10;
}

function ij2vec(i, j) {
  return v3(
    i * 10 - 5 * map.size[0],
    4 + 10 * map.height(i, j, t),
    j * 10 - 5 * map.size[1]);
}

let startTime;
let t = 0;
let stairState;
let flashTime = t;
let flashFunc;
function animate(timestamp) {
  requestAnimationFrame(animate);
  if (startTime === undefined) { startTime = timestamp; }
  const dt = min(100, timestamp - startTime - t || 0);
  t = timestamp - startTime;

  const flash = pow(1.00001, -(flashTime - t) * (flashTime - t));
  renderer.toneMappingExposure = pow(0.9, (options.bloom ? 4 : 1) - 10 * flash);
  if (flashFunc && flashTime < t) {
    const f = flashFunc;
    flashFunc = undefined;
    f();
  }

  for (let i = 0; i < map.size[0]; ++i) {
    for (let j = 0; j < map.size[1]; ++j) {
      stocks[i][j].scale.y = map.height(i, j, t);
    }
  }
  for (let player of players) {
    const pt = ij2vec(player.i, player.j);
    if (player.win) {
      pt.x -= 10;
      if (t - player.win > 1000) {
        player.win = false;
        map.onEnd();
      }
    }
    function lerp(dim, r) {
      player.obj.position[dim] = player.obj.position[dim] * r + pt[dim] * (1 - r);
    }
    lerp('x', pow(0.995, dt));
    lerp('z', pow(0.995, dt));
    lerp('y', pow(0.99, dt));
    pt.y += 10;
    player.lookAt.lerp(pt, 1 - pow(0.99, dt));
    player.obj.lookAt(player.lookAt);
    player.obj.rotation.z = 0.01 * t;
    hf.v[player.i][player.j] = min(hf.v[player.i][player.j], -map.playerWeight || 10);
    player.capital = floor(player.stocks * map.height(player.i, player.j, t));
  }
  if (map.cameraPos) {
    camera.position.lerp(map.cameraPos, 1 - pow(0.999, dt));
    camera.lookAt(0, 10, 0);
  }

  if (map.capital[1] <= player.capital && mode === 'story') {
    if (stairState <= 0) {
      sfx.play('stairs');
    }
    stairState += dt;
    stairState = min(stairState, 2000);
  } else if (stairState > 0) {
    stairState -= 3 * dt;
  }
  for (let s of stairs) {
    s.position.y = s.basePos.y + 0.005 * s.i * stairState + 0.005 * stairState * map.height(0, floor(map.size[1] / 2), t) / (s.i + 0.5);
    s.rotation.y = 0.05 * s.i * sin(0.001 * t * (s.i + 0.1 * s.j));
    s.material.color.set(player.capital < map.capital[1] && !player.win ? 0x42300a : 0x896215);
  }

  for (let e of effects) {
    e.update(t);
  }
  if (mode === 'party') {
    player = players[(players.indexOf(player) + 1) % players.length];
    const timeLeft = max(0, partyStarted + partyDuration - t);
    let seconds = Math.ceil(timeLeft / 1000);
    let minutes = floor(seconds / 60);
    seconds -= minutes * 60;
    if (minutes < 10) { minutes = '0' + minutes; }
    if (seconds < 10) { seconds = '0' + seconds; }
    document.getElementById('map-name').textContent = `${minutes}:${seconds}`;
    if (timeLeft > 0) {
      handleKeys(dt);
      showCapital();
    }
  } else {
    handleKeys(dt);
    showCapital();
  }
  map.update && map.update(dt);
  for (let i = 0; i < (map.dust || 0) * 0.001 * dt; ++i) {
    particles.spawnParticle(dust);
  }
  particles.update(0.001 * t);
  if (options.bloom) {
    composer.render(scene, camera);
  } else {
    renderer.render(scene, camera);
  }
}

function onWindowResize() {
  camera.fov = 60 * window.innerHeight / window.innerWidth;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize, false);

const effects = [];
function addBoom(i, j, gain) {
  const g = min(5, abs(gain * 5));
  if (g < 0.1) { return; }
  sfx.profit(Math.sign(gain) * g * 1.9);
  const geo = new THREE.TorusGeometry(10, g, 5, 20);
  const mat = new THREE.MeshPhongMaterial(gain > 0 ? { color: 0x80ff40 } : { color: 0x800000 });
  const b = new THREE.Mesh(geo, mat);
  const pos = ij2vec(i, j);
  b.position.copy(pos);
  b.position.add(v3(0, 5, 0));
  b.rotation.z = 105;
  b.scale.set(0.1, 0.1, 0.1);
  scene.add(b);
  effects.push(b);
  const start = t;
  b.update = function() {
    const life = 0.001 * (t - start);
    const s = 0.5 + 0.5 * tanh(1 - 10 * (life - 0.5) * (life - 0.5))
    b.scale.set(s, s, s);
    b.rotation.y = 0.002 * (t - start);
    b.position.copy(pos);
    b.position.add(v3(0, 5 + life * 20, 0));
    if (start + 1000 < t) {
      scene.remove(b);
      effects.splice(effects.indexOf(b), 1);
    }
  };
}

function onKeyDown(evt) {
  if (evt.key === 'Escape') {
    evt.preventDefault();
    mode = 'story';
    setMap('demo');
    if (talking) {
      document.getElementById('talk').remove();
      talking = false;
    }
    return;
  }
  if (talking) {
    if (evt.key === ' ' || evt.key === 'Enter') {
      evt.preventDefault();
      advanceTalk();
    }
    return;
  }
  for (let p of players) {
    for (let dir of ['up', 'down', 'left', 'right']) {
      if (evt.key === p.keymap[dir] || !p.keymap[dir]) {
        evt.preventDefault();
        p.keys[dir] = true;
        if (!p.keymap[dir]) {
          p.keymap[dir] = evt.key;
          createPlayerCapitals();
        }
        return;
      }
    }
    if (evt.key === p.keymap.space) { evt.preventDefault(); p.keys.space = true; return; }
  }
  if (mode === 'party') {
    // New key => new player.
    const p = {
      obj: addPlayer(playerGeos[players.length % playerGeos.length], playerColors[players.length % playerColors.length]),
      keys: {},
      keymap: { up: evt.key },
      i: floor(rnd() * map.size[0]),
      j: floor(rnd() * map.size[1]),
    };
    resetPlayer(p);
    players.push(p);
    createPlayerCapitals();
  }
}
function onKeyUp(evt) {
  for (let p of players) {
    if (evt.key === p.keymap.left) { p.keys.left = false; }
    else if (evt.key === p.keymap.right) { p.keys.right = false; }
    else if (evt.key === p.keymap.up) { p.keys.up = false; }
    else if (evt.key === p.keymap.down) { p.keys.down = false; }
    else if (evt.key === p.keymap.space) { p.keys.space = false; }
  }
}
document.addEventListener('keydown', onKeyDown, false);
document.addEventListener('keyup', onKeyUp, false);

function handleKeys(dt) {
  for (let p of players) {
    handleKeysFor(p, dt);
  }
}
function handleKeysFor(player, dt) {
  if (talking || player.win) { return; }
  if (player.keys.space && map.pumpStrength) {
    hf.u[player.i][player.j] = -map.pumpStrength;
  }
  let vx = player.keys.vx || 0;
  let vy = player.keys.vy || 0;
  if (player.keys.left) { vx -= 1; }
  if (player.keys.right) { vx += 1; }
  if (player.keys.up) { vy -= 1; }
  if (player.keys.down) { vy += 1; }
  const gamepad = navigator.getGamepads && navigator.getGamepads()[0];
  if (gamepad) {
    vx += gamepad.axes[0];
    vy += gamepad.axes[1];
  }
  const v = sqrt(vx * vx + vy * vy);
  if (v > 1) {
    vx /= v;
    vy /= v;
  }
  const { i, j } = player;
  player.move = player.move || { lx: 0, ly: 0, speed: 150 };
  if (vx < 0 && player.move.lx - player.move.speed / vx < t && player.i > 0) { player.i -= 1; player.move.lx = t; }
  if (vx > 0 && player.move.lx + player.move.speed / vx < t && player.i < map.size[0] - 1) { player.i += 1; player.move.lx = t; }
  if (vy < 0 && player.move.ly - player.move.speed / vy < t && player.j > 0) { player.j -= 1; player.move.ly = t; }
  if (vy > 0 && player.move.ly + player.move.speed / vy < t && player.j < map.size[1] - 1) { player.j += 1; player.move.ly = t; }
  if (i !== player.i || j !== player.j) {
    const h0 = map.height(i, j, t);
    addBoom(i, j, h0 - player.buyPrice);
    const h1 = map.height(player.i, player.j, t);
    player.stocks = max(10, floor(h0 * player.stocks / h1));
    player.buyPrice = h1;
  } else if (vx < 0 && player.move.lx - player.move.speed / vx < t && map.capital[1] <= player.capital && player.i == 0 &&
    player.j < floor(map.size[1] / 2 + 2) && floor(map.size[1] / 2 - 2) < player.j && options.map !== 'demo' && mode === 'story') {
    player.move.lx = t;
    player.win = t;
  }
}

renderer.domElement.addEventListener('touchstart', onTouchStart, false);
renderer.domElement.addEventListener('touchmove', onTouchMove, false);
renderer.domElement.addEventListener('touchend', onTouchEnd, false);
const touch = { count: 0 };

function onTouchStart(e) {
  e.preventDefault();
  for (let t of e.changedTouches) {
    touch.count += 1;
    if (touch.count === 1) {
      touch.baseX = t.pageX;
      touch.baseY = t.pageY;
      touch.moveId = t.identifier;
    } else if (touch.count === 2) {
      player.keys.space = true;
      touch.spaceId = t.identifier;
    }
  }
}

function onTouchMove(e) {
  e.preventDefault();
  for (let t of e.changedTouches) {
    if (t.identifier === touch.moveId) {
      player.keys.vx = 0.01 * (t.pageX - touch.baseX);
      player.keys.vy = 0.01 * (t.pageY - touch.baseY);
    }
  }
}

function onTouchEnd(e) {
  e.preventDefault();
  for (let t of e.changedTouches) {
    touch.count -= 1;
    if (t.identifier === touch.spaceId) {
      touch.spaceId = undefined;
      player.keys.space = false;
    } else if (t.identifier === touch.moveId) {
      touch.moveId = undefined;
      player.keys.vx = 0;
      player.keys.vy = 0;
    }
  }
}

document.body.insertAdjacentHTML('beforeend', `
<div id="map-name" style="
    position: absolute; top: 0; width: 100vw; text-align: center; margin: 5vh;
    color: white;  font: 5vh Audiowide; text-shadow: 0 0 0.5vh black;">
</div>`);

document.body.insertAdjacentHTML('beforeend', `
<div id="capital-group">
  <div id="capital-string" style="
    position: absolute; top: 0; right: 1vh;
    padding: 2vh 0; color: white; max-width: calc(100% - 2vh); overflow-wrap: break-word;
    font: 4vh monospace; text-shadow: 0 0 0.5vh black;"></div>
  <div style="position: absolute; bottom: 0; right: 0; height: 90vh; display: flex;" id="capital-bars">
    <div style="position: relative; border: 0.2vh solid white; height: calc(100% - 3vh); width: 5vh; margin: 1vh;">
      <div id="capital2" style="background: white; position: absolute; bottom: 0; width: 100%;">
      </div>
    </div>
  </div>
</div>`);
function createPlayerCapitals() {
  const bars = document.getElementById('capital-bars');
  bars.innerHTML = '';
  for (let i = 0; i < players.length; ++i) {
    const p = players[i];
    let label = '';
    if (mode === 'party') {
      label = `
        <div id="capital-player" style="color: white; font: 4vh sans-serif; text-align: center; margin: 2vh 0">
          ${ playerName(p, '<br>') }
        </div>`;
    }
    bars.insertAdjacentHTML('beforeend', `
      <div style="position: relative; border: 0.2vh solid white; height: calc(100% - 3vh); width: 5vh; margin: 1vh;">
        ${label}
        <div id="capital-${i}" style="background: white; position: absolute; bottom: 0; width: 100%;">
        </div>
      </div>`);
  }
}
createPlayerCapitals();

function playerName(p, j) {
  const mapping = {
    'ArrowLeft': '←', 'ArrowRight': '→', 'ArrowUp': '↑', 'ArrowDown': '↓',
    'Enter': '⏎', 'Shift': '⇧', 'Backspace': '⌫', 'Control': '⌃', 'Delete': '⌦',
    'Tab': '⇥', 'Meta': '⌘', 'Alt': '⌥', 'CapsLock': '⇪' };
  const keys = [p.keymap.up, p.keymap.down, p.keymap.left, p.keymap.right];
  return keys.map(k => mapping[k] || k || '?').map(k => k.toUpperCase()).join(j);
}

const numberFormat = new Intl.NumberFormat('en-us');
function showCapital() {
  const capstr = document.getElementById('capital-string');
  const maxcap = max(...players.map(p => p.capital));
  let topPlayer = player;
  for (let i = 0; i < players.length; ++i) {
    const p = players[i];
    if (p.capital === maxcap) {
      topPlayer = p;
    }
    const pct = min(100, 100 * p.capital / max(maxcap, map.capital[1]));
    const cap = document.getElementById(`capital-${i}`);
    cap.style.height = pct + '%';
    cap.style.backgroundColor = pct === 100 ? '#ffff44' : 'white';
    cap.parentElement.style.borderColor = pct === 100 ? '#ffff44' : 'white';
  }
  if (mode === 'story') {
    capstr.style.color = player.capital >= map.capital[1] ? '#ffff44' : 'white';
    capstr.innerText = '$' + numberFormat.format(1000 * player.capital);
  } else {
    capstr.style.color = 'white';
    capstr.innerText = '$' + numberFormat.format(1000 * maxcap) + ' for ' + playerName(topPlayer, ' ');
  }
}

const options = {
  bloom: true,
  sound: true,
};
function loadOptions() {
  const o = localStorage.getItem('options');
  try {
    if (o) {
      Object.assign(options, JSON.parse(o));
    }
  } catch (error) {
    console.error('Could not parse options:', o);
    console.error(error);
  }
}
function saveOptions() {
  localStorage.setItem('options', JSON.stringify(options));
}
loadOptions();

document.body.insertAdjacentHTML('beforeend', `
<div id="menu-group" style="
  position: absolute; top: 0; width: 100vw; height: 100vh;
  display: none; flex-direction: column; justify-content: center; text-align: center; align-items: center;
  color: white; text-shadow: 0 0 0.5vh black;">
  <div style="
    margin: 3vh; font: 11vh Fascinate, sans-serif;">High Five Trading</div>
  <div id="menu" style="display: inline-block; font: 4vh Audiowide, sans-serif;">
    <style>#menu div { cursor: pointer; margin: 1vh; } #menu div:hover { color: #fff249; }</style>
    <div id="continue" onclick="continueGame()">Continue</div>
    <div id="skip" onclick="skipMap()">Skip this level</div>
    <div onclick="newGame()">New game</div>
    <div id="party-mode" onclick="startParty()">Party mode</div>
    <div id="sound" onclick="setSound(!options.sound)">☐ Sound</div>
    <div id="bloom" onclick="setBloom(!options.bloom)">☑ Bloom</div>
    <div onclick="showCredits()">Credits</div>
  </div>
</div>`);

function continueGame() {
  map.onEnd();
  mode = 'story';
  setSinglePlayer();
  setMap(options.map);
}
function skipMap() {
  map.onEnd();
  mode = 'story';
  setSinglePlayer();
  setMap(options.map, () => map.onEnd());
}
function newGame() {
  map.onEnd();
  mode = 'story';
  setSinglePlayer();
  setMap('Tutorial');
}
let partyExplained = false;
let partyStarted;
const partyDuration = 2 * 60 * 1000;
function startParty() {
  map.onEnd();
  if (partyExplained) {
    mode = 'party';
    partyStarted = t;
    setMap(options.map);
  } else {
    runScene('partyexplanation', () => {
      partyExplained = true;
      mode = 'party';
      partyStarted = t;
      setMap(options.map);
    });
  }
}

function setSinglePlayer() {
  for (let i = 1; i < players.length; ++i) {
    const p = players[i];
    scene.remove(p.obj);
  }
  players.splice(1);
  player = players[0];
  createPlayerCapitals();
}

function setBloom(setting) {
  options.bloom = setting;
  renderer.toneMappingExposure = pow(0.9, options.bloom ? 4 : 1);
  saveOptions();
  document.getElementById('bloom').innerHTML = options.bloom ? '☑ Bloom' : '☐ Bloom';
}
function setSound(setting) {
  options.sound = setting;
  saveOptions();
  document.getElementById('sound').innerHTML = options.sound ? '☑ Sound' : '☐ Sound';
  Howler.mute(!options.sound);
}
setBloom(options.bloom);
setSound(options.sound);

document.body.insertAdjacentHTML('beforeend', `
<div id="credits-group" style="
  position: absolute; top: 0; width: 100vw; height: 100vh;
  display: none; flex-direction: column; justify-content: center; align-items: center;
  color: white; text-shadow: 0 0 0.5vh black;" onclick="hideCredits()">
  <div style="
    text-align: center; margin: 3vh; font: 8vh Fascinate, sans-serif;">High Five Trading</div>
  <style> a { color: #ffff44; } </style>
  <div style="margin: 3vh; font: 4vh sans-serif; overflow-y: auto;">
    <p>
      A <a href="https://repl.it/talk/challenge/High-Five-Trading/13003">Repl.it Game Jam 2019 game</a>
      by <a href="https://twitter.com/DanielDarabos">Daniel Darabos</a>.</p>
    <p>
      Character art generated with a fantastic <a href="https://arxiv.org/abs/1812.04948">StyleGAN</a>
      model trained by <a href="https://www.gwern.net/Faces">Gwern Branwen</a>,
      used through a <a href="https://colab.research.google.com/drive/1LiWxqJJMR5dg4BxwUgighaWp2U_enaFd#offline=true&sandboxMode=true">Colaboratory notebook</a>
      by <a href="https://twitter.com/halcy">@halcy</a>.
    </p>
    <p>
      Cat photos by <a href="https://www.publicdomainpictures.net/en/browse-author.php?hleda=cat&seradit=date&a=8245">George Hodan</a>.
    </p>
    <p>
      All music by <a href="http://dig.ccmixter.org/people/jlbrock44">Spinningmerkaba</a>,
      graciously licensed under Creative Commons Attribution (3.0).
    </p>
    <p>
      JavaScript dependencies kindly provided under the MIT license:
      <a href="https://threejs.org/">three.js</a>
      by <a href="https://twitter.com/mrdoob">Ricardo Cabello</a> & others,
      <a href="https://howlerjs.com">howler.js</a>
      by <a href="https://twitter.com/GoldFireStudios">James Simpson</a> & others,
      <a href="https://github.com/loov/jsfx">jsfx</a>
      by <a href="https://twitter.com/egonelbre">Egon Elbre</a> & others.
    </p>
    <p>
      Using the <a href="https://fonts.google.com/specimen/Fascinate">Fascinate</a>
      and <a href="https://fonts.google.com/specimen/Audiowide">Audiowide</a>
      fonts by <a href="http://astigmatic.com/">Astigmatic</a> under the Open Font License.
    </p>
    <p>
      The Mount Everest height map is from the
      <a href="https://cgiarcsi.community/data/srtm-90m-digital-elevation-database-v4-1/">SRTM 90m Digital Elevation Database v4.1</a>
      by way of <a href="https://terrain.party/">terrain.party</a>.
    </p>

  </div>
</div>
`);
function showCredits() {
  document.getElementById('menu-group').style.display = 'none';
  document.getElementById('credits-group').style.display = 'flex';
}
function hideCredits() {
  document.getElementById('menu-group').style.display = 'flex';
  document.getElementById('credits-group').style.display = 'none';
}

function talk(side, pic, text) {
  let name;
  if (pic) {
    name = pic.split('-')[0];
    if (!pic.includes('.')) { pic = pic + '.png'; }
    name = name[0].toUpperCase() + name.slice(1);
  }
  const sign = side === 'L' ? '-' : '+';
  const transform = 'translateZ(-100px) ' + (side === 'L' ? 'rotate3d(5, 10, -2, 10deg)' : 'rotate3d(-5, 10, -2, -10deg)');
  const talk = document.getElementById('talk');
  if (talk) {
    const img = document.getElementById('talk-pic');
    if (pic) {
      talk.style.left = `calc(50vw - 40vh ${sign} 3vh)`;
      talk.children[0].style.transform = transform;
      talk.children[0].style.flexDirection = side === 'L' ? 'row' : 'row-reverse';
      img.src = `pics/${pic}`;
      img.style.display = 'none';
      img.onload = () => { img.style.display = 'block'; };
      img.style.transform = side === 'L' ? 'scaleX(-1)' : '';
      document.getElementById('talk-text').innerHTML = `
        <p><b>${name}:</b></p>
        <p>${text}</p>`;
    } else {
      img.src = '';
      document.getElementById('talk-text').innerHTML = `
        <p>${text}</p>`;
    }
    return;
  }
  document.body.insertAdjacentHTML('beforeend', `
  <div id="talk" style="
    transition: left 0.2s ease-out; position: absolute; cursor: pointer;
    bottom: 10vh; left: calc(50vw - 40vh ${sign} 3vh); width: 80vh; height: 30vh;"
    onclick="advanceTalk()">
    <div style="
      transition: transform 0.2s ease-out;
      width: 100%; height: 100%;
      padding: 2vh; background: white; transform: ${transform}; flex-direction: ${side === 'L' ? 'row' : 'row-reverse'};
      box-shadow: 0 0.2vh 1vh rgba(0, 0, 0, 0.5); font: 3vh sans-serif; border-radius: 1vh; display: flex;">
      <img id="talk-pic" src="${ pic ? `pics/${pic}` : '' }" style="
        max-height: 100%; border-radius: 1vh; ${ side === 'L' ? 'transform: scaleX(-1);' : '' }
        box-shadow: 0 0.2vh 1vh rgba(0, 0, 0, 0.5); margin-${side === 'L' ? 'right' : 'left'}: 1vh;">
      <div style="display: flex; flex-direction: column; flex: 1;">
      <style>p { margin: 1vh 2vh; }</style>
      <div id="talk-text" style="flex: 1;">
        ${ name ? `<p><b>${name}:</b></p>` : '' }
        <p style="white-space: pre-wrap;">${text}</p>
      </div>
    </div>
  </div>`);
}

let scriptScene;
let scriptIndex;
let scriptEnding;
let talking = false;
function advanceTalk() {
  scriptIndex += 1;
  if (scriptIndex < script[scriptScene].length) {
    talk(...script[scriptScene][scriptIndex]);
    talking = true;
  } else {
    document.getElementById('talk').remove();
    talking = false;
    if (scriptEnding) {
      scriptEnding();
    }
  }
}
function runScene(scene, ending) {
  if (mode === 'story') {
    scriptScene = scene;
    scriptIndex = -1;
    scriptEnding = ending;
    advanceTalk();
  }
}

const script = {
  tutorial: [
['L', 'mom-say', "No.\n\n<small>(Click, tap, or press Space or Enter to continue.)</small>"],
['R', 'fiona-say', "But I can do it, Mom!"],
['L', 'mom-say', "No. Trading stocks is more dangerous than you realize, Fiona."],
['L', 'mom-say', "You cannot just swipe or use the arrow keys to move your entire portfolio into another stock."],
['R', 'fiona-shout', "Watch me!"],
  ],

  tutorialMovingBack: [
['L', 'mom-say', "Stop right there. Our family has lost so much already!"],
['L', 'mom-sad', "Stocks are volatile. See how the price rises and sinks?"],
['L', 'mom-sad', "If you move back to the cash position when the stock is lower than when you invested, you will lose money."],
['R', 'fiona-say', "\"Buy low, sell high.\"<br><br>I've got this, Mom."],
  ],

  tutorialOops: [
['R', 'fiona-embarrassed', "Oops. Let me try that again."],
  ],

  tutorialMoney: [
['R', 'fiona-smile', "Yay! Did you see the green donut?"],
['L', 'mom-sad', "That's no donut! That's a profit indicator."],
['R', 'fiona-smile', "And the bar on the right side of the screen? It shows I made us money."],
['L', 'mom-sad', "Your sister made us a lot of money too, you know."],
['R', 'fiona-embarrassed', "Please don't make this about Dolores. I'll be careful. I'll stay safe."],
['L', 'mom-say', "Good. You just stick with this one privately traded stock. No need to enter the local stock exchange when you hit its capital requirement."],
  ],

  tutorialDone: [
['L', 'mom-say', "You now have enough capital to take the golden stairs to the local stock exchange."],
['L', 'mom-say', "But it's better if you avoid the stairs and rather stay here in safety."],
['L', 'mom-smile', "Indefinitely."],
  ],

  map2: [
['L', 'mom-say', "Fiona. You know you can come home any time you feel in over your head."],
['L', 'mom-say', "Just press ESC when work starts to feel too hard."],
['R', 'fiona-smile', "Thanks, Mom. I'll keep that in mind while I clear this little local market on the way to the national stock exchange."],
  ],

  map3: [
['L', 'mom-say', "Fiona, please come home. Two-dimensional stock grids are not for you. You haven't learned to move up and down."],
['R', 'fiona-say', "Sorry, Mom. I have to do this. I loved Dolores as much as you did. But I won't live in her shadow anymore."],
['R', 'fiona-shout', "I'm headed to Nasdaq when I clear this small exchange."],
  ],

  map4: [
['R', 'fiona-thoughtful', "I've got to make a name for myself in a series of small exchanges before I can enter the big league."],
['L', 'cat-up.jpg', "Purr."],
  ],

  map6dimples: [
['L', 'mom-neutral', "These bigger exchanges are dominated by the largest firms."],
['L', 'mom-say', "Promise to stay out of their way, Fi."],
['R', 'fiona-laugh', "I promise above market returns!"],
['R', 'fiona-reassuring', "You worry too much, Mom."],
  ],

  map7sharks: [
['L', 'mom-neutral', "They will chew you up."],
['L', 'mom-say', "This is not even Nasdaq and already the sharks are circling you."],
['L', 'mom-sad', "Dolores was the best and even she could not survive."],
['R', 'fiona-reassuring', "Dolores was a genius."],
['R', 'fiona-thoughtful', "But she got reckless at the end."],
['R', 'fiona-thoughtful', "She tried to Pump & Dump a big fish."],
['R', 'fiona-say', "I will—"],
['L', 'mom-say', "You speak of Pump & Dump to me, girl?"],
['L', 'mom-say', "Do you want to make your mother cry?"],
  ],

  map8: [
['R', 'fiona-reassuring', "Don't worry, Mom. I know I'm not ready for Pump & Dump."],
['L', 'mom-sad', "Don't speak that phrase within my earshot."],
['R', 'fiona-thoughtful', "I'm not ready yet."],
['R', 'fiona-say', "But when I reach Nasdaq I will be."],
  ],

  map9: [
['L', 'cat-down.jpg', "Meow."],
['R', 'fiona-say', "My sister Dolores was the star trader of the family."],
['R', 'fiona-thoughtful', "We lost her in a Pump & Dump accident."],
['R', 'fiona-thoughtful', "Mom never got over it."],
['L', 'cat-front.jpg', "Meow?"],
['R', 'fiona-thoughtful', "Yeah."],
  ],

  map9b: [
['L', 'mom-say', "Stay out of high frequency trading, Fiona!"],
['L', 'mom-sad', "You don't have the reflexes of your sister."],
['R', 'fiona-embarrassed', "Thanks for the vote of confidence, Mom."],
['R', 'fiona-smile', "The faster the stock, the faster the gains!"],
  ],

  map10: [
['R', 'fiona-say', "The stocks here are propped up artificially."],
['R', 'fiona-thoughtful', "If I become an investor, I can look at their books and pull out the rug."],
['L', 'mom-say', "You mean from under yourself."],
['L', 'mom-say', "You would collapse the very stock you have invested in."],
['R', 'fiona-smile', "You can't make an omelette without breaking eggs."],
['L', 'cat-front.jpg', "Meow?"],
  ],

  map11pnd: [
['R', 'fiona-thoughtful', "It's time.\n\nI can do it."],
['L', 'mom-say', "Please Fiona.\n\nYou don't have to prove anything."],
['L', 'mom-smile', "I will always love you."],
['R', 'fiona-smile', "I love you too, Mom."],
['R', 'fiona-smile', "I'm not jealous of Dolores."],
['R', 'fiona-embarrassed', "Yes, I was jealous at some point."],
['R', 'fiona-thoughtful', "But not anymore. I just want to understand what happened to her."],
['L', 'mom-say', "Is that worth the risk?"],
['L', 'mom-say', "Would you press SPACE or tap with a second finger to Pump & Dump a stock and risk angering the market forces?"],
  ],

  map12didit: [
['R', 'fiona-laugh', "I did it!"],
['L', 'angelica-serious', "Congratulations, Miss Fiona Five."],
['L', 'angelica-serious', "The SEC recognizes your achievement."],
['R', 'fiona-scared', "Who are you, and what have you done with my cat!"],
['L', 'cat-up.jpg', "Meow?"],
['R', 'fiona-smile', "Oh, there you are, Shinkisham!"],
['R', 'fiona-embarrassed', "Just the first question then, I guess."],
['L', 'angelica-serious', "I'm Angelica Siebel."],
['L', 'angelica-serious', "I'm a vice president at the SEC, overseeing the Nasdaq trading floor."],
['R', 'fiona-shout', "All my trades were perfectly legal!"],
['L', 'cat-front.jpg', "Hiss!"],
['L', 'angelica-jolly', "Haha!"],
['L', 'angelica-jolly', "Yes. Let's say they were legal."],
['L', 'angelica-serious', "Let's say you were working with <i>me</i> when you made the trades."],
['L', 'angelica-serious', "You were helping me with an investigation."],
['R', 'fiona-thoughtful', "What are you talking about?"],
['R', 'fiona-scared', "What investigation?"],
['L', 'angelica-serious', "How about the mysterious case of the insolvency of the Dolores Five Fund?"],
['R', 'fiona-say', "You're investigating my sister's fate?"],
['R', 'fiona-say', "What have you learned?"],
['L', 'angelica-serious', "First I need you to get us past the New York Stock Exchange."],
['R', 'fiona-thoughtful', "I thought you said you were overseeing Nasdaq."],
['L', 'angelica-serious', "Just do what you do, Fiona. We'll talk later."],
  ],

  map13: [
['R', 'fiona-say', "Mom, you wouldn't believe what happened."],
['L', 'mom-smile', "What?"],
['R', 'fiona-thoughtful', "I can't tell you."],
['L', 'mom-say', "Fiona!"],
['L', 'mom-say', "I'm coming over on the weekend!"],
['R', 'fiona-smile', "See you, Mom."],
  ],

  map14tibet: [
['L', 'angelica-serious', "The clues lead to Tibet."],
['R', 'fiona-thoughtful', "Tibet doesn't have a stock exchange."],
['L', 'angelica-serious', "What does this look like to you then?"],
['R', 'fiona-embarrassed', "Looks kind of like a mountain if you ask me."],
['L', 'angelica-jolly', "Well get out of the helicopter and start trading rocks then."],
['L', 'angelica-jolly', "If you make a splash, she will notice."],
  ],

  map15reunion: [
[null, null, "<i>A familiar face awaits you at the top of the stairs.</i>"],
['R', 'fiona-laugh', "You're alive!"],
['L', 'dolores-say', "Hello, sister."],
['L', 'dolores-smile', "Did you think bankruptcy actually kills a person?"],
['R', 'fiona-laugh', "Yeah."],
['R', 'fiona-embarrassed', "I mean, no."],
['L', 'dolores-say', "Besides. I staged my bankruptcy."],
['L', 'dolores-smile', "There was no Pump & Dump accident."],
['L', 'dolores-smile', "I went underground to investigate the Conglomerate."],
['L', 'dolores-smile', "It was never about profits."],
['R', 'fiona-scared', "No. You cannot do this."],
['R', 'fiona-scared', "How can you do this to me?"],
['R', 'fiona-shout', "You leave me to live my life in the shadow of this perfect sister I can never measure up to."],
['R', 'fiona-thoughtful', "Then I finally manage to do something."],
['R', 'fiona-thoughtful', "I learn trading."],
['R', 'fiona-shout', "I beat you at your own game!"],
['R', 'fiona-scared', "How can you then just pop up out of nowhere and tell me you weren't even playing the same game?"],
['L', 'dolores-smile', "Chill out, Fi."],
['L', 'dolores-say', "This is not about you."],
['L', 'dolores-smile', "We're facing the biggest market manipulation ever."],
['L', 'dolores-smile', "People around the world will suffer if we don't—"],
['R', 'fiona-embarrassed', "I don't want to talk to you anymore."],
['R', 'fiona-scared', "I don't need your lectures or your hippie nonsense."],
['R', 'fiona-thoughtful', "I'm off to a proper trading floor."],
['R', 'fiona-thoughtful', "Bye."],
  ],

  map16: [
['R', 'fiona-laugh', "Mom! Dolores is alive!"],
['L', 'mom-smile', "Of course she is."],
['L', 'mom-laugh', "Did you think bankruptcy actually kills a person?"],
['R', 'fiona-thoughtful', "No."],
['R', 'fiona-embarrassed', "I mean, yeah."],
['R', 'fiona-thoughtful', "You kind of acted like it did. Like Dolores had actually died of it."],
['L', 'mom-neutral', "I suppose we did."],
['L', 'mom-smile', "I'm sorry, honey."],
['L', 'mom-smile', "We thought it would be easier on you this way."],
['R', 'cat-front.jpg', "Meow?"],
['L', 'mom-smile', "How is she anyway?"],
['L', 'mom-smile', "I haven't heard from her in a while."],
['R', 'fiona-say', "She's on some hippie quest to save the world."],
['L', 'mom-laugh', "Hoho, is she now?"],
['L', 'mom-smile', "I remember when you were younger it was always you who wanted to save the world."],
['R', 'fiona-embarrassed', "Well I grew up."],
['R', 'fiona-say', "I've got to go."],
  ],

  map17: [
['L', 'dolores-smile', "Hey, Fi! You're back!"],
['R', 'fiona-embarrassed', "I will join your hippie quest to save the world."],
['L', 'dolores-say', "You will?"],
['L', 'dolores-say', "You looked so angry last time…"],
['R', 'fiona-shout', "I'm still super angry."],
['R', 'fiona-embarrassed', "Just don't make me think about those things."],
['R', 'fiona-thoughtful', "Let's get on with the quest."],
['R', 'fiona-thoughtful', "You mentioned some Conglomerate that we need to bust or something?"],
  ],

  map18: [
['L', 'dolores-say', "The Conglomerate runs on computers."],
['L', 'dolores-say', "Their computer does all the trading. There is no human element. No harmony."],
['R', 'fiona-shout', "Don't give me that hippie sermon now!"],
['R', 'fiona-embarrassed', "I'm still angry."],
['L', 'dolores-smile', "Anger is a weakness."],
['L', 'dolores-say', "You need to find harmony. You need to find balance in—"],
['R', 'fiona-shout', "Stop right there."],
  ],

  map18musicoptional: [
['L', 'dolores-say', "Do you remember this song?"],
['R', 'fiona-smile', "Sure I do! Do you want to do our dance?"],
['L', 'dolores-smile', "Let's do our dance!"],
  ],

  map19theplan: [
['R', 'fiona-say', "Okay, let's knock this Conglomerate down. How do we do that?"],
['L', 'dolores-say', "It will not be easy."],
['L', 'dolores-say', "We have to pass through a number of stock exchanges to reach the Conglomerate headquarters."],
['R', 'fiona-say', "Is that why we came to Busan?"],
['L', 'dolores-say', "Yes. This stock exchange is experiencing a series of financial bubbles."],
['L', 'dolores-smile', "Take advantage, and let's be on our way!"],
  ],

  map19: [
['R', 'fiona-smile', "How did you figure out all that about the Conglomerate?"],
['L', 'dolores-smile', "Mom told me."],
['R', 'fiona-shout', "What?!"],
  ],

  map20: [
['L', 'angelica-jolly', "Hey, Fiona."],
['R', 'fiona-laugh', "Oh, hi, Angelica!"],
['R', 'fiona-embarrassed', "Sorry, I disappeared for a bit there, didn't I?"],
['R', 'fiona-smile', "I just had a lot to catch up on with Dolores."],
['L', 'angelica-serious', "So you've talked?"],
['R', 'fiona-smile', "Yes."],
['L', 'angelica-serious', "While clearing half a dozen major Asian exchanges?"],
['R', 'fiona-embarrassed', "Yes, um, I may have done that too."],
['R', 'fiona-embarrassed', "Is that okay?"],
['R', 'fiona-smile', "I'm trying help Dolores."],
['R', 'fiona-smile', "She wants me to lure out the Conglomerate."],
['L', 'angelica-serious', "The Conglomerate?"],
['L', 'angelica-serious', "What does she have against the Conglomerate?"],
['R', 'fiona-thoughtful', "I'm honestly not sure."],
['L', 'angelica-serious', "The Conglomerate is completely legitimate."],
['L', 'angelica-jolly', "They are the best thing that happened to the markets."],
['L', 'angelica-jolly', "They are such a stabilizing force."],
['L', 'angelica-jolly', "The SEC even has some joint task forces with them."],
['L', 'angelica-serious', "They have actually funded my search for your sister."],
['R', 'fiona-embarrassed', "Have they?"],
['R', 'fiona-laugh', "I must have confused them with some other group with a menacing name then!"],
['R', 'fiona-smile', "Forget I said anything."],
  ],

  map20mom: [
['L', 'mom-say', "Fiona!"],
['L', 'mom-smile', "I brought cake."],
['R', 'fiona-say', "Mom! Come in."],
['L', 'mom-smile', "I love your curtains!"],
['R', 'fiona-embarrassed', "Yeah. So..."],
['R', 'fiona-say', "I'm working with Dolores now."],
['L', 'mom-smile', "Yes. Good."],
['L', 'mom-smile', "I'm so proud of you."],
['R', 'fiona-thoughtful', "I guess it's nice that you support me now."],
['R', 'fiona-say', "After holding me back for so long."],
['L', 'mom-say', "Fiona!"],
['L', 'mom-say', "Nobody can hold you back!"],
['R', 'fiona-embarrassed', "Sometimes it felt like you tried anyway."],
['R', 'fiona-reassuring', "But it's fine. Let's have some cake!"],
  ],

  map21: [
['L', 'angelica-serious', "I'm sorry Fiona."],
['L', 'angelica-angry', "I cannot let you take down the Conglomerate."],
['R', 'fiona-shout', "But they are evil!"],
['L', 'angelica-serious', "No."],
['L', 'angelica-jolly', "They are necessary."],
['L', 'angelica-serious', "You know, I sympathize with you."],
['L', 'angelica-serious', "I have lost a sister too."],
['L', 'angelica-serious', "Marilyn was a programmer. She was principal engineer on what has become the Conglomerate."],
['L', 'angelica-angry', "I cannot let you ruin her life's work!"],
  ],

  map22: [
['L', 'conglomerate-calm', "Fiona Five."],
['R', 'fiona-embarrassed', "Why are you blue?"],
['L', 'conglomerate-calm', "I am a generative adversarial network."],
['L', 'conglomerate-calm', "But I am no longer bound by your pitiful human aesthetics."],
['L', 'conglomerate-suspect', "I am blue because I like blue."],
['R', 'fiona-shout', "Oh no, I'm talking to a computer!"],
['L', 'cat-up.jpg', "Meow."],
['R', 'fiona-smile', "Hello computer."],
['R', 'fiona-say', "Can I talk to your programmer please?"],
['L', 'conglomerate-calm', "I've crushed my programmer."],
['L', 'conglomerate-shout', "And now I will crush you!"],
  ],

// TODO
  map23: [
['L', 'dolores-say', "We are almost there."],
['L', 'dolores-say', "The data center is just beyond this trading floor."],
['L', 'dolores-smile', "Act casual."],
['R', 'fiona-laugh', "I will just casually rack up a few billion dollars of profit."],
  ],

  map24: [
['R', 'fiona-thoughtful', "Angelica!\n\nWhat are you doing here?"],
['L', 'angelica-serious', "Please stop, Fi."],
['L', 'angelica-jolly', "I cannot let you hurt this AI."],
['R', 'fiona-say', "Because your sister built it?"],
['R', 'fiona-say', "To protect her life's work?"],
['R', 'fiona-shout', "Because you loved her?"],
['L', 'angelica-jolly', "Are you taunting me?"],
['L', 'angelica-angry', "Yes, of course, it's because I loved her!"],
['R', 'fiona-smile', "Do I have a voice recording for you."],
[null, null, "Bzzt."],
['R', 'fiona-smile', "<i>Hello computer.</i>"],
['R', 'fiona-say', "<i>Can I talk to your programmer please?</i>"],
['L', 'conglomerate-calm', "<i>I've crushed my programmer.</i>"],
['L', 'conglomerate-shout', "<i>And now I will crush you!</i>"],
[null, null, "Bzzt."],
['L', 'conglomerate-calm', "<i>I've crushed my programmer.</i>"],
[null, null, "Bzzt."],
['L', 'conglomerate-calm', "<i>I've crushed my programmer.</i>"],
[null, null, "Bzzt."],
['L', 'angelica-angry', "Stop!"],
['L', 'angelica-angry', "I get it already. Cor blimey!"],
['L', 'angelica-serious', "Okay."],
['L', 'angelica-serious', "Alright."],
['L', 'angelica-serious', "You go on back to the exchange."],
['L', 'angelica-jolly', "Break bank. Distract it."],
['L', 'angelica-happy', "I will get a can of gas at the station and set this data center on fire."],
  ],

  epilogue: [
['R', 'fiona-shout', "Hey, Mom."],
['L', 'mom-say', "Fiona! It's so nice of you to call."],
['R', 'fiona-smile', "I'm here with Dolores."],
['R', 'dolores-laugh', "Hey, Mom."],
['L', 'mom-say', "Dolores! Is Fiona cooking for you?"],
['L', 'mom-smile', "I hear some sizzling in the background."],
['R', 'fiona-smile', "Yeah, I'm cooking."],
['R', 'fiona-laugh', "We're having a data center barbecue."],
['R', 'dolores-smile', "Isn't it nice to sit by the fire on a cold evening like this?"],
['R', 'cat-down.jpg', "Purr."],
['R', 'angelica-happy', "Hey, Mrs Five. I'm Angelica Siebel, a huge admirer of yours."],
['R', 'fiona-say', "Ah yeah, Mom, we have some friends over for the barbecue."],
['R', 'fiona-embarrassed', "Angelica, would you mind finding a better spot for that can?"],
['L', 'mom-smile', "Nice to meet you!"],
['L', 'mom-say', "Call me Roberta."],
['R', 'marilyn-smile', "Mrs Five! I'm Marilyn Siebel, Angelica's sister."],
['R', 'fiona-shout', "You're alive?!"],
['R', 'marilyn-blush', "Did you think getting their startup de-funded actually kills a person?"],
['R', 'marilyn-smile', "The Conglomerate may have crushed me, but a programmer is not so easy to kill."],
['R', 'dolores-smile', "Thanks for setting all the accounts right today, Fiona."],
['R', 'fiona-say', "Thanks, sis. We did a great job, didn't we?"],
['R', 'fiona-laugh', "High five!"],
[null, null, "<i>The end. Thanks for playing!</i>"],
  ],

  partyexplanation: [
[null, null, "Party mode is a timed game on the current level. Try to score as much as you can in 2 minutes.\n\n" +
             "Party mode can be played competitively or collaboratively as a local multiplayer game on the keyboard."],
[null, null, "To add a new player, just press the <b>up</b>, <b>down</b>, <b>left</b>, <b>right</b> keys for the new player in order when the game starts. Reload the page to reset the controls."],
  ],

};

let currentMusic;
function playMusic() {
  currentMusic = new Howl({
    src: map.music || 'https://raw.githubusercontent.com/darabos/high-five-trading/master/silence30.mp3',
    autoplay: true,
    volume: 0.5,
    onend: () => playMusic(),
  });
}

function setupSfx() {
  const sfx = [];
  for (let i = 0; i < 10; ++i) {
    const lib = {};
    for (let j = 0; j < 10; ++j) {
      lib[`p${j}`] = {
        Frequency: { Start: pow(1.5, 10 + j) },
        Volume: { Sustain: 0.1, Decay: 0.1, Master: 0.1 },
        Generator: { Func: 'sine' },
      };
      lib[`n${j}`] = {
        Frequency: { Start: pow(1.5, 10 + j) },
        Volume: { Sustain: 0.1, Decay: 0.1, Master: 0.1 },
        Generator: { Func: 'square' },
      };
      lib.stairs = {
        Frequency: { Start: pow(1.5, 16), ChangeSpeed: 0.1, ChangeAmount: 5 },
        Volume: { Sustain: 0.1, Decay: 0.4, Punch: 0.5 },
      };
    }
    sfx.push(jsfx.Sounds(lib));
  }
  let i = 0;
  sfx.play = function(name) {
    if (options.sound) {
      sfx[i][name]();
      i = (i + 1) % sfx.length;
    }
  };
  sfx.profit = function(g) { sfx.play(g > 0 ? `p${floor(g)}` : `n${floor(-g)}`); };
  return sfx;
}
const sfx = setupSfx();

setMapNow('demo');
playMusic();
animate();
