$(document).ready(function() {
  var startX;
  var startY;
  var offsetX = 62.593; //hardcoded values for now.
  var offsetY = -29.26; //TODO, calculate the displacement from the 
                        //upper-left corner of the map and the middle 
                        //of the bottom edge of the 11px wide pin image.
  var restingInSlot = true;
  var uiOffset;
  var snapTolerance = 35;
  var map = $("#map_canvas")
  $("#draggable").draggable({
    'helper': "original",
    'zIndex': 9999,
    'snap': "#pin_slot",
    'snapMode': "inner",
    'snapTolerance' : snapTolerance,
    'containment' : "document",
    //draggable adds a listener such that when the mouse moves, 
    //the map_pin follows it.
    'start': function(e,ui) {
      startX = e.pageX;
      startY = e.pageY;
      uiOffset = ui.helper.offset;
    },
    'cursorAt': {
      bottom:0,
      left:11, //assuming image is 22px wide.
    },
    'drag': function(e,ui) {
      var slot = $("#pin_slot")
      var XtoleranceFudge = $("#draggable").width();
      var YtoleranceFudge = $("#draggable").height();
      if (e.pageX > map.offset().left && 
          e.pageX < map.offset().left + map.width() &&
          e.pageY > map.offset().top && 
          e.pageY < map.offset().top + map.height()) {
        $(this).draggable({'revert':false,'snapTolerance':snapTolerance/4});
      } else {
        $(this).draggable({'snapTolerance':snapTolerance});
        if (e.pageX > slot.offset().left - snapTolerance + XtoleranceFudge && 
            e.pageX < slot.offset().left + slot.width() + snapTolerance - XtoleranceFudge  &&
            e.pageY > slot.offset().top - snapTolerance + YtoleranceFudge && 
            e.pageY < slot.offset().top + slot.height() + snapTolerance - YtoleranceFudge ) {
          $(this).draggable({'revert':false});
        } else {
          $(this).draggable({'revert':true});
        }
      }
      if (! O.currentActivity.user_createdP) {
        $(this).draggable({'revert':true});
        console.log("revert true")
      }
    },
    'stop': function(e,ui) {
      //Record the x,y position of the map_pin and put it there absolutely.
      var point=new google.maps.Point(e.pageX - startX + offsetX, 
                                      e.pageY - startY + offsetY);
      var ll=overlay.getProjection().fromContainerPixelToLatLng(point);
      //placeMarker(ll); 
      //TODO: When we add an item to the schedule or todo, put it on the map.
      //TODO: When we put it in the schedule, draw arrows indicating event order.
      //TODO: enforce that there is enough travel time between events.
      if (e.pageX > map.offset().left && 
          e.pageX < map.offset().left + map.width() &&
          e.pageY > map.offset().top && 
          e.pageY < map.offset().top + map.height()) {
        O.currentActivity.location = [ll.Ya,ll.Za];
        $("#location_text").val((""+ll.Ya).substr(0,8) + ", " + (""+ll.Za).substr(0,8));
      } else if (O.currentActivity.user_createdP) {
        O.currentActivity.location = undefined;
        $("#location_text").val("");
      }
      //TODO: when the event marker gets moved off the map it:
      //returns to its original position if not put in the socket
      //or the location info gets cleared if it is put in the socket.
      }
  });

  $("#location_text").keyup(function (e){
    O.currentActivity.location = e.srcElement.value.replace(" ","").split(",");
    console.log(O.currentActivity)
    //TODO: check if valid time. Highlight in red if not.
    //TODO: visualize the time in some way.
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
