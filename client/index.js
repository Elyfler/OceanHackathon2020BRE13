import 'ol/ol.css';
import Draw from 'ol/interaction/Draw';
import Map from 'ol/Map';
import View from 'ol/View';
import { OSM, Vector as VectorSource, ImageWMS } from 'ol/source';
import { Image as ImageLayer, Tile as TileLayer, Vector as VectorLayer, Layer } from 'ol/layer';
import GeoJSON from 'ol/format/GeoJSON';
import Feature from 'ol/Feature';

import { sendFeatures, getFeatures } from './service'


console.log("Hello");
var rasterOSM = new TileLayer({
    title: 'OpenStreetMap',
    source: new OSM(),
    visible: true
});

var urlWMSGeoBretagne = "https://geobretagne.fr/geoserver/eo/wms";
var rasterSentinel_2_1 = new ImageLayer({
    title: 'Sentinel2 vraies couleurs',
    source: new ImageWMS({
        url: urlWMSGeoBretagne,
        params: {"LAYERS": "COMPOCOL_VC_LAST_ACQ_CC_INF10", "SERVICE": "WMS"}
    }),
    visible: false
});

var rasterSentinel_2_2 = new ImageLayer({
    title: 'Sentinel2 végétation',
    source: new ImageWMS({
        url: urlWMSGeoBretagne,
        params: {"LAYERS": "COMPOCOL_VEG_LAST_ACQ_CC_INF10", "SERVICE": "WMS"}
    }),
    visible: false
});

var rasterSentinel_2_3 = new ImageLayer({
    title: 'Sentinel2 indice de végétation',
    source: new ImageWMS({
        url: urlWMSGeoBretagne,
        params: {"LAYERS": "NDVI_LAST_ACQ_CC_INF10", "SERVICE": "WMS"}
    }),
    visible: false
});



var drawings = [];

var source = new VectorSource({ wrapX: false });


var vector = new VectorLayer({
    source: source,
    renderBuffer: 100000
});

var backgroundLayers = [rasterOSM, rasterSentinel_2_1, rasterSentinel_2_2, rasterSentinel_2_3];
var layers = backgroundLayers.slice();
layers.push(vector);

var map = new Map({
    layers: layers,
    target: 'map',
    view: new View({
        center: [-11000000, 4600000],
        zoom: 4,
    }),
});




var layerSelect = document.getElementById('layer');
function updateLayersVisibility(){
    var layersNb = backgroundLayers.length;
    for (var i=0; i<layersNb; i++) {
        var layer = backgroundLayers[i];
        console.log(layerSelect.value);
        if (i == layerSelect.value){
            layer.setVisible(true);
        }
        else{
            layer.setVisible(false);
        }
    };
};
console.log(updateLayersVisibility);

layerSelect.onchange = function () {
    updateLayersVisibility();
};


var typeSelect = document.getElementById('type');
var reload = document.getElementById('reload');

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
            // sendFeatures(drawings);

            const obj = exportGEOJSON(evt)
            drawings.push(obj);
            console.log(drawings);
        });
    }
}
//Take geometry as input, return GEOJSON type
function exportGEOJSON(e) {
    var geom = e.feature.getGeometry();

    var format = new GeoJSON();
    geom.transform('EPSG:3857', 'EPSG:4326');
    var feature = new Feature({
        geometry: geom
    });
    return format.writeFeature(feature);

}

/**
 * Handle change event.
 */
typeSelect.onchange = function () {
    map.removeInteraction(draw);
    addInteraction();
};



addInteraction();

reload.onclick = function () {
    getFeatures();
}