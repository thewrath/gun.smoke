'use strict';

import * as ls from 'littlejsengine';

import { KeyboardInput, areAll } from './keyboardInput';
import { tileSize } from './constants';
import { World } from 'miniplex';
import { createBulletEntity, Entity } from './entityFactory';

export enum BulletDirection { Up, Left, Right };

export const bulletDirectionToVec2: Map<BulletDirection, ls.Vector2> = new Map([
  [BulletDirection.Up, ls.vec2(0, 1)],
  [BulletDirection.Left, ls.vec2(-0.5, 0.5)],
  [BulletDirection.Right, ls.vec2(0.5, 0.5)]
]);

export const bulletDirectionToTileInfo: Map<BulletDirection, ls.TileInfo> = new Map([
  [BulletDirection.Up, ls.tile(ls.vec2(48, 23), tileSize)],
  [BulletDirection.Left, ls.tile(ls.vec2(32, 23), tileSize)],
  [BulletDirection.Right, ls.tile(ls.vec2(64, 23), tileSize)]
]);

export type Gun = {
  keyboardShootInputs: KeyboardInput<BulletDirection>[],
  fireRate: number // bullet per second 
  fireTimeBuffer?: number,
  bulletSpeed: number,
  bulletLifetime?: number
}

/**
 * Process bullet spawn.
 * 
 * @param world 
 */
export function updateGunSystem(world: World<Entity>): void {
  for (const e of world.with('position', 'gun')) {
    const gun = e.gun;

    gun.fireTimeBuffer ??= 0;
    gun.fireTimeBuffer += ls.timeDelta;

    // Todo: use abstract controller instead of keyboard to be able to shoot based on another trigger
    const triggeredInput = gun.keyboardShootInputs.find(kvi => {
      return areAll(kvi.keys, ls.keyIsDown);
    });

    if (triggeredInput) {

      // Try to fire
      for (; gun.fireTimeBuffer > 0; gun.fireTimeBuffer -= 1 / gun.fireRate) {
        world.add(createBulletEntity(e.position.copy(), triggeredInput.data, gun.bulletSpeed, gun.bulletLifetime));
      }
    } else {
      gun.fireTimeBuffer = ls.min(gun.fireTimeBuffer, 0);
    }
  }
}