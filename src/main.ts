'use strict';

// import ressources
import tiles from './tiles.png';

// import module
import * as ls from 'littlejsengine';
import { World } from 'miniplex';

import { AnimatorComputeCurrentTile, AnimatorSetCurrentAnimation } from './animator';
import { createBulletEntity, createPlayerEntity, Entity, BulletDirection } from './entityFactory';
import { areAll } from './keyboardInput';
import { initLifetimeSystem, updateLifetimeSystem } from './lifetimeSystem';

// LittleJS settings
ls.setCameraScale(32);
ls.setShowSplashScreen(!ls.debug);
ls.setInputWASDEmulateDirection(true);
// ltjs.setCanvasMaxSize(ltjs.vec2(1280, 720));

const tileSize = ls.vec2(1, 23 / 16);

const world: World<Entity> = new World<Entity>();

let randomGenerator: ls.RandomGenerator;

let queries = {
  drawable: world.with('position', 'presenter'),
  movable: world.with('position', 'direction', 'speed'),
  drivable: world.with('keyboardMoveInputs', 'direction'),
  shooter: world.with('keyboardShootInputs', 'position')
}

function initGame() {
  randomGenerator = new ls.RandomGenerator(Date.now());

  world.add(createPlayerEntity());

  // Init sub-system
  initLifetimeSystem(world);
}

function updateGame() {
  _drivesEntities();
  _moveEntities();
  _shoot();
  updateLifetimeSystem(world);
}

function renderGame() {
  _renderEntities();
  _renderDebug();
}

/// Systems

function _drivesEntities() {
  for (const e of queries.drivable) {
    const newDirection = e.keyboardMoveInputs.reduce((acc, kvi) => {
      if (areAll(kvi.keys, ls.keyIsDown)) {
        return acc.add(kvi.data);
      }

      return acc;
    }, ls.vec2(0))

    e.direction.x = newDirection.x;
    e.direction.y = newDirection.y;
  }

  for (const { presenter, direction } of queries.drivable.with("presenter")) {
    if ("animations" in presenter) {
      if (direction.length() > 0) {
        AnimatorSetCurrentAnimation(presenter, "walking");
      } else {
        AnimatorSetCurrentAnimation(presenter, "idle");
      }
    }
  }
}

function _moveEntities() {
  for (const { position, direction, speed } of queries.movable) {
    if (direction.length() == 0) continue;

    const newPos = position.add(direction.normalize(speed));

    // EMA
    const boundaries = _worldBoundaries().divide(ls.vec2(2)).subtract(tileSize);

    position.x = ls.max(-boundaries.x, ls.min(newPos.x, boundaries.x));
    position.y = ls.max(-boundaries.y, ls.min(newPos.y, boundaries.y));
  }
}

function _shoot() {
  for (const e of queries.shooter) {
    const triggeredInput = e.keyboardShootInputs.find(kvi => {
      return areAll(kvi.keys, ls.keyIsDown);
    });

    if (triggeredInput) {
      world.add(createBulletEntity(e.position.copy(), triggeredInput.data));
    }
  }
}

function _renderEntities() {
  for (const e of queries.drawable) {
    let tile: ls.TileInfo | undefined = undefined;
    if ("animations" in e.presenter) {
      const anim = e.presenter.currentAnimation;
      if (!anim) continue;

      tile = AnimatorComputeCurrentTile(anim);
    } else {
      tile = e.presenter;
    }

    if (tile) {
      ls.drawTile(e.position, tileSize, tile);
    }
  }
}

function _renderDebug() {
  if (!ls.debugOverlay) return;

  for (const { position } of queries.drawable) {
    ls.debugRect(position, tileSize);
  }
}

ls.engineInit(
  initGame,
  updateGame,
  () => { },
  renderGame,
  () => { },
  [tiles]
);

/// Utils

function _worldBoundaries() {
  return ls.mainCanvasSize.scale(1 / ls.cameraScale);
}