'use strict';

// import ressources
import tiles from './tiles.png';

// import module
import * as LittleJS from 'littlejsengine';
import { Query, With, World } from 'miniplex';

const size = LittleJS.vec2(1);
const minSpeed = 0.001;
const maxSpeed = 0.003;

const numberOfEntities = 10;

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

  randomGenerator = new LittleJS.RandomGenerator(Date.now());

  entityTypes = [
    {tileInfo: LittleJS.tile(0, 64), typeName: "rock", enemyTypeName: "paper"},
    {tileInfo: LittleJS.tile(1, 64), typeName: "paper", enemyTypeName: "cisor"},
    {tileInfo: LittleJS.tile(2, 64), typeName: "cisor", enemyTypeName: "rock"},
  ]

  for (let i = 0; i < numberOfEntities; i++) {
    world.add(_initEntity(entityTypes[randomGenerator.int(3)]));
  }
}

function _initEntity(type: EntityType): Entity {
  return {
    position: LittleJS.vec2(randomGenerator.int(-15, 15), randomGenerator.int(-15, 15)),
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
        if (_checkCollision(aPos, enemy.position, size)) {
          world.removeComponent(enemy, type.enemyTypeName);
          world.addComponent(enemy, type.typeName, type);
          enemy.tileInfo = type.tileInfo;
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
}

function _renderEntities() {
  for (const { position, tileInfo } of queries.drawing) {
    LittleJS.drawTile(position, size, tileInfo);
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

  return currentPos.add(delta.multiply(velocity));
}