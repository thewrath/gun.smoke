import * as ls from 'littlejsengine';

export type ParticleOptions = {
    position: ls.Vector2;
    angle: number;
    emitSize?: number;
    emitTime?: number;
    emitRate?: number;
    emitConeAngle?: number;
    tileInfo: ls.TileInfo;
    colorStartA?: ls.Color;
    colorStartB?: ls.Color;
    colorEndA?: ls.Color;
    colorEndB?: ls.Color;
    particleTime?: number;
    sizeStart?: number;
    sizeEnd?: number;
    speed?: number;
    angleSpeed?: number;
    damping?: number;
    angleDamping?: number;
    gravityScale?: number;
    particleConeAngle?: number;
    fadeRate?: number;
    randomness?: number;
    collideTiles?: boolean;
    additive?: boolean;
    randomColorLinear?: boolean;
    renderOrder?: number;
    localSpace?: boolean;
};

export function createParticleEmitter(opt: ParticleOptions): ls.ParticleEmitter {
    return new ls.ParticleEmitter(
        opt.position,
        opt.angle,
        opt.emitSize ?? 0,
        opt.emitTime ?? 0,
        opt.emitRate ?? 100,
        opt.emitConeAngle ?? Math.PI,
        opt.tileInfo,
        opt.colorStartA ?? new ls.Color(),
        opt.colorStartB ?? new ls.Color(),
        opt.colorEndA ?? new ls.Color(1, 1, 1, 0),
        opt.colorEndB ?? new ls.Color(1, 1, 1, 0),
        opt.particleTime ?? 0.5,
        opt.sizeStart ?? 0.1,
        opt.sizeEnd ?? 1,
        opt.speed ?? 0.1,
        opt.angleSpeed ?? 0.05,
        opt.damping ?? 1,
        opt.angleDamping ?? 1,
        opt.gravityScale ?? 0,
        opt.particleConeAngle ?? Math.PI,
        opt.fadeRate ?? 0.1,
        opt.randomness ?? 0.2,
        opt.collideTiles ?? false,
        opt.additive ?? false,
        opt.randomColorLinear ?? true,
        opt.renderOrder ?? (opt.additive ? 1e9 : 0),
        opt.localSpace ?? false
    );
}
