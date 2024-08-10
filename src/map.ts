import * as ls from 'littlejsengine';

import map1 from "./levels/level.json"

type MapLayer = {
    data: number[];
    height: number;
    id: number;
    name: string;
    opacity: number;
    type: "tilelayer";
    visible: boolean;
    width: number;
    x: number;
    y: number;
};

type Tileset = {
    columns: number;
    firstgid: number;
    image: string;
    imageheight: number;
    imagewidth: number;
    margin: number;
    name: string;
    spacing: number;
    tilecount: number;
    tileheight: number;
    tilewidth: number;
};

type TileMap = {
    compressionlevel: number;
    height: number;
    infinite: boolean;
    layers: MapLayer[];
    nextlayerid: number;
    nextobjectid: number;
    orientation: string;
    renderorder: string;
    tiledversion: string;
    tileheight: number;
    tilesets: Tileset[];
    tilewidth: number;
    type: "map";
    version: string;
    width: number;
};

export const maps: TileMap[] = [
    map1 as TileMap
];

/**
 * Load an entire tiled tilemap.
 * @param map 
 */
export function loadMap(map: TileMap) {
    const tileLayers: ls.TileLayer[] = [];

    for (let i = 0; i < map.layers.length; i++) {
        const tileLayer = loadLayer(map.layers[i]);
        tileLayer.renderOrder = -1e3 + i;

        tileLayers.push(tileLayer);
    }

    tileLayers.forEach(t => t.redraw());
}

/**
 * Load a single layer of the tiled tilemap.
 * @param layer 
 * @returns 
 */
function loadLayer(layer: MapLayer): ls.TileLayer {
    const size = ls.vec2(layer.width, layer.height);
    const tileLayer = new ls.TileLayer(ls.vec2(-size.x / 4, -size.y / 4), size, ls.tile(0, 16, 1));

    for (let x = 0; x < size.x; x++) {
        for (let y = 0; y < size.y; y++) {
            const pos = ls.vec2(x, size.y - 1 - y);
            const tile = layer.data[y * size.x + x];

            const data = new ls.TileLayerData(tile - 1);
            tileLayer.setData(pos, data);
        }
    }

    return tileLayer;
}