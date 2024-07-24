'use strict';

// import ressources
import tiles from './tiles.png';

// import module
import * as ls from 'littlejsengine';
import { World } from 'miniplex';

// LittleJS settings
ls.setCameraScale(32);
ls.setShowSplashScreen(!ls.debug);
ls.setInputWASDEmulateDirection(true);
// ltjs.setCanvasMaxSize(ltjs.vec2(1280, 720));

const tileSize = ls.vec2(1);

const world: World<Entity> = new World<Entity>();

type Entity = {
  position: ls.Vector2,
  direction?: ls.Vector2,
  speed?: number,
  drivable?: boolean // Todo : better to provide list of input to use to drive (for example)
  tileInfo?: ls.TileInfo
};

let randomGenerator: ls.RandomGenerator;

let queries = {
  drawable: world.with('position', 'tileInfo'),
  movable: world.with('position', 'direction', 'speed'),
  drivable: world.with('drivable', 'direction')
}

function initGame() {
  randomGenerator = new ls.RandomGenerator(Date.now());

  world.add({
    position: ls.vec2(0, 0),
    direction: ls.vec2(0, 0),
    speed: 0.3,
    drivable: true,
    tileInfo: ls.tile(ls.vec2(0), ls.vec2(64))
  });
}

function updateGame() {
  _drivesEntities();
  _moveEntities();
}

function renderGame() {
  _renderEntities();
  _renderDebug();
}

/// Systems

function _drivesEntities() {
  for (const { direction } of queries.drivable) {
    const newDirection = ls.vec2(
      ls.keyIsDown('ArrowRight')? 1 : 0 - (ls.keyIsDown('ArrowLeft') ? 1 : 0), 
      ls.keyIsDown('ArrowUp')? 1 : 0 - (ls.keyIsDown('ArrowDown') ? 1 : 0)
    );

    direction.x = newDirection.x;
    direction.y = newDirection.y;
  }
}

function _moveEntities() {
  for (const { position, direction, speed } of queries.movable) {
    if (direction.length() == 0) return;
    
    const newPos = position.add(direction.normalize(speed));
    
    // EMA
    const boundaries = _worldBoundaries().divide(ls.vec2(2)).subtract(tileSize);

    position.x = ls.max(-boundaries.x, ls.min(newPos.x, boundaries.x));
    position.y = ls.max(-boundaries.y, ls.min(newPos.y, boundaries.y));
  }
}

function _renderEntities() {
  for (const e of queries.drawable) {
    ls.drawTile(e.position, tileSize, e.tileInfo);
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
  return ls.mainCanvasSize.scale(1/ls.cameraScale);
}