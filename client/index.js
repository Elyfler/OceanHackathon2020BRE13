import 'ol/ol.css';
import Draw from 'ol/interaction/Draw';
import Map from 'ol/Map';
import View from 'ol/View';
import { OSM, Vector as VectorSource, ImageWMS } from 'ol/source';
import { Image as ImageLayer, Tile as TileLayer, Vector as VectorLayer, Layer } from 'ol/layer';
import GeoJSON from 'ol/format/GeoJSON';
import Feature from 'ol/Feature';
import { Control, defaults as defaultControls } from 'ol/control';

import { sendFeatures, getFeatures } from './service';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import Polygon from 'ol/geom/Polygon';

var rasterOSM = new TileLayer({
    title: 'OpenStreetMap',
    source: new OSM(),
    visible: true
});

var ReloadControl = /*@__PURE__*/(function (Control) {
    function ReloadControl(opt_options) {
        var options = opt_options || {};
        var button = document.createElement('button');
        button.innerHTML = 'R';

        var element = document.createElement('div');
        element.className = 'reload ol-unselectable ol-control';
        element.appendChild(button);

        Control.call(this, {
            element: element,
            target: options.target,
        });

        button.addEventListener('click', this.reload.bind(this), false);
    }

    if (Control) ReloadControl.__proto__ = Control;
    ReloadControl.prototype = Object.create(Control && Control.prototype);
    ReloadControl.prototype.constructor = ReloadControl;

    ReloadControl.prototype.reload = function reload(){
        var pointsToAdd = [];
        var polygonsToAdd = [];
        var lineStringsToAdd = [];
        getFeatures().then(
            data => {
                data.forEach(element => {
                    switch (element.type) {
                        case 'Point':
                            pointsToAdd.push(new Feature({
                                geometry: new Point(element.coordinates),
                            }))
                            break;
                        case 'LineString':
                            lineStringsToAdd.push(new Feature({
                                geometry: new LineString(element.coordinates),
                            }))
                            break;
                        case 'Polygon':
                            polygonsToAdd.push(new Feature({
                                geometry: new Polygon(element.coordinates),
                            }))
                            break;
                        default:
                            console.log('Sounds good, does not work')

                    }

                });
                pointDraw.addFeatures(pointsToAdd);
                lineStringDraw.addFeatures(lineStringsToAdd);
                polygonDraw.addFeatures(polygonsToAdd);
            }
        );
    };

    return ReloadControl;
}(Control));

var SendData = /*@__PURE__*/(function (Control) {
    function SendData(opt_options) {
        var options = opt_options || {};
        var button = document.createElement('button');
        button.innerHTML = 'S';

        var element = document.createElement('div');
        element.className = 'send ol-unselectable ol-control';
        element.appendChild(button);

        Control.call(this, {
            element: element,
            target: options.target,
        });

        button.addEventListener('click', this.send.bind(this), false);
    }

    if (Control) SendData.__proto__ = Control;
    SendData.prototype = Object.create(Control && Control.prototype);
    SendData.prototype.constructor = SendData;

    SendData.prototype.send = function send(){
        for (var i = 0; i < drawings.length; i++) {
            sendFeatures(drawings[i])
        }    };

    return SendData;
}(Control));



var raster = new TileLayer({
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

var polygonDraw = new VectorSource({})
var pointDraw = new VectorSource({})
var lineStringDraw = new VectorSource({})


var vector = new VectorLayer({
    source: source,
    renderBuffer: 100000
});

var backgroundLayers = [rasterOSM, rasterSentinel_2_1, rasterSentinel_2_2, rasterSentinel_2_3];
var layers = backgroundLayers.slice();
layers.push(vector);
layers.push(new VectorLayer({
    source: polygonDraw
}));
layers.push(new VectorLayer({
    source: pointDraw
}));
layers.push(new VectorLayer({
    source: lineStringDraw
}));

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
            draw.finishDrawing();
            console.log(evt.feature)
            var feat = evt.feature;
            console.log(feat.getGeometry())
            var data;
            switch (value) {
                case 'Point':
                    data = { type: "Point", coordinates: feat.getGeometry().getCoordinates() }
                    break;
                case 'LineString':
                    data = { type: "LineString", coordinates: feat.getGeometry().getCoordinates() }
                    break;
                case 'Polygon':
                    data = { type: "Polygon", coordinates: feat.getGeometry().getCoordinates() }
                    break;
            }
            drawings.push(data);
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

