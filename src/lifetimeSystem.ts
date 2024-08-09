import * as ls from 'littlejsengine';

import { Entity } from "./entityFactory";
import { World, With } from 'miniplex';
import { createParticleEmitter, ParticleOptions } from './particlesUtils';

export type Life = {
    lifetime: number, // lifetime in number of frame
    onDieParticles?: ParticleOptions
}; // TODO maybe later it will be good to have he ability to define lifes so an entity will be lifetime based OR lifes based

const trackedEntities: Map<number, With<Entity, "life">[]> = new Map();

/**
 * Initialize lifetime system.
 * Lifetime system use world events to process entities. 
 *
 * @param world 
 */
export function initLifetimeSystem(world: World<Entity>): void {
    world.with("life").onEntityAdded.subscribe((e) => {
        const frame = ls.frame + e.life.lifetime;

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
            if (e.life.onDieParticles != undefined) {
                createParticleEmitter({ ...e.life.onDieParticles, position: e.position });
            }

            world.removeComponent(e, 'life');
            world.remove(e);
        }

        trackedEntities.delete(frame);
    }
}