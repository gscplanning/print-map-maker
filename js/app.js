document.getElementById('mapPicker').addEventListener('change', function() {
    var tileType = $("select option:selected").attr("class");
    console.log(tileType);
    changeTiles(this.value, tileType);
});

// Provide access token
// Requires an API key that you generate from your Mapbox account. Find yours here https://www.mapbox.com/account/apps/
L.mapbox.accessToken = 'pk.eyJ1IjoiZ3NjcGxhbm5pbmciLCJhIjoiRVZMNXpsQSJ9.5OxUlJTCDplPkdkKNlB91A';

// Create maps in the divs
var map_arf = L.map('map_arf');
var map_fbtl = L.map('map_fbtl');
var map_square540 = L.map('map_square540');
var map_square1080 = L.map('map_square1080');

var map_array = [map_arf, map_fbtl, map_square540, map_square1080]


for (var i = 0; i < map_array.length; i++) {
    map_array[i].scrollWheelZoom.disable();
}

var lineStyle = {
    'color': '#cd7139',
    'weight': 4.5,
    'opacity': 1,
    'lineJoin': 'round'
};
var polyStyle = {
    'color': '#f1c40f',
    'weight': 3,
    'opacity': 0.65,
    'fillOpacity': 0,
    'lineJoin': 'round'
};
var pointStyle = {
    radius: 8.5,
    fillColor: '#cd7139',
    color: '#fff',
    weight: 1,
    opacity: 0.3,
    fillOpacity: 0.8
};

var instructText = '<label ><strong>1. Right-click the image below to save/download.<\/strong><\/label><br/><br/><label >2. Change the resolution to 216 dpi without resampling and save as a TIFF.<\/label><br/><br/><label >3. Embed in your Adobe Illustrator document.<\/label><br/><br/><label >4. Add "Mapbox, OpenStreetMap" to your source.<\/label><br/><br/>'

var geocoder = L.mapbox.geocoder('mapbox.places-v1');

function changeTiles(value, tileType) {
    var leafletLayer = document.getElementsByClassName("leaflet-layer")
    if (leafletLayer) {
        for (var i = 0; i < leafletLayer.length; i++) {
            leafletLayer[i].remove()
        }
    }
    for (var i = 0; i < map_array.length; i++) {
        if (tileType == "google") {
            var googleLayer = new L.Google(value);
            map_array[i].addLayer(googleLayer);
        } else {
            L.tileLayer(value).addTo(map_array[i])
        }
    }
}

// Initial basemap
for (var i = 0; i < map_array.length; i++) {
    L.tileLayer('http://gscpcgis-tileify-ags-proxy.herokuapp.com/tiles/{z}/{x}/{y}?url=http%3A%2F%2Fgis.gscplanning.com%2Farcgis%2Frest%2Fservices%2Fbasemaps%2Fgscbase_streets%2FMapServer').addTo(map_array[i])
}

// Add scale bar
for (var i = 0; i < map_array.length; i++) {
    L.control.scale().addTo(map_array[i]);
}

// Set intitial bview
geocoder.query('101 e main st, georgetown, ky', showMap);

function findAddress() {
    var getInput = document.getElementById('address').value;
    geocoder.query(getInput, showMap);
}

// grab the lat long values and adjust all the maps
function findLatLon() {
    var getLat = document.getElementById('lat').value;
    var getLon = document.getElementById('lon').value;
    for (i = 0; i < map_array.length; i++) {
        map_array[i].setView([getLat, getLon], 16);
    }
}

function showMap(err, data) {
    // Fit the map bounds to an area or zooming to a point.
    if (data.lbounds) {
        for (i = 0; i < map_array.length; i++) {
            map_array[i].fitBounds(data.lbounds);
        }
    } else if (data.latlng) {
        for (i = 0; i < map_array.length; i++) {
            map_array[i].setView([data.latlng[0], data.latlng[1]], 13);
        }
    }
}

$("#address").geocodify({
    onSelect: function(result) {
        console.log(result);
    }
});

function addJsonFeature() {
    var getData = document.getElementById('addJson').value;

    var jsonData = JSON.parse(getData);

    var map_arf_jsonLayer = new L.geoJson(jsonData, {
        style: function(feature) {
            return addStyle(feature);
        },
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, pointStyle);
        }
    }).addTo(map_arf);

    var map_fbtl_jsonLayer = new L.geoJson(jsonData, {
        style: function(feature) {
            return addStyle(feature);
        },
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, pointStyle);
        }
    }).addTo(map_fbtl);

    var map_square540_jsonLayer = new L.geoJson(jsonData, {
        style: function(feature) {
            return addStyle(feature);
        },
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, pointStyle);
        }
    }).addTo(map_square540);

    var map_square1080_jsonLayer = new L.geoJson(jsonData, {
        style: function(feature) {
            return addStyle(feature);
        },
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, pointStyle);
        }
    }).addTo(map_square1080);

    function addStyle(feature) {
        switch (feature.geometry.type) {
            case 'MultiPolygon':
                return polyStyle;
            case 'Polygon':
                return polyStyle;
            case 'MultiLineString':
                return lineStyle;
            case 'LineString':
                return lineStyle;
            case 'Point':
                return pointStyle;
            case 'MultiPoint':
                return pointStyle;
        }
    }

}



function gatherinfo(id) {

    leafletImage(id, doImage);

    function doImage(err, canvas) {
        if (document.getElementById('newInstructions')) {
            //do nothing
        } else {
            var newInstructions = document.createElement('p');
            newInstructions.id = 'newInstructions';
            newInstructions.innerHTML = instructText;
            document.getElementById('images').appendChild(newInstructions);
        }

        var img = document.createElement('img');
        var dimensions = id.getSize();
        img.width = dimensions.x;
        img.height = dimensions.y;
        img.src = canvas.toDataURL();

        if (document.getElementById('newImg')) {
            document.getElementById('newImg').innerHTML = '';
            document.getElementById('newImg').appendChild(img);
        } else {
            var newImg = document.createElement('div');
            newImg.id = 'newImg';
            newImg.innerHTML = '';
            document.getElementById('images').appendChild(newImg);
            document.getElementById('newImg').appendChild(img);
        }
        window.scrollTo(0, document.body.scrollHeight);
    }
}

// add enter key functionality
var go = document.getElementById("addressBtn");
var txt = document.getElementById("address");

txt.addEventListener("keypress", function() {
    if (event.keyCode == 13) go.click();
});
