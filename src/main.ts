'use strict';

// import ressources
import tiles from './tiles.png';

// import module
import * as LittleJS from 'littlejsengine';
import { World } from 'miniplex';

const size = LittleJS.vec2(1);
const minSpeed = 0.001;
const maxSpeed = 0.003;

const numberOfEntities = 100;

type Entity = {
  position: LittleJS.Vector2,
  velocity: LittleJS.Vector2,
  type: EntityType,
  target?: Entity
};

enum EntityType {
  Rock = 0,
  Cisor = 1,
  Paper = 2
}

let tileForType: LittleJS.TileInfo[]
let world: World<Entity>;
let randomGenerator: LittleJS.RandomGenerator;

function initGame() {

  randomGenerator = new LittleJS.RandomGenerator(Date.now());

  tileForType = [
    LittleJS.tile(0, 64),
    LittleJS.tile(1, 64),
    LittleJS.tile(2, 64),
  ];

  world = new World<Entity>();

  for (let i = 0; i < numberOfEntities; i++) {
    world.add(_initEntity(randomGenerator.int(3) as EntityType));
  }

}

function _initEntity(type: EntityType): Entity {
  return {
    position: LittleJS.vec2(randomGenerator.int(-15, 15), randomGenerator.int(-15, 15)),
    velocity: LittleJS.vec2(randomGenerator.float(minSpeed, maxSpeed), randomGenerator.float(minSpeed, maxSpeed)),
    type: type
  };
}

function updateGame() {
  _solveTarget();
  _goToTarget();
  _solveConflicts();
}

function _solveTarget() {
  [EntityType.Rock, EntityType.Cisor, EntityType.Paper].forEach(type => {
    const enemyType = (type + 1) % 3;
    const allies = world.with("position", "type").without("target").where(e => e.type == type);
    const enemies = world.with("position", "type").where(e => e.type == enemyType).entities;

    for (const ally of allies) {
      const sortedEnemies = enemies.sort((a, b) => ally.position.distance(a.position) < ally.position.distance(b.position) ? 1 : -1);
      const nearestEnemy = sortedEnemies[0];
      if (nearestEnemy) {
        world.addComponent(ally, "target", nearestEnemy);
      }
    }
  })
}

function _solveConflicts() {
  [EntityType.Rock, EntityType.Cisor, EntityType.Paper].forEach(type => {
    const enemyType = (type + 1) % 3;
    const allies = world.with("position", "type").where(e => e.type == type);
    const enemies = world.with("position", "type").where(e => e.type == enemyType);

    for (const { position: aPos } of allies) {
      for (const enemy of enemies) {
        if (_checkCollision(aPos, enemy.position, size)) {
          enemy.type = type;
        }
      }
    }
  });
}

function _goToTarget() {
  const entities = world.with("position", "velocity", "target").where(e => e.target != undefined);

  for (const e of entities) {
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
  const drawableEntities = world.with("position", "type");

  for (const { position, type } of drawableEntities) {
    LittleJS.drawTile(position, size, tileForType[type]);
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