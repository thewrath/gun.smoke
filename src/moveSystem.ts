import * as ls from 'littlejsengine';

import { World } from "miniplex";
import { Entity } from "./entityFactory";

// TODO: clash with tilesize in constant
const tileSize = ls.vec2(1, 23 / 16);

/**
 * Process movements for entities.
 * 
 * @param world 
 */
export function updateMoveSystem(world: World<Entity>) {
    for (const { position, direction, speed } of world.with('position', 'direction', 'speed')) {
        if (direction.length() == 0) continue;

        const newPos = position.add(direction.normalize(speed));

        // EMA
        const boundaries = _worldBoundaries().divide(ls.vec2(2)).subtract(tileSize);

        position.x = ls.max(-boundaries.x, ls.min(newPos.x, boundaries.x));
        position.y = ls.max(-boundaries.y, ls.min(newPos.y, boundaries.y));
    }
}

/**
 * Get the world boundaries.
 * @returns 
 */
function _worldBoundaries() {
    return ls.mainCanvasSize.scale(1 / ls.cameraScale);
}