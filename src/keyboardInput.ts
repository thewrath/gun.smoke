'use strict';

export type KeyboardInput<T> = {
    keys: string[],
    data: T
}

/**
 * Checks whether all the keys validate the keyEvent.
 * 
 * @param keys 
 * @param keyEvent 
 * @returns 
 */
export function areAll(keys: string[], keyEvent: (key: string) => boolean): boolean {
    return keys.reduce((acc, k) => acc && keyEvent(k), true);
}

/**
 * Checks whether one of the keys validates the keyEvent.
 * 
 * @param keys 
 * @param keyEvent 
 * @returns 
 */
export function isAny(keys: string[], keyEvent: (key: string) => boolean): boolean {
    return keys.reduce((acc, k) => acc || keyEvent(k), false);
}