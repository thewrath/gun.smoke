'use strict';

import * as ls from 'littlejsengine';

import { Entity } from "./entityFactory";
import { World, With } from 'miniplex';

export type Lifetime = number; // lifetime in number of frame

const trackedEntities: Map<number, With<Entity, "lifetime">[]> = new Map();

/**
 * Initialize lifetime system.
 * Lifetime system use world events to process entities. 
 * 
 * @param world 
 */
export function initLifetimeSystem(world: World<Entity>): void {
    world.with("lifetime").onEntityAdded.subscribe((e) => {
        const frame = ls.frame + e.lifetime;

        let entitiesForFrame = trackedEntities.get(frame);

        if (entitiesForFrame == undefined) {
            entitiesForFrame = [e];
        } else {
            entitiesForFrame.push(e);
        }

        trackedEntities.set(frame, entitiesForFrame);
    });
}

/**
 * Process entity lifetime.
 * 
 * @param world 
 */
export function updateLifetimeSystem(world: World<Entity>): void {
    const frame = ls.frame;
    const entitiesToKill = trackedEntities.get(frame);

    if (entitiesToKill) {
        for (const e of entitiesToKill) {
            world.removeComponent(e, 'lifetime');
            world.remove(e);
        }

        trackedEntities.delete(frame);
    }
}