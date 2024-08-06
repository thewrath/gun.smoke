'use strict';

import * as ls from 'littlejsengine';

export interface InputController<T> {
    getAllTriggered(): T[],
    getFirstTriggered(): T | undefined
}

export type KeyboardInput<T> = {
    keys: string[],
    data: T,
    activator: InputActivator
}

export type GamepadInput<T> = {
    buttons: number[],
    data: T,
    activator: InputActivator
}

export interface InputActivator {
    (keys: (string | number)[], event: (key: string | number) => boolean): boolean
}

/**
 * Checks whether all the keys validate the keyEvent.
 * 
 * @param keys
 * @param event 
 * @returns 
 */
export function areAll(keys: (string | number)[], event: (key: string | number) => boolean): boolean {
    return keys.reduce((acc, k) => acc && event(k), true);
}

/**
 * Checks whether one of the keys validates the keyEvent.
 * 
 * @param keys 
 * @param event 
 * @returns 
 */
export function isAny(keys: (string | number)[], event: (key: string | number) => boolean): boolean {
    return keys.reduce((acc, k) => acc || event(k), false);
}

/**
 * InputController for keyboard based inputs.
 */
export class KeyboardInputController<T> implements InputController<T> {

    readonly inputs: KeyboardInput<T>[];

    constructor(inputs: KeyboardInput<T>[]) {
        this.inputs = inputs;
    }

    getAllTriggered(): T[] {
        return this.inputs.filter(kvi => areAll(kvi.keys, ls.keyIsDown)).map(kvi => kvi.data);
    }

    getFirstTriggered(): T | undefined {
        return this.inputs.find(kvi => areAll(kvi.keys, ls.keyIsDown))?.data;
    }

}

/**
 * InputController for gamepad based inputs.
 */
export class GamepadInputController<T> implements InputController<T> {

    // TODO: take this from GamepadInputs 
    readonly gamepadIndex = 0;

    readonly inputs: GamepadInput<T>[];

    constructor(inputs: GamepadInput<T>[]) {
        this.inputs = inputs;
    }

    private gamepadIsDown(button: string | number): boolean {
        if (typeof button == "string") return false;

        if (button < 4) {
            return ls.gamepadIsDown(button, this.gamepadIndex);
        }

        let analog = ls.gamepadStick(0, this.gamepadIndex);
        analog = ls.vec2(Math.round(analog.x), Math.round(analog.y));

        switch (button - 4) {
            // UP
            case 0:
                return analog.y > 0;
            // RIGHT
            case 1:
                return analog.x > 0;
            // DOWN
            case 2:
                return analog.y < 0;
            // LEFT
            case 3:
                return analog.x < 0;
            default:
                return false;
        }
    }

    getAllTriggered(): T[] {
        return this.inputs.filter(kvi => areAll(kvi.buttons, this.gamepadIsDown.bind(this))).map(kvi => kvi.data);
    }

    getFirstTriggered(): T | undefined {
        return this.inputs.find(kvi => areAll(kvi.buttons, this.gamepadIsDown.bind(this)))?.data;
    }
}