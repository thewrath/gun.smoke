'use strict';

import * as ls from 'littlejsengine';

/**
 * List of tiles.
 */
export type TileSheet = ls.TileInfo[];

/**
 * A single animation definition.
 */
export type Animation = {
    name: string,
    frames: TileSheet,
    frameDuration: number,
    currentFrameIndex?: number,
    loop: boolean,
    changeAt?: number
}

/**
 * Animator component.
 */
export type Animator = {
    currentAnimation?: Animation,
    animations: Animation[]
}

/**
 * Retrieves the tile to be drawn for an animation currently playing.
 * 
 * @param animation the animation currently playing
 * @returns tileInfo to be drawn
 */
export function AnimatorComputeCurrentTile(animation: Animation): ls.TileInfo | undefined {
    animation.changeAt ??= ls.time + animation.frameDuration;
    if (animation.currentFrameIndex == undefined || (ls.time - animation.frameDuration) > animation.changeAt) {
        animation.currentFrameIndex ??= -1;
        animation.currentFrameIndex += 1;

        animation.changeAt = ls.time;

        if (animation.currentFrameIndex >= animation.frames.length) {
            if (!animation.loop) {
                return undefined;
            } else {
                animation.currentFrameIndex = 0;
            }
        }
    }

    return animation.frames[animation.currentFrameIndex];
}

/**
 * Change the animation played by the animator.
 * 
 * @param animator the animator to be controlled (will be updated).
 * @param name the name of the animation to be played.
 * @param resetIfCurrent cancel current animation if it's the same as the chosen animation.
 */
export function AnimatorSetCurrentAnimation(animator: Animator, name: string, resetIfCurrent: boolean = false): void {
    const anim = animator.animations.find(a => a.name == name);
    const currentAnim = animator.currentAnimation;
    if (anim && (currentAnim?.name != name || resetIfCurrent)) {
        animator.currentAnimation = { ...anim };
    }
}