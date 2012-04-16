window.initMap = function initMap () {

  var latlng = new google.maps.LatLng(43.781, 11.260);
  var myOptions = {
    zoom: 14,
    center: latlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
      position: google.maps.ControlPosition.TOP_LEFT 
    },
    zoomControl: true,
    zoomControlOptions: {
        style: google.maps.ZoomControlStyle.LARGE,
        position: google.maps.ControlPosition.LEFT_TOP
    },
    scaleControl: true,
    scaleControlOptions: {
        position: google.maps.ControlPosition.TOP_LEFT
    },

    panControl:false,

    };
  var _map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
  window.Map = {
  '_map': _map,
  'placeMarker':function placeMarker(coords,title) {
     var marker = new google.maps.Marker({
       'animation':google.maps.Animation.DROP,
       'position': new google.maps.LatLng(coords[0],coords[1]), 
       'map': _map,
       'icon':'images/map_pin_blue.png',
       'title': title,
       'draggable':true,
       'clickable':true,
     });
     if (name)
     marker.title = name;
     marker.setMap(window.Map._map);
     return marker;
    },
    'overlay':new google.maps.OverlayView()
  }
  window.Map.overlay.draw = function() {};
  window.Map.overlay.setMap(window.Map._map);
}
