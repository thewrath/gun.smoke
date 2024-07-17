'use strict';

// import ressources
import tiles from './tiles.png';

// import module
import * as ltjs from 'littlejsengine';
import { World } from 'miniplex';

// LittleJS settings
ltjs.setCameraScale(32);
ltjs.setShowSplashScreen(!ltjs.debug);
// ltjs.setCanvasMaxSize(ltjs.vec2(1280, 720));

const size = ltjs.vec2(1);
const minSpeed = 0.01;
const maxSpeed = 0.03;

const numberOfEntities = 100;

const world: World<Entity> = new World<Entity>();

type Entity = {
  position: ltjs.Vector2,
  velocity: ltjs.Vector2,
  tileInfo?: ltjs.TileInfo,
  rock?: EntityType,
  paper?: EntityType,
  cisor?: EntityType,
  target?: Entity
};

type EntityTypeName = "rock" | "paper" | "cisor";

interface EntityType {
  tileInfo: ltjs.TileInfo
  typeName: EntityTypeName,
  enemyTypeName: EntityTypeName
}

let worldSize: ltjs.Vector2 | undefined = undefined;
let entityTypes: ReadonlyMap<EntityTypeName, EntityType>;
let randomGenerator: ltjs.RandomGenerator;
let isPaused = false;
let isStarted = false;
let currentTheme = 0;

let queries = {
  attacking: world.with("position", "velocity", "target"),
  drawing: world.with("position", "tileInfo"),
  types: {
    "rock": world.with("position", "rock"),
    "paper": world.with("position", "paper"),
    "cisor": world.with("position", "cisor"),
  }
}

function initGame() {
  randomGenerator = new ltjs.RandomGenerator(Date.now());

  _changeTheme();

  window.addEventListener("resize", () => {
    _computeWorldSize();
  });

  _initPostProcess();
}

function _changeTheme() {

  entityTypes = new Map([
    ["rock", { tileInfo: ltjs.tile(0+currentTheme, 64), typeName: "rock", enemyTypeName: "cisor" }],
    ["paper", { tileInfo: ltjs.tile(1+currentTheme, 64), typeName: "cisor", enemyTypeName: "paper" }],
    ["cisor", { tileInfo: ltjs.tile(2+currentTheme, 64), typeName: "paper", enemyTypeName: "rock" }],
  ]);

  currentTheme = (currentTheme + 3) % 6;
}

function _computeWorldSize() {
  worldSize = ltjs.mainCanvasSize.scale(1/ltjs.cameraScale);
}

function _resetWorld(worldSize: ltjs.Vector2) {
  world.clear();

  for (let i = 0; i < numberOfEntities; i++) {
    world.add(_initEntity(_pickRandomEntityType(), worldSize));
  }
}

function _pickRandomEntityType(): EntityType {
  const keys = Array.from(entityTypes.keys());
  const type = keys[randomGenerator.int(keys.length)];

  return entityTypes.get(type)!;
}

function _initEntity(type: EntityType, worldSize: ltjs.Vector2): Entity {  
  return {
    position: ltjs.vec2(randomGenerator.int(-worldSize.x, worldSize.x), randomGenerator.int(-worldSize.y, worldSize.y)),
    velocity: ltjs.vec2(randomGenerator.float(minSpeed, maxSpeed), randomGenerator.float(minSpeed, maxSpeed)),
    tileInfo: type.tileInfo,
    [type.typeName]: type
  };
}

function updateGame() {
  _menu();

  if (!isPaused) {
    _selectTargets();
    _goToTarget();
    _solveConflicts();
  }
}

function _menu() {
  if (!worldSize) {
    _computeWorldSize();
  }

  if (ltjs.keyWasPressed("Space")) {
    if (!isStarted && world.size == 0 && worldSize) {
      _resetWorld(worldSize);
      isPaused = false;
      isStarted = true;
    } else {
      isPaused = !isPaused;
    }
  }

  if (!isStarted && ltjs.keyWasPressed("Enter")) {
    _changeTheme();
  }
}

function _selectTargets() {
  entityTypes.forEach(type => {
    const allies = queries.types[type.typeName];
    const enemies = queries.types[type.enemyTypeName];

    for (const ally of allies) {
      let [nearestEnemy, ...otherEnemies] = enemies;

      for (const e of otherEnemies) {
        if (ally.position.distance(e.position) < ally.position.distance(nearestEnemy.position)) {
          nearestEnemy = e;
        }
      }

      if (nearestEnemy) {
        world.addComponent(ally, "target", nearestEnemy);
      } else {
        world.removeComponent(ally, "target");
      }
    }
  })
}

function _solveConflicts() {
  entityTypes.forEach(type => {
    const allies = queries.types[type.typeName];
    const enemies = queries.types[type.enemyTypeName];

    for (const { position: aPos } of allies) {
      for (const enemy of enemies) {
        if (ltjs.isOverlapping(aPos, size, enemy.position, size)) {
          world.removeComponent(enemy, type.enemyTypeName);
          world.addComponent(enemy, type.typeName, type);
          enemy.tileInfo = type.tileInfo;
          for (const e of queries.attacking) {
            world.removeComponent(e, "target");
          }
        }
      }
    }
  });
}

