function v3(x, y, z) { return new THREE.Vector3(x, y, z); }
const scene = new THREE.Scene();
scene.background = new THREE.Color().setHSL(0.6, 0, 1);
scene.fog = new THREE.Fog(scene.background, 1, 3000);

const fov = 60 * window.innerHeight / window.innerWidth;
const camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 1, 5000);
camera.position.set(-90, 200, 300);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

function setupComposer() {
  renderer.toneMappingExposure = Math.pow(0.9, 4.0);
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

function addStocks() {
  const stocks = [];
  const w = map.stockWidth || 5;
  for (let i = 0; i < map.size[0]; ++i) {
    const row = [];
    for (let j = 0; j < map.size[1]; ++j) {
      const geo = new THREE.BoxGeometry(w, 20, w);
      const color = 0x105080;
      const mat = new THREE.MeshPhongMaterial( { color, emissive: color, flatShading: true } );
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

function addPlayer() {
  const geo = new THREE.SphereGeometry(3, 4, 2);
  const mat = new THREE.MeshPhongMaterial( { color: 0x896215, emissive: 0x896215, flatShading: true } );
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
  cowboy: 'http://ccmixter.org/content/jlbrock44/jlbrock44_-_Cowboy_Glitch_(borja_vs._go1dfish).mp3',
  // 260809 Funky Nurykabe by spinningmerkaba (c) copyright 2010 Licensed under a Creative Commons Attribution (3.0) license. http://dig.ccmixter.org/files/jlbrock44/29186
  funky: 'http://ccmixter.org/content/jlbrock44/jlbrock44_-_260809_Funky_Nurykabe.mp3',
  // Urbana-Metronica (wooh-yeah mix) by spinningmerkaba (c) copyright 2011 Licensed under a Creative Commons Attribution (3.0) license. http://dig.ccmixter.org/files/jlbrock44/33345 Ft: Morusque, Jeris, CSoul, Alex Beroza
  urbana: 'http://ccmixter.org/content/jlbrock44/jlbrock44_-_Urbana-Metronica_(wooh-yeah_mix).mp3',
  // Reusenoise  (DNB Mix) by spinningmerkaba (c) copyright 2017 Licensed under a Creative Commons Attribution (3.0) license. http://dig.ccmixter.org/files/jlbrock44/56531
  reusenoise: 'http://ccmixter.org/content/jlbrock44/jlbrock44_-_Reusenoise_(DNB_Mix)_1.mp3',
  // Organometron (140811 MIx) by spinningmerkaba (c) copyright 2011 Licensed under a Creative Commons Attribution (3.0) license. http://dig.ccmixter.org/files/jlbrock44/33115 Ft: Morusque
  organometron: 'http://ccmixter.org/content/jlbrock44/jlbrock44_-_Organometron_(140811_MIx).mp3',
  // Sticky Bumps (featuring Debbizo) by spinningmerkaba (c) copyright 2011 Licensed under a Creative Commons Attribution (3.0) license. http://dig.ccmixter.org/files/jlbrock44/32247
  sticky: 'http://ccmixter.org/content/jlbrock44/jlbrock44_-_Sticky_Bumps_(featuring_Debbizo).mp3',
};

const maps = {

  demo: {
    size: [30, 30],
    capital: [1000, 2000],
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
    },
    onEnd() {
      document.getElementById('capital-group').style.display = '';
      document.getElementById('menu-group').style.display = 'none';
    },
  },

  tutorial: {
    size: [2, 1],
    startPos: [0, 0],
    capital: [1000, 2000],
    cameraPos: v3(10, 25, 100),
    height: (i, j, t) => i === 0 ? 1 : (1 + 0.5 * sin(0.002 * t)),
    onStart() { runScene('tutorial'); },
    onEnd() { runScene('tutorialDone', () => setMap('linear')) },
    music: music.across,
  },

  linear: {
    size: [12, 1],
    startPos: [0, 0],
    capital: [1000, 2000],
    cameraPos: v3(10, 40, 160),
    height(i, j, t) {
      t = sin(0.001 * t)
      return 1 + 0.5 * sin(4 * t + i + 2);
    },
    onStart() { runScene('map2'); },
    onEnd() { setMap('sineRipples'); },
    music: music.pixie,
  },

  sineRipples: {
    size: [20, 20],
    capital: [1000, 3000],
    cameraPos: v3(-40, 120, 250),
    height: function(i, j, t) {
      const phi = 0.005 * t - 0.5 * dist(i, j, 10, 10);
      return 1 + 0.2 * sin(phi);
    },
    onStart: () => runScene('map3'),
    onEnd() { setMap('checkerSine'); },
    music: music.funky,
  },

  checkerSine: {
    size: [20, 20],
    capital: [1000, 3000],
    height: function(i, j, t) {
      const scale = 0.9;
      return 1 + 0.3 * sin(0.005 * t) * sin(10 + scale * i) * sin(10 + scale * j);
    },
    onEnd() { setMap('frequencies'); },
    music: music.urbana,
  },

  frequencies: {
    size: [20, 20],
    capital: [1000, 3000],
    height: function(i, j, t) {
      const mask = max(0.1, tanh(10 - dist(i, j, 10, 10)));
      return mask * (1 + 0.3 * sin(0.0005 * t * (i + 10) + j));
    },
    onEnd() { setMap('scribbles'); },
    music: music.kungfu,
  },

  scribbles: {
    size: [20, 20],
    capital: [1000, 3000],
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
    onEnd() { setMap('slow2Swirl'); },
    music: music.cowboy,
  },

  slow2Swirl: {
    size: [20, 20],
    capital: [1000, 2000],
    height: (i, j, t) => {
      i -= 10; j -= 10;
      const r = sqrt(i * i + j * j);
      const phi = 2 * atan2(i, j) - t * 0.001 + 0.5 * r;
      const attenuation = pow(2, -0.02 * r * r);
      return sin(phi) * attenuation + 1.1;
    },
    onEnd() { setMap('fast3Swirl'); },
    music: music.across,
  },

  fast3Swirl: {
    size: [20, 20],
    startPos: [19, 9],
    capital: [10, 1000000000],
    height: (i, j, t) => {
      i -= 10; j -= 10;
      const r = sqrt(i * i + j * j);
      const phi = 3 * atan2(i, j) - t * 0.002 + 0.5 * r;
      return sin(phi) + 1.1;
    },
    onEnd() { setMap('sharks'); },
    music: music.organometron,
  },

  sharks: {
    size: [20, 20],
    capital: [1000, 3000],
    onStart: () => runScene('epilogue'),
    onEnd() { setMap('tilt'); },
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
    music: music.pixie,
  },

  tilt: {
    size: [20, 20],
    capital: [1000, 10000],
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
    onEnd() { setMap('comb'); },
    music: music.organometron,
  },

  comb: {
    size: [20, 20],
    capital: [1000, 10000],
    height: (i, j, t) => {
      const s = floor(j / 2) % 2 * 2 - 1;
      const p = s * (i - 9.5);
      return 1 + 0.5 * (1 + sin((0.01 * t + 0.2 * j + 0.5 * p))) * (1 + tanh( 0.2 * p));
    },
    onEnd() { setMap('maze'); },
    music: music.cowboy,
  },

  maze: {
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
    },
    playerWeight: 1,
    update(dt) { hf.update(dt); },
    music: music.sticky,
    onEnd() { setMap('lissajous'); },
  },

  lissajous: {
    size: [20, 20],
    capital: [1000, 10000],
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
    onEnd() { setMap('chaoticWaves'); },
    music: music.cowboy,
  },

  chaoticWaves: {
    size: [20, 20],
    capital: [1000, 10000],
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
    onEnd() { setMap('dimples'); },
    music: music.cowboy,
  },

  dimples: {
    size: [20, 20],
    capital: [1000, 10000],
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
    onEnd() { setMap('manyDimples'); },
    music: music.cowboy,
  },

  manyDimples: {
    size: [20, 20],
    capital: [1000, 10000],
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
    onEnd() { setMap('castle'); },
    music: music.cowboy,
  },

  castle: {
    stockWidth: 9,
    cameraPos: v3(-120, 150, 200),
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
    },
    onEnd() { setMap(options.sound ? 'music' : 'pumping'); },
    music: music.pixie,
  },

  music: {
    cameraPos: v3(-90, 300, 300),
    size: [20, 20],
    capital: [1000, 10000],
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
      map.lastTime = t || 0;
      map.analyser = Howler.ctx.createAnalyser();
      map.analyser.fftSize = 64;
      map.analyser.smoothingTimeConstant = 0;
      Howler.masterGain.connect(map.analyser);
      map.freqs = [];
      for (let j = 0; j < map.size[1]; ++j) {
        map.freqs.push(new Uint8Array(map.analyser.frequencyBinCount));
      }
    },
    onEnd() {
      Howler.masterGain.disconnect(map.analyser);
      setMap('pumping');
    },
    music: music.cowboy,
  },

  pumping: {
    pumpStrength: 10,
    size: [20, 20],
    capital: [1000, 3000],
    height: function(i, j, t) {
      return 1.1 + tanh(hf.u[i][j]);
    },
    update(dt) { hf.update(dt); },
    onEnd() { setMap('bubbles'); },
    music: music.reusenoise,
  },

  bubbles: {
    size: [20, 20],
    capital: [1000, 10000],
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
      map.bubs = [];
    },
    onEnd() { setMap('mountain'); },
    music: music.pixie,
  },

  collapsible: {
    size: [20, 20],
    capital: [1000, 10000],
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
        stocks[map.tower[0]][map.tower[1]].material.color.set(0x105080);
        map.tower = [floor(rnd() * 20), floor(rnd() * 20)];
        stocks[map.tower[0]][map.tower[1]].material.color.set(map.towerColor);
      }
    },
    onStart() {
      map.tower = [floor(rnd() * 20), floor(rnd() * 20)];
      stocks[map.tower[0]][map.tower[1]].material.color.set(map.towerColor);
    },
    onEnd() { setMap('clock'); },
    music: music.sticky,
  },

  clock: {
    size: [29, 8],
    capital: [1000, 10000],
    height: function(i, j, t) {
      return 0.1 + hf.u[i][j];
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
    onEnd() { setMap('snake'); },
    music: music.sticky,
  },

  snake: {
    size: [20, 20],
    capital: [1000, 10000],
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
    onEnd() { setMap('mountain'); },
    music: music.cowboy,
  },

  mountain: {},

};
console.log(Object.keys(maps).length, 'maps');

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
const player = { obj: addPlayer() };

