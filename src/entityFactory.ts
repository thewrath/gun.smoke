'use strict';

import * as ls from 'littlejsengine';
import { Animator } from './animator';
import { tileSize } from './constants';
import { KeyboardInput } from './keyboardInput';
import { Lifetime } from './lifetimeSystem';

export type Entity = {
    position: ls.Vector2,
    direction?: ls.Vector2,
    speed?: number,
    keyboardMoveInputs?: KeyboardInput<ls.Vector2>[],
    keyboardShootInputs?: KeyboardInput<BulletDirection>[],
    presenter?: Animator | ls.TileInfo,
    lifetime?: Lifetime
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
        keyboardShootInputs: [
            { keys: ["Space", "ArrowLeft"], data: BulletDirection.Right },
            { keys: ["Space", "ArrowRight"], data: BulletDirection.Left },
            { keys: ["Space"], data: BulletDirection.Up }
        ],
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

export enum BulletDirection { Up, Left, Right };

const bulletDirectionToVec2: Map<BulletDirection, ls.Vector2> = new Map([
    [BulletDirection.Up, ls.vec2(0, 1)],
    [BulletDirection.Left, ls.vec2(-0.5, 0.5)],
    [BulletDirection.Right, ls.vec2(0.5, 0.5)]
]);

const bulletDirectionToTileInfo: Map<BulletDirection, ls.TileInfo> = new Map([
    [BulletDirection.Up, ls.tile(ls.vec2(48, 23), tileSize)],
    [BulletDirection.Left, ls.tile(ls.vec2(32, 23), tileSize)],
    [BulletDirection.Right, ls.tile(ls.vec2(64, 23), tileSize)]
]);

/**
 * Create new bullet entity.
 * 
 * @param position
 * @param direction
 * @returns new bullet
 */
export function createBulletEntity(position: ls.Vector2, direction: BulletDirection): Entity {
    return {
        position: position,
        direction: bulletDirectionToVec2.get(direction),
        speed: 0.1,
        presenter: bulletDirectionToTileInfo.get(direction),
        lifetime: 5*60
    }
}