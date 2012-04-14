google.maps.event.addDomListener(window, 'load', function gmap_initialize() {
  var myOptions = {
    center: new google.maps.LatLng(43.778, 11.255),
    zoom: 14,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

  $("#map_pin").mousedown(function () {
    //Record the x,y position of the map_pin and put it there absolutely.
    
    //Add a listener such that when the mouse moves, the map_pin follows it.
    
    //replace the image map_pin.png with map_pin_empty.png
    console.log("image");
    
    //When the pin is dropped, it inserts a marker into the correct location on
    //the map, data about location gets added to the event.
    
    //When the marker is relocated, the event info changes. 
  });

  //When the event is added to the schedule or the todo list, the map_pin_empty.png
  //becomes map_pin.png again.
});