function setMap(name) {
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
  player.stocks = map.capital[0]
  player.buyPrice = 1;
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
let t;
let stairState;
function animate(timestamp) {
  requestAnimationFrame(animate);
  if (startTime === undefined) { startTime = timestamp; }
  const dt = min(100, timestamp - startTime - t || 0);
  t = timestamp - startTime;
  for (let i = 0; i < map.size[0]; ++i) {
    for (let j = 0; j < map.size[1]; ++j) {
      stocks[i][j].scale.y = map.height(i, j, t);
    }
  }
  const pt = ij2vec(player.i, player.j);
  if (player.win) {
    pt.x -= 10;
    if (t - player.win > 1000) {
      map.onEnd();
    }
  }
  player.obj.position.lerp(pt, 1 - pow(0.995, dt));
  pt.y += 10;
  player.lookAt.lerp(pt, 1 - pow(0.99, dt));
  player.obj.lookAt(player.lookAt);
  player.obj.rotation.z = 0.01 * t;
  if (map.cameraPos) {
    camera.position.lerp(map.cameraPos, 1 - pow(0.999, dt));
    camera.lookAt(0, 0, 0);
  }

  if (map.capital[1] <= player.capital) {
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
  map.update && map.update(dt);
  handleKeys(dt);
  hf.v[player.i][player.j] = min(hf.v[player.i][player.j], -map.playerWeight || 10);
  for (let i = 0; i < (map.dust || 0) * 0.001 * dt; ++i) {
    particles.spawnParticle(dust);
  }
  particles.update(0.001 * t);
  if (options.bloom) {
    composer.render(scene, camera);
  } else {
    renderer.render(scene, camera);
  }
  player.capital = floor(player.stocks * map.height(player.i, player.j, t));
  showCapital();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize, false);

const effects = [];
function addBoom(i, j, gain) {
  if (gain === 0) { return; }
  const g = Math.min(5, Math.abs(gain * 5));
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

const keys = {};
function onKeyDown(evt) {
  if (evt.key === 'Escape') {
    setMap('demo');
    document.getElementById('talk').remove();
    talking = false;
  }
  if (talking) {
    if (evt.key === ' ' || evt.key === 'Enter') {
      advanceTalk();
    }
    return;
  }
  if (evt.key === 'ArrowLeft') { keys.left = true; }
  else if (evt.key === 'ArrowRight') { keys.right = true; }
  else if (evt.key === 'ArrowUp') { keys.up = true; }
  else if (evt.key === 'ArrowDown') { keys.down = true; }
  else if (evt.key === ' ') { keys.space = true; }
}
function onKeyUp(evt) {
  if (evt.key === 'ArrowLeft') { keys.left = false; }
  else if (evt.key === 'ArrowRight') { keys.right = false; }
  else if (evt.key === 'ArrowUp') { keys.up = false; }
  else if (evt.key === 'ArrowDown') { keys.down = false; }
  else if (evt.key === ' ') { keys.space = false; }
}
document.addEventListener('keydown', onKeyDown, false);
document.addEventListener('keyup', onKeyUp, false);

let keyBattery = 0;
function handleKeys(dt) {
  const speed = 150;
  keyBattery = min(speed + dt, keyBattery + dt);
  if (talking || player.win) { return; }
  if (keys.space && map.pumpStrength) {
    hf.u[player.i][player.j] = -map.pumpStrength;
  }
  if (keyBattery < speed) { return; }
  if (!keys.left && !keys.right && !keys.up && !keys.down) { return; }
  const {i, j} = player;
  keyBattery -= speed;
  if (keys.left && player.i > 0) { player.i -= 1; }
  if (keys.right && player.i < map.size[0] - 1) { player.i += 1; }
  if (keys.up && player.j > 0) { player.j -= 1; }
  if (keys.down && player.j < map.size[1] - 1) { player.j += 1; }
  if (i !== player.i || j !== player.j) {
    const h0 = map.height(i, j, t);
    addBoom(i, j, h0 - player.buyPrice);
    const h1 = map.height(player.i, player.j, t);
    player.stocks = Math.max(10, floor(h0 * player.stocks / h1));
    player.buyPrice = h1;
  } else if (keys.left && map.capital[1] <= player.capital && player.i == 0 &&
    player.j < floor(map.size[1] / 2 + 2) && floor(map.size[1] / 2 - 2) < player.j) {
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
      keys.space = true;
      touch.spaceId = t.identifier;
    }
  }
}

function onTouchMove(e) {
  e.preventDefault();
  for (let t of e.changedTouches) {
    if (t.identifier === touch.moveId) {
      const dx = t.pageX - touch.baseX;
      const dy = t.pageY - touch.baseY;
      keys.up = dy < -10;
      keys.down = 10 < dy;
      keys.left = dx < -10;
      keys.right = 10 < dx;
    }
  }
}

function onTouchEnd(e) {
  e.preventDefault();
  for (let t of e.changedTouches) {
    touch.count -= 1;
    if (t.identifier === touch.spaceId) {
      touch.spaceId = undefined;
      keys.space = false;
    } else if (t.identifier === touch.moveId) {
      touch.moveId = undefined;
      keys.left = false;
      keys.right = false;
      keys.up = false;
      keys.down = false;
    }
  }
}


document.body.insertAdjacentHTML('beforeend', `
<div id="capital-group">
  <div id="capital-string" style="
    position: absolute; top: 0; right: 1vh;
    padding: 2vh 0; color: white;
    font: 4vh monospace;"></div>
  <div style="border: 0.2vh solid white; position: absolute; bottom: 1vh; right: 1vh;
              width: 5vh; height: 90vh; box-sizing: border-box;">
    <div id="capital" style="background: white; position: absolute; bottom: 0; width: 100%;">
    </div>
  </div>
</div>`);
const numberFormat = new Intl.NumberFormat('en-us');
function showCapital() {
  const pct = min(100, 100 * player.capital / map.capital[1]);
  document.getElementById('capital').style.height = pct + '%';
  document.getElementById('capital').style.backgroundColor = pct === 100 ? '#ffff44' : 'white';
  document.getElementById('capital').parentElement.style.borderColor = pct === 100 ? '#ffff44' : 'white';
  document.getElementById('capital-string').style.color = pct === 100 ? '#ffff44' : 'white';
  document.getElementById('capital-string').innerHTML = '$' + numberFormat.format((map.moneyScale || 1000) * player.capital);
}

const options = {
  bloom: true,
  sound: true,
};
document.body.insertAdjacentHTML('beforeend', `
<div id="menu-group" style="
  position: absolute; top: 0; width: 100vw; height: 100vh;
  display: none; flex-direction: column; justify-content: center; text-align: center; align-items: center;
  color: white; text-shadow: 0 0 0.5vh black;">
  <div style="
    margin: 3vh; font: 12vh Fascinate, sans-serif;">High Five Trading</div>
  <div id="menu" style="display: inline-block; font: 5vh Audiowide, sans-serif;">
    <style>#menu div { cursor: pointer; margin: 1vh; } #menu div:hover { color: #fff249; }</style>
    <div onclick="continueGame()">Continue</div>
    <div onclick="newGame()">New game</div>
    <div id="sound" onclick="setSound(!options.sound)">☐ Sound</div>
    <div id="bloom" onclick="setBloom(!options.bloom)">☑ Bloom</div>
    <div onclick="showCredits()">Credits</div>
  </div>
</div>`);
function continueGame() {
  map.onEnd();
  setMap('tutorial');
}
function newGame() {
  map.onEnd();
  setMap('tutorial');
}
function setBloom(setting) {
  options.bloom = setting;
  document.getElementById('bloom').innerHTML = options.bloom ? '☑ Bloom' : '☐ Bloom';
}
function setSound(setting) {
  options.sound = setting;
  document.getElementById('sound').innerHTML = options.sound ? '☑ Sound' : '☐ Sound';
  Howler.mute(!options.sound);
}
setBloom(options.bloom);
setSound(options.sound);

document.body.insertAdjacentHTML('beforeend', `
<div id="credits-group" style="
  position: absolute; top: 0; width: 100vw; height: 100vh;
  display: none; flex-direction: column; justify-content: center; text-align: center; align-items: center;
  color: white; text-shadow: 0 0 0.5vh black;" onclick="hideCredits()">
  <div style="
    margin: 1vh; font: 4vh Fascinate, sans-serif;">High Five Trading</div>
  <style> a { color: #ffff44; } </style>
  <div style="margin: 1vh; font: 3vh sans-serif;">
    <p>A Repl.it Game Jam 2019 game by <a href="https://twitter.com/DanielDarabos">Daniel Darabos</a>.</p>
    <p>
      Character art generated with a fantastic <a href="https://arxiv.org/abs/1812.04948">StyleGAN</a>
      model trained by <a href="https://www.gwern.net/Faces">Gwern Branwen</a>
      through a <a href="https://colab.research.google.com/drive/1LiWxqJJMR5dg4BxwUgighaWp2U_enaFd#offline=true&sandboxMode=true">Colaboratory notebook</a>
      by <a href="https://twitter.com/halcy">@halcy</a>.
    </p>
    <p>
      Cat photos by <a href="https://www.publicdomainpictures.net/en/browse-author.php?hleda=cat&seradit=date&a=8245">George Hodan</a>.
    </p>
    <p>
      All music by <a href="http://dig.ccmixter.org/people/jlbrock44">spinningmerkaba</a>,
      graciously licensed under Creative Commons Attribution (3.0).
    </p>
    <p>
      JavaScript dependencies: <a href="https://threejs.org/">three.js</a> and <a href="https://howlerjs.com">howler.js</a>
      kindly provided by <a href="https://twitter.com/mrdoob">Ricardo Cabello</a>
      and <a href="https://twitter.com/GoldFireStudios">James Simpson</a> and their collaborators under the MIT license.
    </p>
    <p>
      Using the <a href="https://fonts.google.com/specimen/Fascinate">Fascinate</a>
      and <a href="https://fonts.google.com/specimen/Audiowide">Audiowide</a>
      fonts by <a href="http://astigmatic.com/">Astigmatic</a> under the Open Font License.
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
  const transform = side === 'L' ? 'rotate3d(5, 10, -2, 10deg)' : 'rotate3d(-5, 10, -2, -10deg)';
  const talk = document.getElementById('talk');
  if (talk) {
    const img = document.getElementById('talk-pic');
    if (pic) {
      talk.style.left = `calc(50vw - 40vh ${sign} 3vh)`;
      talk.children[0].style.transform = transform;
      talk.children[0].style.flexDirection = side === 'L' ? 'row' : 'row-reverse';
      img.src = `pics/${pic}`;
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
      <img id="talk-pic" src="pics/${pic}" style="
        max-height: 100%; border-radius: 1vh; ${ side === 'L' ? 'transform: scaleX(-1);' : '' }
        box-shadow: 0 0.2vh 1vh rgba(0, 0, 0, 0.5); margin-${side === 'L' ? 'right' : 'left'}: 1vh;">
      <div style="display: flex; flex-direction: column; flex: 1;">
      <style>p { margin: 1vh; }</style>
      <div id="talk-text" style="flex: 1;">
        <p><b>${name}:</b></p>
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
  scriptScene = scene;
  scriptIndex = -1;
  scriptEnding = ending;
  advanceTalk();
}
function preloadPics() {
  for (let scene of Object.values(script)) {
    for (let s of scene) {
      if (!s[1]) { continue; }
      const i = new Image();
      if (s[1].includes('.')) {
        i.src = `pics/${s[1]}`;
      } else {
        i.src = `pics/${s[1]}.png`;
      }
    }
  }
}

const script = {
  tutorial: [
['L', 'mom-say', "No.\n\n<small>(Click, tap, or press Space or Enter to continue.)</small>"],
['R', 'fiona-say', "But I can do it, Mom!"],
['L', 'mom-say', "No. Trading stocks is more dangerous than you realize, Fiona."],
['L', 'mom-say', "You cannot just use the arrow keys to move your entire portfolio into another stock."],
['R', 'fiona-shout', "Watch me!"],
  ],
  tutorialMovingBack: [
['L', 'mom-say', "Stop right there. Our family has lost so much already!"],
['L', 'mom-sad', "Stocks are volatile. If you move back to the cash position when the stock is lower than when you invested, you will lose money."],
  ],
  tutorialOops: [
['R', 'fiona-embarrassed', "Oops. Let me try that again."],
  ],
  tutorialMoney: [
['R', 'fiona-smile', "I've got this, Mom! See the bar on the left side of the screen? I made us money."],
['L', 'mom-sad', "Your sister made us a lot of money too, you know."],
['R', 'fiona-embarrassed', "Please don't make this about Dolores. I'll be careful. I'll stay safe."],
['L', 'mom-say', "Good. You just stick with this one privately traded stock. No need to enter the local stock exchange when you hit its capital requirement."],
  ],
  tutorialDone: [
['L', 'mom-say', "You now have enough capital to enter the local stock exchange. But it's better not to press C and rather stay here in safety. Indefinitely."],
  ],

  map2: [
['L', 'mom-say', "Fiona. You know you can come home any time you feel in over your head."],
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

  map5: [
['L', 'mom-say', "Stay out of high frequency trading, Fiona! You don't have the reflexes of your sister."],
['L', 'mom-sad', "You don't have the reflexes of your sister."],
['R', 'fiona-embarrassed', "Thanks for the vote of confidence, Mom."],
['R', 'fiona-smile', "The faster the stock, the faster the gains!"],
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
['R', 'fiona-smile', "I love you too, Mom. I'm not jealous of Dolores."],
['R', 'fiona-smile', "I'm not jealous of Dolores."],
['R', 'fiona-embarrassed', "Yes, I was jealous at some point."],
['R', 'fiona-thoughtful', "But not anymore. I just want to understand what happened to her."],
['L', 'mom-say', "Is that worth the risk?"],
['L', 'mom-say', "Would you press SPACE to Pump & Dump a stock and risk angering the market forces?"],
  ],

  map12didit: [
['R', 'fiona-laugh', "I did it!"],
['L', 'angelica-serious', "Congratulations, Ms Fiona Five."],
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
['R', 'fiona-laugh', "You're alive!"],
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
  // TODO
['L', 'dolores-say', "Computers do all the trading. No human element. No harmony."],
['R', 'fiona-shout', "Don't sing me that hippie song now."],
['R', 'fiona-embarrassed', "I'm still angry."],
['L', 'dolores-smile', "Anger is a weakness."],
['L', 'dolores-say', "Only through harmony—"],
['R', 'fiona-shout', "Stop right there."],
  ],

  map19: [
  // TODO
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
['R', 'fiona-smile', "Hello computer."],
['R', 'fiona-say', "Can I talk to your programmer please?"],
['L', 'conglomerate-calm', "I've crushed my programmer."],
['L', 'conglomerate-shout', "And now I will crush you!"],
[null, null, "Bzzt."],
['L', 'conglomerate-calm', "I've crushed my programmer."],
[null, null, "Bzzt."],
['L', 'conglomerate-calm', "I've crushed my programmer."],
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

};
console.log(Object.keys(script).length, 'scripts');

function playMusic() {
  new Howl({
    src: map.music || 'https://raw.githubusercontent.com/anars/blank-audio/master/30-seconds-of-silence.mp3',
    autoplay: true,
    volume: 0.5,
    onend: () => playMusic(),
  });
}

preloadPics();
setMap('demo');
playMusic();
animate();
