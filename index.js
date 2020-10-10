import 'ol/ol.css';
import Draw from 'ol/interaction/Draw';
import Map from 'ol/Map';
import View from 'ol/View';
import { OSM, Vector as VectorSource } from 'ol/source';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import GeoJSON from 'ol/format/GeoJSON';
import Feature from 'ol/Feature';

import { sendFeatures, getFeatures } from './service'



var raster = new TileLayer({
    source: new OSM(),
});

var drawings = [];

var source = new VectorSource({ wrapX: false });

var vector = new VectorLayer({
    source: source,
    renderBuffer: 100000
});

var map = new Map({
    layers: [raster, vector],
    target: 'map',
    view: new View({
        center: [-11000000, 4600000],
        zoom: 4,
    }),
});

var typeSelect = document.getElementById('type');

var draw; // global so we can remove it later
function addInteraction() {
    var value = typeSelect.value;

    if (value !== 'None') {
        draw = new Draw({
            source: source,
            type: typeSelect.value,
        });
        map.addInteraction(draw);
        draw.on('drawend', function (evt) {
            sendFeatures(drawings);
            console.log('drawend');
            var format = new GeoJSON();
            var geom = evt.feature.getGeometry();
            geom.transform('EPSG:3857', 'EPSG:4326');
            var feature = new Feature({
                geometry: geom
            });
            var obj = format.writeFeatures([feature]);
            drawings.push(JSON.parse(obj));
            console.log(drawings);
        });
    }
}

/**
 * Handle change event.
 */
typeSelect.onchange = function () {
    map.removeInteraction(draw);
    addInteraction();
};

addInteraction();