function _goToTarget() {
  for (const e of queries.attacking) {
    const newPos = _moveTowards(e.target.position, e.position, e.velocity);
    if (newPos.distance(e.position) == 0) {
      world.removeComponent(e, "target");
    } else {
      e.position = newPos;
    }
  }
}

function renderGame() {
  _renderEntities();
  _renderDebug();
  _renderMenu();
}

function _renderEntities() {
  for (const { position, tileInfo } of queries.drawing) {
    ltjs.drawTile(position, size, tileInfo);
  }
}

function _renderDebug() {
  if (!ltjs.debugOverlay) return;

  for (const { position } of queries.drawing) {
    ltjs.debugRect(position, size);
  }

  for (const { position, target } of queries.attacking) {
    if (ltjs.isOverlapping(position, size, ltjs.mousePos, ltjs.vec2(1, 1))) {
      ltjs.drawLine(position, target.position);
    }
  }
}

function _renderMenu() {
  if (isStarted && !isPaused) return;

  let i = 0;
  for (const [_, type] of entityTypes) {
    ltjs.drawTile(ltjs.vec2(i, 0), size, type.tileInfo);
    i += size.x;
  }
}

function renderPostGame() {
  _renderPostScore();
}

function _renderPostScore() {
  const counters = Object.entries(queries.types).reduce((acc: Map<EntityTypeName, number>, [k, q]) => {
    acc.set(k as EntityTypeName, q.size);
    return acc;
  }, new Map());

  const drawText =(() => {
    let offset = ltjs.vec2(0, 0);
    return ((text:string, x: number, y:number, size=40) => {
      const pos = ltjs.vec2(x, y).add(offset);

      ltjs.overlayContext.textAlign = 'left';
      ltjs.overlayContext.textBaseline = 'top';
      ltjs.overlayContext.font = size + 'px arial';
      ltjs.overlayContext.fillStyle = '#fff';
      ltjs.overlayContext.lineWidth = 3;
      ltjs.overlayContext.strokeText(text, pos.x, pos.y);
      ltjs.overlayContext.fillText(text, pos.x, pos.y);

      offset.y += size + (20/100*size);
    });
  })();
    
  for (const [k, c] of counters) {
    drawText(`${_capitalizeString(k)}: ${c}`, 50, 50, 24);
  }
}

ltjs.engineInit(
  initGame,
  updateGame,
  () => { },
  renderGame,
  renderPostGame,
  [tiles]
);

/// Utils

function _moveTowards(targetPos: ltjs.Vector2, currentPos: ltjs.Vector2, velocity: ltjs.Vector2) {
  const delta = targetPos.subtract(currentPos);

  if (delta.length() === 0) return currentPos; // Already at the target

  return currentPos.add(delta.normalize().multiply(velocity));
}

function _capitalizeString(str: string): string {
  const [head, ...tail] = str.toLowerCase().split('');
  return [head.toUpperCase()].concat(tail).join('');
}

function _initPostProcess() {
  const televisionShader = `
  // Simple TV Shader Code
  float hash(vec2 p)
  {
      p=fract(p*.3197);
      return fract(1.+sin(51.*p.x+73.*p.y)*13753.3);
  }
  float noise(vec2 p)
  {
      vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);
      return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+1.),u.x),u.y);
  }
  void mainImage(out vec4 c, vec2 p)
  {
      // put uv in texture pixel space
      p /= iResolution.xy;

      // apply fuzz as horizontal offset
      const float fuzz = .0005;
      const float fuzzScale = 800.;
      const float fuzzSpeed = 9.;
      p.x += fuzz*(noise(vec2(p.y*fuzzScale, iTime*fuzzSpeed))*2.-1.);

      // init output color
      c = texture(iChannel0, p);

      // chromatic aberration
      const float chromatic = .002;
      c.r = texture(iChannel0, p - vec2(chromatic,0)).r;
      c.b = texture(iChannel0, p + vec2(chromatic,0)).b;

      // tv static noise
      const float staticNoise = .1;
      c += staticNoise * hash(p + mod(iTime, 1e3));

      // scan lines
      const float scanlineScale = 1e3;
      const float scanlineAlpha = .1;
      c *= 1. + scanlineAlpha*sin(p.y*scanlineScale);

      // black vignette around edges
      const float vignette = 2.;
      const float vignettePow = 6.;
      float dx = 2.*p.x-1., dy = 2.*p.y-1.;
      c *= 1.-pow((dx*dx + dy*dy)/vignette, vignettePow);
  }`;

  const includeOverlay = true;
  ltjs.glInitPostProcess(televisionShader, includeOverlay);
}

/**
 * Todo :
 * - select a team (outil d'aide à la prise de decision lol)
 * - relaunch game
 * - display the winner
 * - change theme (apple - google - twitter)
 */ 