$(document).ready(function() {
$("#draggable").draggable({helper: 'clone',
stop: function(e) {
    var point=new google.maps.Point(e.pageX,e.pageY);
    var ll=overlay.getProjection().fromContainerPixelToLatLng(point);
    placeMarker(ll);
    console.log([ll.Ya,ll.Za]);
    }
});
});


var $map;
var $latlng;
var overlay;

google.maps.event.addDomListener(window, 'load', function gmap_initialize() {
  var $latlng = new google.maps.LatLng(66.5, 25.733333);
  var myOptions = {
    zoom: 3,
    center: $latlng,
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
    streetViewControl: false,//???

    panControl:false,

    };
  $map = new google.maps.Map(document.getElementById("map_canvas"),
      myOptions);

  overlay = new google.maps.OverlayView();
  overlay.draw = function() {};
  overlay.setMap($map);
});
function placeMarker(location) {
  var marker = new google.maps.Marker({
  position: location, 
  map: $map,
  icon:'images/map_pin.png'
  });

}
