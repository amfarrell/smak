
var pythag = function pythag(pointA,pointB){
  var x = pointA.lat-pointB.lat
  var y = pointA.lng-pointB.lng
  return Math.sqrt(Math.pow(x,2) + Math.pow(y,2))
}
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
  var _distance = new google.maps.DistanceMatrixService();
  var _display = new google.maps.DirectionsRenderer();
  var _map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
  var _places = new google.maps.places.PlacesService(_map);
  _display.setMap(_map);
  _display.polylineOptions = {
    'strokeColor':"#00aa11",
    'strokeOpacity':0.5,
    'clickable':true
  }
  window.Map = {
    
    'currentCoords':undefined,
    '_map': _map,
    'placeMarker':function placeMarker(activity) {
      console.log("marker placed for");
      console.log(activity);
      var marker = new google.maps.Marker({
        'animation':google.maps.Animation.DROP,
        'position': new google.maps.LatLng(activity.coords[0],activity.coords[1]), 
        'icon':'images/blue-dot.png',
        'title': activity.title,
      //  'draggable':true,
        'clickable':true,
      });
      google.maps.event.addListener(marker, 'click', function select_pin() {
        //XXX This does not yet work...
        if (marker.icon == 'images/red-dot.png'){
          marker.icon = 'images/blue-dot.png';
          marker.setAnimation(null);
          O.activities.deselect("map",activity.id);
        }else{
          for (var i in O.activities.all()){
            console.log(O.activities.all());
            console.log(O.activities.get(i).marker);
            O.activities.get(i).marker.icon = 'images/blue-dot.png';
            O.activities.get(i).marker.setAnimation(null);
            console.log(O.activities.get(i).marker);
          }
          marker.icon = 'images/red-dot.png';
          marker.setAnimation(google.maps.Animation.BOUNCE);
          O.activities.select("map",activity.id);
        }
      });
      marker.setMap(window.Map._map);
      return marker;
    },
    'overlay':new google.maps.OverlayView(),
    'directions':function directions(list) {
      var coords = [];
      while (list.length > 0){
        list[0].marker.setVisible(false);
        //Really what I want to do is suppress the markers and
        //display my own markers.
        coords.push({'stopover':true,'location':list.shift().coords.join(",")})
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
      if (list.length < 2){
        return;
        //TODO: have it display a different colour marker.
      }
      if (typeof list[0] ==="number" || typeof list[0] ==="string"){
        var scraplist = [];
        while (list.length > 0){
          scraplist.push(O.activities.get(list.shift()));
        }
        list = scraplist;
      }
      return Map.directions(list);
      var newlist = [];
      var origin;
      var destination;
      while (list.length > 1){
        newlist.push(list.shift());
        origin = newlist[newlist.length-1].coords.join(',');
        destination = list[list.length-1].coords.join(',');
        Map.directions(origin,destination);
      }
      newlist.push(list.shift())
      return newlist;
    },
    'getbounds':function getbounds(){ //TODO: make this dynamic.
      return new google.maps.LatLngBounds(new google.maps.LatLng(43.7646, 11.2238), //sw
           new google.maps.LatLng(43.7928, 11.2897));//ne
    },
    'getplaces':function getplaces(term,response){
      _places.search({  
        'bounds':window.Map.getbounds(),
      //  'location':google.maps.LatLng(43.7763, 11.2580),
      //  'radius':2273.80,
        "keyword":term.term, //TODO: experiment with search results to see if this is actually what we want. 
        'types':['natural_feature', //TODO figure out if I picked the right types. 
//                'accounting',
                'airport',
                'amusement_park',
                'aquarium',
                'art_gallery',
//                'atm',
                'bakery',
//                'bank',
                'bar',
                'beauty_salon',
//                'bicycle_store',
                'book_store',
                'bowling_alley',
                'bus_station',
                'cafe',
                'campground',
//                'car_dealer',
                'car_rental',
//                'car_repair',
//                'car_wash',
                'casino',
                'cemetery',
                'church',
//                'city_hall',
                'clothing_store',
//                'convenience_store',
//                'courthouse',
//                'dentist',
                'department_store',
//                'doctor',
//                'electrician',
//                'electronics_store',
                'embassy',
                'establishment',
//                'finance',
//                'fire_station',
                'florist',
                'food',
//                'funeral_home',
//                'furniture_store',
//                'gas_station',
//                'general_contractor',
//                'geocode',
//                'grocery_or_supermarket',
//                'gym',
//                'hair_care',
//                'hardware_store',
                'health',
                'hindu_temple',
//                'home_goods_store',
                'hospital',
//                'insurance_agency',
                'jewelry_store',
                'laundry',
//                'lawyer',
                'library',
                'liquor_store',
//                'local_government_office',
//                'locksmith',
                'lodging',
                'meal_delivery',
                'meal_takeaway',
                'mosque',
                'movie_rental',
                'movie_theater',
//                'moving_company',
                'museum',
                'night_club',
//                'painter',
                'park',
                'parking',
//                'pet_store',
//                'pharmacy',
//                'physiotherapist',
                'place_of_worship',
//                'plumber',
//                'police',
                'post_office',
//                'real_estate_agency',
                'restaurant',
//                'roofing_contractor',
//                'rv_park',
                'school',
                'shoe_store',
                'shopping_mall',
                'spa',
                'stadium',
//                'storage',
                'store',
                'subway_station',
                'synagogue',
                'taxi_stand',
                'train_station',
                'travel_agency',
                'university',
                'veterinary_care',
                'zoo']
      
      },function handleplaces(results, status){
        var newresults = []
        if (status == google.maps.places.PlacesServiceStatus.OK){
          for (var i=0;i<results.length;i++){
            var suggestion_html = Map.make_suggestion(results[i])
            if (suggestion_html){
              newresults.push(suggestion_html);
            }
          }
          response(newresults);
        } else {
          response([]);
        }
      });
    },
    'make_suggestion':function make_suggestion(place){
      var activity = O.google_suggestions[place.id];
      if (activity){
        if (activity.commitment !== "suggested"){
          return false;
        }
      } else {
        activity =  new O.Activity(place.name,[place.geometry.location.lat,place.geometry.location.lng],undefined,undefined,60,[undefined,undefined],false,"suggested");
        O.activities.set(activity.id,activity);
        O.google_suggestions[place.id] = activity;
      }
      var html = "<a class='ui-corner-all' tabindex='-1'>"+activity.name+"</a>";
      //note that the correct thing to do here is actually to have the item be draggable.
      return {'html':html, 'id':activity.id, 'label':activity.name, 'value':activity.name};
    },
    'traveltime':function travelTime(event1,event2){
      //Takes a list of N events and returns a list of N-1 travel times in minutes.
      /*
      var traveltime = 0;
        {
          origins: [google.maps.LatLng(event1.coords[0],event1.coords[1])],
          destinations: [google.maps.LatLng(event2.coords[0],event1.coords[1])],
          travelMode: google.maps.TravelMode.WALKING,
          avoidHighways: true,
          avoidTolls: false
        }, function callback(response, status) {
        // See Parsing the Results for
        // the basics of a callback function.
      });
      */
      return 1;
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
            activity.marker = Map.placeMarker(activity)
          } else if (newstate === "scheduled"){

            console.log("add to itinerary");
          }
        } else if (oldstate === "todo") {
          if (newstate === "suggested"){
            // remove marker. redisplay with new number.
          } else if (newstate === "scheduled"){
            var order = O.activities.all("ordered_schedule");
            Map.renderPath(order);
            console.log("adding to schedule"+i)
            //change colour of marker
          }
        } else if (oldstate === "scheduled"){
          if (newstate === "suggested"){
            // remove marker. recalc order.
          } else if (newstate === "todo"){
            var order = O.activities.all("ordered_schedule");
            console.log("removing from schedule"+i)
            //change colour of marker, recalc order.
          } else if (newstate === "locked"){
            // Do nothing
          }
        } else if (oldstate === "locked"){
            // Do nothing
        }
  });

  google.maps.event.addListener(_map, 'mouseover', function select_pin() {
    //XXX This does not yet work...
    console.log("map moused over");
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
        $("#location_text").val((""+ll.lat()).substr(0,8) + ", " + (""+ll.lng()).substr(0,8));
        if (O.activities.selected_activity) {
          O.activities.update("map",O.activities.selected_activity.id,{"coords":[ll.lat(), ll.lng()]});
        } else {
          Map.currentCoords = [ll.lat(), ll.lng()];
        }
      } else {
        Map.currentCoords = undefined;
      }
      //TODO: when the event marker gets moved off the map it:
      //returns to its original position if not put in the socket
      //or the location info gets cleared if it is put in the socket.
      }
  });


  /*
  $("#location_text").keyup(function (e){
    O.activities.selected_activity.coords = e.srcElement.value.replace(" ","").split(",");
    console.log(O.activities.selected_activity)
    //TODO: check if valid time. Highlight in red if not.
    //TODO: visualize the time in some way.
  });
  */
  O.activities.selected("map",function map_select_handle(i,changes){
    if (O.activities.get(i).commitment === "suggested"){
      //place a temporary marker.
    }
    
    for (var j in O.activities.all()){
      O.activities.get(j).marker.icon = 'images/blue-dot.png';
      O.activities.get(j).marker.setAnimation(null);
    }
    if (O.activities.get(i).marker){
      O.activities.get(i).marker.icon = 'images/red-dot.png';
      O.activities.get(i).marker.setAnimation(google.maps.Animation.BOUNCE)
    }
        //This belongs in the handler
  });
  O.activities.deselected("map",function map_select_handle(i,changes){
    if (O.activities.get(i).marker){
      O.activities.get(i).marker.icon = 'images/blue-dot.png';
      O.activities.get(i).marker.setAnimation(null)
    }

    if (O.activities.get(i).commitment === "suggested"){
    // remove the temporary marker.
    }
  });
  O.activities.updated("map",function map_select_handle(i,changes){
    

  });

}
