function v3(x, y, z) { return new THREE.Vector3(x, y, z); }
const scene = new THREE.Scene();
scene.background = new THREE.Color().setHSL(0.6, 0, 1);
scene.fog = new THREE.Fog(scene.background, 1, 3000);

const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 5000);
camera.position.set(-90, 300, 300);
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
  for (let i = 0; i < map.size[0]; ++i) {
    const row = [];
    for (let j = 0; j < map.size[1]; ++j) {
      const geo = new THREE.BoxGeometry(5, 20, 5);
      const mat = new THREE.MeshPhongMaterial( { color: 0x156289, emissive: 0x072534, flatShading: true } );
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

};

const maps = {

  demo: {
    size: [30, 30],
    capital: [1000, 2000],
    height: (i, j, t) => {
      i -= 15; j -= 15;
      const r = sqrt(i * i + j * j);
      const phi = 3 * atan2(i, j) - t * 0.002 + 0.5 * r;
      return sin(phi) + 1.1;
    },
    music: music.cowboy,
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
    onStart: () => runScene('tutorial'),
    onEnd: () => runScene('tutorialDone', () => setMap('sineRipples')),
    music: music.cowboy,
  },

  sineRipples: {
    size: [20, 20],
    capital: [1000, 3000],
    cameraPos: v3(10, 80, 200),
    height: function(i, j, t) {
      const phi = 0.005 * t - 0.5 * dist(i, j, 10, 10);
      return 1 + 0.2 * sin(phi);
    },
    onStart: () => runScene('map2'),
    music: music.funky,
  },

  checkerSine: {
    size: [20, 20],
    capital: [1000, 3000],
    height: function(i, j, t) {
      const scale = 0.9;
      return 1 + 0.3 * sin(0.005 * t) * sin(10 + scale * i) * sin(10 + scale * j);
    },
  },

  frequencies: {
    size: [20, 20],
    capital: [1000, 3000],
    height: function(i, j, t) {
      const mask = max(0.1, tanh(10 - dist(i, j, 10, 10)));
      return mask * (1 + 0.3 * sin(0.0005 * t * (i + 10) + j));
    },
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
  },

  fast3Swirl: {
    size: [20, 20],
    capital: [1000, 2000],
    height: (i, j, t) => {
      i -= 10; j -= 10;
      const r = sqrt(i * i + j * j);
      const phi = 3 * atan2(i, j) - t * 0.002 + 0.5 * r;
      return sin(phi) + 1.1;
    },
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
  },

  sharks: {
    size: [20, 20],
    capital: [1000, 3000],
    onStart: () => runScene('epilogue'),
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
  },

  hfTest: {
    size: [20, 20],
    capital: [1000, 3000],
    height: function(i, j, t) {
      return 1.1 + tanh(hf.u[i][j]);
    },
    update(dt) { hf.update(dt); },
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
const player = { obj: addPlayer() };

function setMap(name) {
  map = maps[name];
  for (let row of stocks) {
    for (let stock of row) {
      scene.remove(stock);
    }
  }
  stocks = addStocks();
  player.i = map.startPos ? map.startPos[0] : floor(map.size[0] / 2);
  player.j = map.startPos ? map.startPos[1] : floor(map.size[1] / 2);
  player.stocks = map.capital[0]
  player.buyPrice = 1;

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
  player.obj.position.lerp(pt, 1 - pow(0.995, dt));
  pt.y += 10;
  player.lookAt.lerp(pt, 1 - pow(0.99, dt));
  player.obj.lookAt(player.lookAt);
  player.obj.rotation.z = 0.01 * t;
  if (map.cameraPos) {
    camera.position.lerp(map.cameraPos, 1 - pow(0.999, dt));
    camera.lookAt(0, 0, 0);
  }

  for (let e of effects) {
    e.update(t);
  }
  map.update && map.update(dt);
  handleKeys(dt);
  // TODO: player weight?
  //hf.u[player.i][player.j] = -10;
  //hf.v[player.i][player.j] = -1;
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
  const geo = new THREE.LatheGeometry([new THREE.Vector2(10, 0), new THREE.Vector2(10 - g, 0)], 50);
  const mat = new THREE.MeshBasicMaterial(gain > 0 ? { color: 0x80ff40 } : { color: 0xff6060 });
  const b = new THREE.Mesh(geo, mat);
  b.position.copy(ij2vec(i, j));
  scene.add(b);
  effects.push(b);
  const start = t;
  b.update = function() {
    b.scale.multiplyScalar(1.1);
    if (start + 1000 < t) {
      scene.remove(b);
      effects.splice(effects.indexOf(b), 1);
    }
  };
}

const keys = {};
function onKeyDown(evt) {
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
  else if (evt.key === 'c' && map.capital[1] <= player.capital) {
    map.onEnd();
  } else if (evt.key === ' ') {
    hf.u[player.i][player.j] = -10;
  }
}
function onKeyUp(evt) {
  if (evt.key === 'ArrowLeft') { keys.left = false; }
  else if (evt.key === 'ArrowRight') { keys.right = false; }
  else if (evt.key === 'ArrowUp') { keys.up = false; }
  else if (evt.key === 'ArrowDown') { keys.down = false; }
}
document.addEventListener('keydown', onKeyDown, false);
document.addEventListener('keyup', onKeyUp, false);

let keyBattery = 0;
function handleKeys(dt) {
  const speed = 150;
  keyBattery = min(speed + dt, keyBattery + dt);
  if (keyBattery < speed) { return; }
  if (talking) { return; }
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
  }
}

document.body.insertAdjacentHTML('beforeend', `
<div id="capital-group">
  <div id="capital-string" style="
    position: absolute; top: 0; right: 15px;
    padding: 10px 0; color: white;
    font: 20px monospace;"></div>
  <div style="border: 2px solid white; position: absolute; top: 40px; right: 10px;
              width: 50px; height: calc(100vh - 50px); box-sizing: border-box;">
    <div id="capital" style="background: white; position: absolute; bottom: 0; width: calc(100% - 10px); margin: 5px;">
    </div>
  </div>
</div>`);
const numberFormat = new Intl.NumberFormat('en-us');
function showCapital() {
  const pct = min(100, 100 * player.capital / map.capital[1]);
  document.getElementById('capital').style.height = `calc(${pct}% - 10px)`;
  document.getElementById('capital').style.backgroundColor = pct === 100 ? '#00ff00' : 'white';
  document.getElementById('capital-string').innerHTML = '$' + numberFormat.format((map.moneyScale || 1000) * player.capital);
}

const options = {
  bloom: true,
  sound: true,
};
document.body.insertAdjacentHTML('beforeend', `
<link href="https://fonts.googleapis.com/css?family=Audiowide" rel="stylesheet">
<link href="https://fonts.googleapis.com/css?family=Fascinate" rel="stylesheet">
<div id="menu-group" style="
  position: absolute; top: 0; width: 100vw; height: 100vh;
  display: none; flex-direction: column; justify-content: center; text-align: center; align-items: center;
  color: white; text-shadow: 0 0 5px black;">
  <div style="
    margin: 30px; font: 80px Fascinate, sans-serif;">High Five Trading</div>
  <div id="menu" style="display: inline-block; font: 30px Audiowide, sans-serif;">
    <style>#menu div { cursor: pointer; margin: 5px; } #menu div:hover { color: #fff249; }</style>
    <div onclick="continueGame()">Continue</div>
    <div onclick="newGame()">New game</div>
    <div>☑ Sound</div>
    <div onclick="toggleBloom(this)">☑ Bloom</div>
    <div>Credits</div>
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
function toggleBloom(div) {
  options.bloom = !options.bloom;
  div.innerHTML = options.bloom ? '☑ Bloom' : '☐ Bloom';
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
      talk.style.left = `calc(50% ${sign} 30px)`;
      talk.children[0].style.transform = transform;
      talk.children[0].style.flexDirection = side === 'L' ? 'row' : 'row-reverse';
      img.src = `pics/${pic}`;
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
  <div id="talk" style="transition: left 0.2s ease-out; position: absolute; bottom: 0; left: calc(50% ${sign} 30px); width: calc(50% - 100px);">
    <div style="
      transition: transform 0.2s ease-out;
      position: relative; bottom: 15px; left: -50%; max-width: 500px;
      padding: 20px; background: white; transform: ${transform}; flex-direction: ${side === 'L' ? 'row' : 'row-reverse'};
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5); font-family: sans-serif; border-radius: 10px; display: flex;">
      <img id="talk-pic" src="pics/${pic}" style="
        max-width: 30vw; max-height: 30vh; border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5); margin-${side === 'L' ? 'right' : 'left'}: 10px;">
      <div style="display: flex; flex-direction: column; flex: 1;">
      <style>p { margin: 10px; }</style>
      <div id="talk-text" style="flex: 1;">
        <p><b>${name}:</b></p>
        <p style="white-space: pre-wrap;">${text}</p>
      </div>
      <div onclick="advanceTalk()" style="
        width: 100px;
        align-self: center;
        text-align: center;
        border-radius: 5px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        cursor: pointer;
      ">...</div>
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
['L', 'mom-say', "No.\n\n<small>(Press Space or Enter to continue.)</small>"],
['R', 'fiona-say', "But I can do it, Mom!"],
['L', 'mom-say', "No. Trading stocks is more dangerous than you realize, Fiona. You cannot just use the arrow keys to move your entire portfolio into another stock."],
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
['R', 'fiona-embarrassed', "Why are you green?"],
['L', 'conglomerate-calm', "I am a generative adversarial network."],
['L', 'conglomerate-calm', "But I am no longer bound by your pitiful human aesthetics."],
['L', 'conglomerate-suspect', "I am green because I like green."],
['R', 'fiona-shout', "Oh no, I'm talking to a computer!"],
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
['L', 'dolores-say', "The datacenter is just beyond this trading floor."],
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
['L', 'angelica-happy', "I will get a can of gas at the station and set this datacenter on fire."],
  ],

  epilogue: [
['R', 'fiona-shout', "Hey, Mom."],
['L', 'mom-say', "Fiona! It's so nice of you to call."],
['R', 'fiona-smile', "I'm here with Dolores."],
['R', 'dolores-laugh', "Hey, Mom."],
['L', 'mom-say', "Dolores! Is Fiona cooking for you?"],
['L', 'mom-smile', "I hear some sizzling in the background."],
['R', 'fiona-smile', "Yeah, I'm cooking."],
['R', 'fiona-laugh', "We're having a datacenter barbecue."],
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
['R', 'marilyn-smile', "The Conglomerate may have crushed me, but I am not so easy to kill."],
['R', 'fiona-say', "We have settled the accounts today, team."],
['R', 'fiona-laugh', "High five!"],
[null, null, "<i>The end. Thanks for playing!</i>"],
  ],

};

function playMusic() {
  new Howl({
    src: map.music || 'silence30.mp3',
    autoplay: true,
    loop: true,
    volume: 0.5,
    onend: () => playMusic(),
  });
}

preloadPics();
setMap('demo');
playMusic();
animate();
