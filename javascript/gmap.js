
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
  O.activities.commitment_changed("map",function map_select_handle(i,oldstate){
        //var marker = window.Map.placeMarker(activity.coords,activity.name)
        //$.jStorage.get(i).marker = marker;

        var activity =  O.activities.get(i);
        var newstate = activity.commitment;
        if (oldstate === "suggested"){
          //remove any temporary marker and place a new one.
          if (newstate === "todo"){
            activity.marker = Map.placeMarker(activity.coords, activity.title)
          } else if (newstate === "scheduled"){

            console.log("add to itinerary");
          }
        } else if (oldstate === "todo") {
          if (newstate === "suggested"){
            // remove marker. redisplay with new number.
          } else if (newstate === "scheduled"){
            console.log("adding to schedule"+i)
            //change colour of marker
          }
        } else if (oldstate === "scheduled"){
          if (newstate === "suggested"){
            // remove marker. recalc order.
          } else if (newstate === "todo"){
            //change colour of marker, recalc order.
          } else if (newstate === "locked"){
            // Do nothing
          }
        } else if (oldstate === "locked"){
            // Do nothing
        }
  });

}

window.initMapInput = function initMapInput () {

  var map = $("#map_canvas")
  var startX;
  var startY;
  var offsetX = 62.593; //hardcoded values for now.
  var offsetY = -29.26; //TODO, calculate the displacement from the 
                        //upper-left corner of the map and the middle 
                        //of the bottom edge of the 11px wide pin image.
  var snapTolerance = 35;
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
        console.log([e.pageX,e.pageY]);
        console.log(map.offset().left + "-"+ (map.offset().left + map.width()))
        console.log(map.offset().top + "-"+ (map.offset().top + map.height()))
      } else {
        console.log([e.pageX,e.pageY]);
        console.log(map.offset().left + "-"+ (map.offset().left + map.width()))
        console.log(map.offset().top + "-"+ (map.offset().top + map.height()))
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
      if (O.currentActivity.user_createdP===false) {
        $(this).draggable({'revert':true});
        console.log("revert true")
      }
    },
    'stop': function(e,ui) {
      //Record the x,y position of the map_pin and put it there absolutely.
      var point=new google.maps.Point(e.pageX - startX + offsetX, 
                                      e.pageY - startY + offsetY);
      var ll=Map.overlay.getProjection().fromContainerPixelToLatLng(point);
      //placeMarker(ll); 
      //TODO: When we add an item to the schedule or todo, put it on the map.
      //TODO: When we put it in the schedule, draw arrows indicating event order.
      //TODO: enforce that there is enough travel time between events.
      if (e.pageX > map.offset().left && 
          e.pageX < map.offset().left + map.width() &&
          e.pageY > map.offset().top && 
          e.pageY < map.offset().top + map.height()) {
        O.currentActivity.coords = [ll.Ya,ll.Za];
        $("#location_text").val((""+ll.Ya).substr(0,8) + ", " + (""+ll.Za).substr(0,8));
      } else if (O.currentActivity.user_createdP) {
        O.currentActivity.coords = undefined;
        $("#location_text").val("");
      }
      //TODO: when the event marker gets moved off the map it:
      //returns to its original position if not put in the socket
      //or the location info gets cleared if it is put in the socket.
      }
  });

  $("#location_text").keyup(function (e){
    O.currentActivity.coords = e.srcElement.value.replace(" ","").split(",");
    console.log(O.currentActivity)
    //TODO: check if valid time. Highlight in red if not.
    //TODO: visualize the time in some way.
  });
  O.activities.selected("map",function map_select_handle(i,changes){
    if (O.activities.get(i).commitment === "suggested"){
      //place a temporary marker.
    }
    O.activities.get(i).marker.setAnimation(google.maps.Animation.BOUNCE)
        //This belongs in the handler

  });
  O.activities.deselected("map",function map_select_handle(i,changes){
    O.activities.get(i).marker.setAnimation(null)

    if (O.activities.get(i).commitment === "suggested"){
    // remove the temporary marker.
    }
  });
  O.activities.updated("map",function map_select_handle(i,changes){
    

  });

}
