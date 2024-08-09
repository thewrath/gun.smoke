import * as ls from 'littlejsengine';

import { tileSize as tileSourceSize } from './constants';
import { World } from 'miniplex';
import { createBulletEntity, Entity } from './entityFactory';
import { InputController } from './inputController';

export enum BulletDirection { Up, Left, Right };

export const bulletDirectionToVec2: Map<BulletDirection, ls.Vector2> = new Map([
  [BulletDirection.Up, ls.vec2(0, 1)],
  [BulletDirection.Left, ls.vec2(-0.5, 0.5)],
  [BulletDirection.Right, ls.vec2(0.5, 0.5)]
]);

export const bulletDirectionToTileInfo: Map<BulletDirection, ls.TileInfo> = new Map([
  [BulletDirection.Up, ls.tile(ls.vec2(32, 23), tileSourceSize)],
  [BulletDirection.Left, ls.tile(ls.vec2(16, 23), tileSourceSize)],
  [BulletDirection.Right, ls.tile(ls.vec2(64, 23), tileSourceSize)]
]);

export type Gun = {
  shootInputController: InputController<BulletDirection>,
  fireRate: number // bullet per second 
  fireTimeBuffer?: number,
  bulletSpeed: number,
  bulletLifetime?: number,
  bulletPattern: ls.Vector2[]
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

    const triggeredInputData = gun.shootInputController.getFirstTriggered();

    if (triggeredInputData) {

      // Try to fire
      for (; gun.fireTimeBuffer > 0; gun.fireTimeBuffer -= 1 / gun.fireRate) {
        for (const offset of gun.bulletPattern) {
          world.add(createBulletEntity(e.position.add(offset), triggeredInputData, gun.bulletSpeed, gun.bulletLifetime));
        }
      }
    } else {
      gun.fireTimeBuffer = ls.min(gun.fireTimeBuffer, 0);
    }
  }
}