'use strict';

// import ressources
import tiles from './tiles.png';

// import module
import * as ls from 'littlejsengine';
import { World } from 'miniplex';

import { AnimatorComputeCurrentTile, AnimatorSetCurrentAnimation } from './animator';
import { createPlayerEntity, Entity } from './entityFactory';
import { initLifetimeSystem, updateLifetimeSystem } from './lifetimeSystem';
import { updateGunSystem } from './gunSystem';
import { updateMoveSystem } from './moveSystem';

// LittleJS settings
ls.setCameraScale(32);
ls.setShowSplashScreen(!ls.debug);
ls.setInputWASDEmulateDirection(false);
ls.setTouchGamepadEnable(true);
ls.setGamepadDirectionEmulateStick(true);
ls.setTouchGamepadAnalog(false);
// ltjs.setCanvasMaxSize(ltjs.vec2(1280, 720));

// TODO: Collision layers like in Godot (simpler 🙏)

const tileSize = ls.vec2(1, 23 / 16);

const world: World<Entity> = new World<Entity>();

let queries = {
  drawable: world.with('position', 'presenter'),
  drivable: world.with('moveInputController', 'direction'),
  shooter: world.with('gun', 'position')
}

function initGame() {
  world.add(createPlayerEntity());
  // world.add(createEnemyEntity());

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
    const newDirection = e.moveInputController.getAllTriggered()?.reduce((acc, d) => acc.add(d), ls.vec2(0));

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
      // Set initial animation
      // TODO: move in animator class (create an animator class? 🤔)
      if (!e.presenter.currentAnimation && e.presenter.initialAnimationName) {
        AnimatorSetCurrentAnimation(e.presenter, e.presenter.initialAnimationName);
        e.presenter.initialAnimationName = undefined;
      }

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