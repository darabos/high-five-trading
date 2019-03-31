
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
  for (let i = 0; i < map.size[0]; ++i) {
    const row = [];
    for (let j = 0; j < map.size[1]; ++j) {
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

function addPlayer() {
  const geo = new THREE.SphereGeometry(3, 4, 2);
  const mat = new THREE.MeshPhongMaterial( { color: 0x896215, emissive: 0x342507, flatShading: true } );
  const obj = new THREE.Mesh(geo, mat);
  scene.add(obj);
  return obj;
}

const sin = Math.sin;
const sqrt = Math.sqrt;
const floor = Math.floor;
const min = Math.min;
const max = Math.max;
const tanh = Math.tanh;
const pow = Math.pow;
const atan2 = Math.atan2;
const rnd = Math.random;

const maps = {
  tutorial: {
    size: [2, 1],
    startPos: [0, 0],
    capital: [1000, 2000],
    height: (i, j, t) => i === 0 ? 1 : (1 + 0.5 * sin(0.002 * t)),
    onStart: () => runScene('tutorial'),
    onEnd: () => runScene('tutorialDone', () => setMap('sineRipples')),
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

  hfTest: {
    size: [20, 20],
    capital: [1000, 3000],
    height: function(i, j, t) {
      return 1.1 + tanh(hf.u[i][j]);
    },
    update(dt) { hf.update(dt); },
  },

  sineRipples: {
    size: [20, 20],
    capital: [1000, 3000],
    height: function(i, j, t) {
      const phi = 0.005 * t - 0.5 * sqrt((i - 10) * (i - 10) + (j - 10) * (j - 10));
      return 1 + 0.2 * sin(phi);
    },
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
}

function ij2vec(i, j) {
  return new THREE.Vector3(
    i * 10 - 100,
    3 + 10 * map.height(i, j, t),
    j * 10);
}

let startTime;
let t;
function animate(timestamp) {
	requestAnimationFrame(animate);
  if (startTime === undefined) { startTime = timestamp; }
  const dt = timestamp - startTime - t || 0;
  t = timestamp - startTime;
  for (let i = 0; i < map.size[0]; ++i) {
    for (let j = 0; j < map.size[1]; ++j) {
      stocks[i][j].scale.y = map.height(i, j, t);
    }
  }
  const pt = ij2vec(player.i, player.j);
  player.obj.position.lerp(pt, 0.2);
  pt.y += 10;
  player.obj.lookAt(pt);
  player.obj.rotation.z = 0.01 * t;

  for (let e of effects) {
    e.update(t);
  }
  map.update && map.update(dt);
  // TODO: player weight?
  //hf.u[player.i][player.j] = -10;
  //hf.v[player.i][player.j] = -1;
	renderer.render(scene, camera);
  player.capital = floor(player.stocks * map.height(player.i, player.j, t));
  showCapital();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
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

function onKeyDown(evt) {
  const {i, j} = player;
  if (talking) {
    if (evt.key === ' ' || evt.key === 'Enter') {
      advanceTalk();
    }
    return;
  }
  if (evt.key === 'ArrowLeft' && player.i > 0) {
    player.i -= 1;
  } else if (evt.key === 'ArrowRight' && player.i < map.size[0] - 1) {
    player.i += 1;
  } else if (evt.key === 'ArrowUp' && player.j > 0) {
    player.j -= 1;
  } else if (evt.key === 'ArrowDown' && player.j < map.size[1] - 1) {
    player.j += 1;
  } else if (evt.key === 'c' && map.capital[1] <= player.capital) {
    map.onEnd();
  } else if (evt.key === ' ') {
    hf.u[player.i][player.j] = -10;
  }
  if (i !== player.i || j !== player.j) {
    const h0 = map.height(i, j, t);
    addBoom(i, j, h0 - player.buyPrice);
    const h1 = map.height(player.i, player.j, t);
    player.stocks = Math.max(10, floor(h0 * player.stocks / h1));
    player.buyPrice = h1;
  }
}
document.addEventListener('keydown', onKeyDown, false);

document.body.insertAdjacentHTML('beforeend', `
<div id="capital-string" style="
  position: absolute; top: 0; right: 15px;
  padding: 10px 0; color: white;
  font-family: sans-serif;"></div>
<div style="border: 2px solid white; position: absolute; top: 40px; right: 10px;
            width: 50px; height: calc(100vh - 50px); box-sizing: border-box;">
  <div id="capital" style="background: white; position: absolute; bottom: 0; width: calc(100% - 10px); margin: 5px;">
  </div>
</div>`);
const numberFormat = new Intl.NumberFormat('en-us');
function showCapital() {
  const pct = min(100, 100 * player.capital / map.capital[1]);
  document.getElementById('capital').style.height = `calc(${pct}% - 10px)`;
  document.getElementById('capital').style.backgroundColor = pct === 100 ? '#00ff00' : 'white';
  document.getElementById('capital-string').innerHTML = '$' + numberFormat.format((map.moneyScale || 1000) * player.capital);
}

function talk(side, pic, text) {
  let name = pic.split('-')[0];
  name = name[0].toUpperCase() + name.slice(1);
  const sign = side === 'L' ? '-' : '+';
  const transform = side === 'L' ? 'rotate3d(5, 10, -2, 10deg)' : 'rotate3d(-5, 10, -2, -10deg)';
  const talk = document.getElementById('talk');
  if (talk) {
    talk.style.left = `calc(50% ${sign} 30px)`;
    talk.children[0].style.transform = transform;
    const img = document.getElementById('talk-pic');
    img.src = `pics/${pic}.png`;
    img.style.float = side === 'L' ? 'left' : 'right';
    document.getElementById('talk-text').innerHTML = `
      <p><b>${name}:</b>
      <p>${text}`;
    return;
  }
  document.body.insertAdjacentHTML('beforeend', `
  <div id="talk" style="transition: left 0.2s ease-out; position: absolute; bottom: 0; left: calc(50% ${sign} 30px); width: calc(50% - 100px);">
    <div style="
      transition: transform 0.2s ease-out;
      position: relative; bottom: 15px; left: -50%; max-width: 500px;
      padding: 20px; background: white; transform: ${transform};
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5); font-family: sans-serif; border-radius: 10px; display: flow-root;">
      <img id="talk-pic" src="pics/${pic}.png" style="
        float: ${side === 'L' ? 'left' : 'right'}; max-width: 30vw; max-height: 30vh; border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5); margin-${side === 'L' ? 'right' : 'left'}: 10px;">
      <style>p { margin: 5px; }</style>
      <div id="talk-text">
        <p><b>${name}:</b>
        <p style="white-space: pre-wrap;">${text}
      </div>
      <div onclick="advanceTalk()" style="
        position: absolute;
        bottom: 20px;
        left: calc(50% - 50px);
        width: 100px;
        text-align: center;
        border-radius: 5px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        cursor: pointer;
      ">...</div>
    </div>
  </div>`);
}

const script = {
  tutorial: [
['L', 'mom-speak', "No.\n\n(Press Space or Enter to continue.)"],
['R', 'fiona-say', "But I can do it, Mom!"],
['L', 'mom-speak', "No. Trading stocks is more dangerous than you realize, Fiona. You cannot just use the arrow keys to move your entire portfolio into another stock."],
['R', 'fiona-shout', "Watch me!"],
  ],
  tutorialMovingBack: [
['L', 'mom-speak', "Stop right there. Our family has lost so much already!"],
['L', 'mom-sad', "Stocks are volatile. If you move back to the cash position when the stock is lower than when you invested, you will lose money."],
  ],
  tutorialOops: [
['R', 'fiona-embarrassed', "Oops. Let me try that again."],
  ],
  tutorialMoney: [
['R', 'fiona-smile-2', "I've got this, Mom! See the bar on the left side of the screen? I made us money."],
['L', 'mom-sad', "Your sister made us a lot of money too, you know."],
['R', 'fiona-embarrassed', "Please don't make this about Dolores. I'll be careful. I'll stay safe."],
['L', 'mom-speak', "Good. You just stick with this one privately traded stock. No need to enter the local stock exchange when you hit its capital requirement."],
  ],
  tutorialDone: [
['L', 'mom-speak', "You now have enough capital to enter the local stock exchange. But it's better not to press C and rather stay here in safety. Indefinitely."],
  ],
};
function preloadPics() {
  for (let scene of Object.values(script)) {
    for (let s of scene) {
      const i = new Image();
      i.src = `pics/${s[1]}.png`;
    }
  }
}
preloadPics();

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

setMap('tutorial');
animate();
