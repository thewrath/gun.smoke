'use strict';

import * as ls from 'littlejsengine';

import { Animator } from './animator';
import { KeyboardInput } from './keyboardInput';
import { Life } from './lifetimeSystem';
import { Gun, BulletDirection, bulletDirectionToTileInfo, bulletDirectionToVec2 } from './gunSystem';

export type Entity = {
    position: ls.Vector2,
    direction?: ls.Vector2,
    speed?: number,
    keyboardMoveInputs?: KeyboardInput<ls.Vector2>[],
    presenter?: Animator | ls.TileInfo,
    life?: Life,
    gun?: Gun
};

/**
 * Create new player entity.
 * 
 * @returns new player
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
                { keys: ["KeyE"], data: BulletDirection.Right },
                { keys: ["KeyQ"], data: BulletDirection.Left },
                { keys: ["KeyW"], data: BulletDirection.Up }
            ],
            bulletSpeed: 0.3,
            bulletPattern: [ls.vec2(-0.25, 0), ls.vec2(.25, 0)],
            fireRate: 5,
            fireTimeBuffer: undefined,
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
 * Create new enemy entity.
 * 
 * @returns new enemy
 */
export function createEnemyEntity(): Entity {
    return {
        position: ls.vec2(0, 0),
        direction: ls.vec2(0, 0),
        speed: 0.1,
        presenter: {
            initialAnimationName: "idle",
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
        life: {
            lifetime: lifetime,
            onDieParticles: {
                position: position,
                angle: 0,
                emitSize: 0,
                emitTime: .1,
                emitRate: 100,
                emitConeAngle: .5,
                tileInfo: ls.tile(ls.vec2(64, 0), ls.vec2(16, 23)),
                colorStartA: ls.rgb(1, 1, 0),
                colorStartB: ls.rgb(1, 0, 0),
                colorEndA: ls.rgb(1, 1, 0),
                colorEndB: ls.rgb(1, 0, 0),
                particleTime: .2,
                sizeStart: .2,
                sizeEnd: 0,
                speed: .1,
                angleSpeed: .1,
                damping: 1,
                angleDamping: 1,
                gravityScale: .5,
                particleConeAngle: ls.PI,
                fadeRate: .1,
                randomness: .5,
                collideTiles: false,
                additive: true,
                randomColorLinear: false,
                renderOrder: 0,
                localSpace: false
            }
        }
    }
}