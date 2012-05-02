window.initModel = function initModel () {
  var Activity, activities;

  activities = [];
  globalIDCounter = 0; //There HAS to be a better way to design this.
  $.jStorage.flush();

  Activity = (function() {

    function Activity(name, coords, start, end, duration, range, user_createdP, scheduledP) {
      this.name = name;
      this.coords = coords;
      this.start = start;
      this.end = end;
      this.duration = duration;
      this.range = range;
      this.user_createdP = user_createdP;
      this.scheduledP = scheduledP;
      this.description = "";
      this.id = JSON.stringify(globalIDCounter);
      globalIDCounter += 1;
      return this;
    }

    return Activity;

  })();

  window.O = {
    'getMap' : function getMap() {
      alert("document hasn't been loaded. map cannot be populated.");
    },
    'activities': {
      '_subscribers':{
        'map':{
          'updated':function(i,changes){console.log("the map sees that activity"+i+"now has");console.log(changes)},
          'selected':function(i,changes){console.log("the map sees that activity"+i+"now is selected");}
          'deselected':function(i,changes){console.log("the map sees that activity"+i+"now is selected");}
          'locked':function(i,changes){console.log("the map sees that activity"+i+"now is locked");}
          'unlocked':function(i,changes){console.log("the map sees that activity"+i+"now is locked");}
        },
        'schedule':{
          'updated': function(i,changes){console.log("the schedule sees that activity"+i+"now has");console.log(changes)},
          'selected':function(i,changes){console.log("the schedule sees that activity"+i+"now is selected");}
          'deselected':function(i,changes){console.log("the schedule sees that activity"+i+"now is selected");}
          'locked':function(i,changes){console.log("the schedule sees that activity"+i+"now is locked");}
          'unlocked':function(i,changes){console.log("the schedule sees that activity"+i+"now is locked");}
        }, 
        'form':{
          'updated':function(i,changes){console.log("the form sees that activity"+i+"now has");console.log(changes)},
          'selected':function(i,changes){console.log("the form sees that activity"+i+"now is selected");}
          'deselected':function(i,changes){console.log("the form sees that activity"+i+"now is selected");}
          'locked':function(i,changes){console.log("the form sees that activity"+i+"now is locked");}
          'unlocked':function(i,changes){console.log("the form sees that activity"+i+"now is locked");}
        }
      },
      'selected':function(view,handler){
        O.activities._subscribers[view]['selected']=handler;
      },
      'deselected':function(view,handler){
        O.activities._subscribers[view]['deselected']=handler;
      },
      'updated':function(view,handler){
        O.activities._subscribers[view]['updated']=handler;
      },
      'locked':function(view,handler){
        O.activities._subscribers[view]['locked']=handler;
      },
      'unlocked':function(view,handler){
        O.activities._subscribers[view]['unlocked']=handler;
      },
      '_firehandler':function _firehandler(sourceview,handler,i){
        for (subscriber in O.activities._subscribers){
          if (subscriber !== sourceview){
            O.activities._subscribers[subscribers][handler](i,changes);
          }
        }
      },
      'all':function allActivities () {
        return $.jStorage.index();
      },
      'select':function select(view,i){
        console.log("selected: "+i);
        for (var j in window.O.activities.all()){
          window.O.activities.deselect(j);
        }
        var activity = $.jStorage.get(i);
        O.activities._firehandler(view,'select',i);
        //O.activities.get(i).marker.setAnimation(google.maps.Animation.BOUNCE)
        //This belongs in the handler
      },
      'deselect':function deselect(view,i) {
        O.activities._firehandler(view,'deselect',i);
        //O.activities.get(i).marker.setAnimation(null)
      },
      'get':function get(i){
        return $.jStorage.get(i);
      },
      'set':function set(i,v){
        return $.jStorage.set(i,v);
      },
      'update':function update(i,view,changes){
        var activity = O.activities.get(i)
        for (change in changes){
          activity[change] = changes[change]; 
        }
        O.activities._firehandler(view,'update',i);
      },
      'add':function add(i){
        var activity;
        if (i === undefined){
          activity = O.currentActivity;
        } else {
          activity = $.jStorage.get(i)
        }
        var marker = window.Map.placeMarker(activity.coords,activity.name)
        $.jStorage.get(i).marker = marker;
      }
    },
    'Activity': Activity,
  };

  prebuilt = [
  new Activity("Breakfast", [43.784, 11.253], "13:00", "14:00", 60, ["8:00","10:30"], true, false), 
  new Activity("Dome", [43.785, 11.251], "14:15", "15:30", 180, ["8:00","18:00"], true, false), 
  new Activity("Uffizi Gallery", [43.772, 11.257], "15:45", "16:30",120, ["10:00","18:00"], true, false), 
  new Activity("Accademia Gallery", [43.792, 11.257], "09:45", "11:00", 75, ["10:00","18:00"], true, false), 
  new Activity("Piazzale Michelangelo", [43.790, 11.257], "11:15", "12:00", 75, ["1:00","23:30"], true, false),
  new Activity("Giotto's Tower", [43.780, 11.267], "09:45", "11:00", 60, ["10:00","18:00"], true, false),
  new Activity("Dinner", [43.782, 11.257], "09:45", "11:00", 60, ["18:00","20:00"], true, false)];


  var a;
  for (a in prebuilt){
    O.activities.set(a,prebuilt[a]); 
  }
}


