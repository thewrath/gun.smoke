'use strict';

import * as ls from 'littlejsengine';

import { Animator } from './animator';
import { KeyboardInput } from './keyboardInput';
import { Lifetime } from './lifetimeSystem';
import { Gun, BulletDirection, bulletDirectionToTileInfo, bulletDirectionToVec2 } from './gunSystem';

export type Entity = {
    position: ls.Vector2,
    direction?: ls.Vector2,
    speed?: number,
    keyboardMoveInputs?: KeyboardInput<ls.Vector2>[],
    presenter?: Animator | ls.TileInfo,
    lifetime?: Lifetime,
    gun?: Gun
};

/**
 * Create new player entity.
 * 
 * @returns new plauer
 */
export function createPlayerEntity(): Entity {
    return {
        position: ls.vec2(0, 0),
        direction: ls.vec2(0, 0),
        speed: 0.1,
        keyboardMoveInputs: [
            { keys: ["ArrowUp"], data: ls.vec2(0, 1) },
            { keys: ["ArrowDown"], data: ls.vec2(0, -1) },
            { keys: ["ArrowLeft"], data: ls.vec2(-1, 0) },
            { keys: ["ArrowRight"], data: ls.vec2(1, 0) }
        ],
        gun: {
            keyboardShootInputs: [
                { keys: ["Space", "ArrowLeft"], data: BulletDirection.Right },
                { keys: ["Space", "ArrowRight"], data: BulletDirection.Left },
                { keys: ["Space"], data: BulletDirection.Up }
            ],
            bulletSpeed:  0.3,
            fireRate: 5,
            fireTimeBuffer: undefined
        },
        presenter: {
            animations: [
                {
                    name: "idle",
                    frames: [
                        ls.tile(ls.vec2(0), ls.vec2(16, 23))
                    ],
                    frameDuration: 1,
                    loop: true
                },
                {
                    name: "walking",
                    frames: [
                        ls.tile(ls.vec2(0, 0), ls.vec2(16, 23)),
                        ls.tile(ls.vec2(16, 0), ls.vec2(16, 23)),
                        ls.tile(ls.vec2(32, 0), ls.vec2(16, 23)),
                        ls.tile(ls.vec2(48, 0), ls.vec2(16, 23)),
                    ],
                    frameDuration: 0.25,
                    loop: true
                }
            ]
        }
    };
}

/**
 * Create new bullet entity.
 * 
 * @param position
 * @param direction
 * @param bulletSpeed
 * @param lifetime
 * @returns new bullet
 */
export function createBulletEntity(position: ls.Vector2, direction: BulletDirection, bulletSpeed: number, lifetime = 60): Entity {
    return {
        position: position,
        direction: bulletDirectionToVec2.get(direction),
        speed: bulletSpeed,
        presenter: bulletDirectionToTileInfo.get(direction),
        lifetime: lifetime
    }
}