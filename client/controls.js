import { getFeatures } from './service'
import { Control, defaults as defaultControls } from 'ol/control';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import Polygon from 'ol/geom/Polygon';


export var ReloadControl = /*@__PURE__*/(function (Control) {
    function ReloadControl(pointDraw, lineStringDraw, polygonDraw) {

        var button = document.createElement('button');
        button.innerHTML = 'R';

        var element = document.createElement('div');
        element.className = 'reload ol-unselectable ol-control';
        element.appendChild(button);

        Control.call(this, {
            element: element,
            target: options.target,
        });

        button.addEventListener('click', this.handleRotateNorth.bind(this), false);
    }

    if (Control) ReloadControl.__proto__ = Control;
    ReloadControl.prototype = Object.create(Control && Control.prototype);
    ReloadControl.prototype.constructor = ReloadControl;

    ReloadControl.prototype.handleRotateNorth = function handleRotateNorth() {
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