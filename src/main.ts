'use strict';

// import ressources
import tiles from './tiles.png';

// import module
import * as ls from 'littlejsengine';
import { World } from 'miniplex';

import { AnimatorComputeCurrentTile, AnimatorSetCurrentAnimation } from './animator';
import { createPlayerEntity, Entity } from './entityFactory';
import { areAll } from './keyboardInput';
import { initLifetimeSystem, updateLifetimeSystem } from './lifetimeSystem';
import { updateGunSystem } from './gunSystem';
import { updateMoveSystem } from './moveSystem';

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
  drivable: world.with('keyboardMoveInputs', 'direction'),
  shooter: world.with('gun', 'position')
}

function initGame() {
  randomGenerator = new ls.RandomGenerator(Date.now());

  world.add(createPlayerEntity());

  // Init sub-system
  initLifetimeSystem(world);
}

function updateGame() {
  _drivesEntities();
  updateMoveSystem(world);
  updateGunSystem(world);
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