window.initInputs = function initInputs () {
  O.currentActivity = new O.Activity(undefined, undefined, undefined, undefined, undefined, [undefined,undefined], "", true, false)

  $("#activity_name").keyup(function (e){
    if (e.which === 40) {
      //Down: highlight the first suggestion, or move to the next one.
    } else if (e.which === 38) { 
      //Up: highlight an earlier suggestion.
    } else {
      O.currentActivity.name = e.srcElement.value;
    }
  });
  $("#definite_start").keyup(function (e){
    if (e.which === 40) {
      //decrement
    } else if (e.which === 38) { 
      //increment
    }
    O.currentActivity.start = e.srcElement.value;
    //TODO: check if valid time. Highlight in red if not.
  });
  $("#definite_end").keyup(function (e){
    console.log(e.which);
    if (e.which === 40) {
      //decrement
    } else if (e.which === 38) { 
      //increment
    } 
    O.currentActivity.end = e.srcElement.value;
    //TODO: check if valid time. Highlight in red if not.
  });
  $("#range_duration").keyup(function (e){
    console.log(e.which);
    if (e.which === 40) {
      //decrement
    } else if (e.which === 38) { 
      //increment
    } 
    O.currentActivity.duration = e.srcElement.value;
    //TODO: check if valid time. Highlight in red if not.
  });
  $("#range_start").keyup(function (e){
    console.log(e.which);
    if (e.which === 40) {
      //decrement
    } else if (e.which === 38) { 
      //increment
    }
    O.currentActivity.range[0] = e.srcElement.value;
    //TODO: check if valid time. Highlight in red if not.
  });
  $("#range_end").keyup(function (e){
    console.log(e.which);
    if (e.which === 40) {
      //decrement
    } else if (e.which === 38) { 
      //increment
    }
    O.currentActivity.range[0] = e.srcElement.value;
    //TODO: check if valid time. Highlight in red if not.
    //TODO: visualize the time in some way.
  });
  $("#add_schedule").mouseup(function (e){

  });
  $("#add_todo").mouseup(function (e){
    alert("TODO: add this to todo list\n"+JSON.stringify(O.currentActivity));
  });
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
}
/*
 * TODO: make it obvious that a user can enter either definite time for a concert
 * or a duration and range to have lunch, but not both.
$("#time_definite").focus(function(e){
  $("#add_todo").disable();
});
$("#time_range").focus(function(e){
  $("#add_schedule").disable();
});
*/

