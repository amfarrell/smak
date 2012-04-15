$(document).ready(function() {
  var startX;
  var startY;
  var offsetX = 62.593; //hardcoded values for now.
  var offsetY = -29.26; //really, find the displacement from the 
                        //upper-left corner of the map and the middle 
                        //of the bottom edge of the 11px wide pin image.
  $("#draggable").draggable({
    //draggable adds a listener such that when the mouse moves, the map_pin
    //follows it.
    start: function(e) {
      startX = e.pageX;
      startY = e.pageY;
    },
    cursorAt: {
      bottom:0,
      left:11, //assuming image is 22px wide.
    },
    stop: function(e) {
      //Record the x,y position of the map_pin and put it there absolutely.
      var point=new google.maps.Point(e.pageX - startX + offsetX, 
                                      e.pageY - startY + offsetY);
      var ll=overlay.getProjection().fromContainerPixelToLatLng(point);
      placeMarker(ll);
      console.log([ll.Ya,ll.Za]);
    //TODO: When the marker is dropped, data about location gets added to the
    // event.
    //TODO: When the marker is relocated, the event info changes. 
      }
  });
});

var $map;
var $latlng;
var overlay;

google.maps.event.addDomListener(window, 'load', function gmap_initialize() {
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
