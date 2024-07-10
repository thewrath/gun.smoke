'use strict';

// import ressources
import tiles from './tiles.png';

// import module
import * as LittleJS from 'littlejsengine';
import { World } from 'miniplex';

// LittleJS settings
LittleJS.setCameraScale(32);
// LittleJS.setCanvasMaxSize(LittleJS.vec2(1280, 720));

const size = LittleJS.vec2(1);
const minSpeed = 0.01;
const maxSpeed = 0.03;

const numberOfEntities = 100;

const world: World<Entity> = new World<Entity>();

type Entity = {
  position: LittleJS.Vector2,
  velocity: LittleJS.Vector2,
  tileInfo?: LittleJS.TileInfo,
  rock?: EntityType,
  paper?: EntityType,
  cisor?: EntityType,
  target?: Entity
};

type EntityTypeName = "rock" | "paper" | "cisor";

interface EntityType {
  tileInfo: LittleJS.TileInfo
  typeName: EntityTypeName,
  enemyTypeName: EntityTypeName
}

let worldSize: LittleJS.Vector2;
let entityTypes: EntityType[];
let randomGenerator: LittleJS.RandomGenerator;

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
  // worldSize = LittleJS.screenToWorld(LittleJS.canvasMaxSize);
  worldSize = LittleJS.vec2(-15, 15);

  randomGenerator = new LittleJS.RandomGenerator(Date.now());

  entityTypes = [
    { tileInfo: LittleJS.tile(0, 64), typeName: "rock", enemyTypeName: "paper" },
    { tileInfo: LittleJS.tile(1, 64), typeName: "paper", enemyTypeName: "cisor" },
    { tileInfo: LittleJS.tile(2, 64), typeName: "cisor", enemyTypeName: "rock" },
  ]

  for (let i = 0; i < numberOfEntities; i++) {
    world.add(_initEntity(entityTypes[randomGenerator.int(3)]));
  }

  // _initPostProcess();
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
    LittleJS.glInitPostProcess(televisionShader, includeOverlay);
}

function _initEntity(type: EntityType): Entity {  
  return {
    position: LittleJS.vec2(randomGenerator.int(-worldSize.x, worldSize.x), randomGenerator.int(-worldSize.y, worldSize.y)),
    velocity: LittleJS.vec2(randomGenerator.float(minSpeed, maxSpeed), randomGenerator.float(minSpeed, maxSpeed)),
    tileInfo: type.tileInfo,
    [type.typeName]: type
  };
}

function updateGame() {
  _solveTarget();
  _goToTarget();
  _solveConflicts();
}

function _solveTarget() {
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
        if (LittleJS.isOverlapping(aPos, size, enemy.position, size)) {
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
}

function _renderEntities() {
  for (const { position, tileInfo } of queries.drawing) {
    LittleJS.drawTile(position, size, tileInfo);
  }
}

function _renderDebug() {
  if (!LittleJS.debug) return;

  for (const { position } of queries.drawing) {
    LittleJS.debugRect(position, size);
  }

  for (const { position, target } of queries.attacking) {
    if (LittleJS.isOverlapping(position, size, LittleJS.mousePos, LittleJS.vec2(1, 1))) {
      LittleJS.drawLine(position, target.position);
    }
  }
}

LittleJS.engineInit(
  initGame,
  updateGame,
  () => { },
  renderGame,
  () => { },
  [tiles]
);

/// Utils

function _checkCollision(pos1: LittleJS.Vector2, pos2: LittleJS.Vector2, size: LittleJS.Vector2) {
  return (
    pos1.x < pos2.x + size.x &&
    pos1.x + size.x > pos2.x &&
    pos1.y < pos2.y + size.y &&
    pos1.y + size.y > pos2.y
  );
}

function _moveTowards(targetPos: LittleJS.Vector2, currentPos: LittleJS.Vector2, velocity: LittleJS.Vector2) {
  const delta = targetPos.subtract(currentPos);

  if (delta.length() === 0) return currentPos; // Already at the target

  return currentPos.add(delta.normalize().multiply(velocity));
}