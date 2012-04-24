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
  var _directions = new google.maps.DirectionsService();
  var _display = new google.maps.DirectionsRenderer();
  var _map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
  _display.setMap(_map);
  _display.polylineOptions = {
    'strokeColor':"#00aa11",
    'strokeOpacity':0.5,
    'clickable':true
  }
  window.Map = {
    
    '_map': _map,
    'placeMarker':function placeMarker(coords,title) {
      var marker = new google.maps.Marker({
        'animation':google.maps.Animation.DROP,
        'position': new google.maps.LatLng(coords[0],coords[1]), 
        'map': _map,
        'icon':'images/map_pin_blue.png',
        'title': title,
      //  'draggable':true,
      //  'clickable':true,
      });
      marker.setMap(window.Map._map);
      return marker;
    },
    'overlay':new google.maps.OverlayView(),
    'directions':function directions(list) {
      var coords = [];
      while (list.length > 0){
        O.activities.get(list[0]).marker.setVisible(false);
        //Really what I want to do is suppress the markers and
        //display my own markers.
        coords.push({'stopover':true,'location':O.activities.get(list.shift()).coords.join(",")})
      }
      console.log(coords);
      var request = {
        'origin': coords.shift().location,
        'destination': coords.pop().location,
        'waypoints': coords,
        'travelMode': google.maps.TravelMode.WALKING
          //TODO: Modify this based on the scale at which
          //we are operating.
      };
      var disp;
      console.log(coords);
      _directions.route(request, function render(response,status) {
        if (status == google.maps.DirectionsStatus.OK){
          disp = _display.setDirections(response);
          console.log([response,status]);
        } else {
          console.log([response,status]);
        }
      });
    },
    'renderPath':function renderPath(list){
      return Map.directions(list);
      var newlist = [];
      var origin;
      var destination;
      while (list.length > 1){
        newlist.push(list.shift());
        origin = O.activities.get(newlist[newlist.length-1]).coords.join(',');
        destination = O.activities.get(list[list.length-1]).coords.join(',');
        Map.directions(origin,destination);
      }
      newlist.push(list.shift())
      return newlist;
    }
  };
  window.Map.overlay.draw = function() {};
  window.Map.overlay.setMap(window.Map._map);
}
