import * as ls from 'littlejsengine';

import { Animator } from './animator';
import { Life } from './lifetimeSystem';
import { Gun, BulletDirection, bulletDirectionToTileInfo, bulletDirectionToVec2 } from './gunSystem';
import { areAll, GamepadInputController, InputController } from './inputController';

export type Entity = {
    position: ls.Vector2,
    direction?: ls.Vector2,
    speed?: number,
    moveInputController?: InputController<ls.Vector2>,
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
        moveInputController: new GamepadInputController([
            { buttons: [4], data: ls.vec2(0, 1), activator: areAll },
            { buttons: [6], data: ls.vec2(0, -1), activator: areAll },
            { buttons: [7], data: ls.vec2(-1, 0), activator: areAll },
            { buttons: [5], data: ls.vec2(1, 0), activator: areAll }
        ]),
        gun: {
            shootInputController: new GamepadInputController([
                { buttons: [1], data: BulletDirection.Right, activator: areAll },
                { buttons: [2], data: BulletDirection.Left, activator: areAll },
                { buttons: [3], data: BulletDirection.Up, activator: areAll }
            ]),
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