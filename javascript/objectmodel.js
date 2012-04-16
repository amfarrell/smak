(function() {
  var Activity, activities;

  activities = [];

  Activity = (function() {

    Activity.id = 0;

    function Activity(name, location, start, end, duration, range, user_createdP, scheduledP) {
      this.name = name;
      this.location = location;
      this.start = start;
      this.end = end;
      this.duration = duration;
      this.range = range;
      this.user_createdP = user_createdP;
      this.scheduledP = scheduledP;
      this.description = "";
      this.id = JSON.stringify(Activity.id);
      Activity.id += 1;
      $.jStorage.set(this.id, this);
    }

    return Activity;

  })();
  $.jStorage.flush();
  [new Activity("Breakfast", [42.3656, -71.0215], "13:00", "14:00", 60, ["12:00","14:30"], true, false), 
  new Activity("Dome", [42.2656, -71.0235], "14:15", "15:30", 180, ["13:00","17:30"], true, false), 
  new Activity("Uffizi Gallery", [42.3621, -71.0570], "15:45", "16:30",120, ["13:00","22:30"], true, false), 
  new Activity("Accademia Gallery", [42.3607, -71.0733], "09:45", "11:00", 75, ["08:00","15:30"], true, false), 
  new Activity("Piazzale Michelangelo", [42.3603, -71.0958], "11:15", "12:00", 75, ["11:00","16:30"], true, false),
  new Activity("Giotto's Tower", [42.3607, -71.0733], "09:45", "11:00", 60, ["08:00","15:30"], true, false),
  new Activity("Dinner", [42.3607, -71.0733], "09:45", "11:00", 60, ["08:00","15:30"], true, false)];

  window.O = {
    'Activity': Activity,
    'currentActivity':{
      'name':undefined,
      'location':undefined,
      'start':undefined,
      'end':undefined,
      'duration':undefined,
      'range':[undefined,undefined],
      'description':"",
      'user_createdP':true,
      'scheduledP':false,
      'id':undefined
    } // for now, an object that will provide the arguments for a new activity.
  };

var sort_suggestions = function (){
  //push the most relevant suggestions to the top.

}
$(document).ready(function () {
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
    alert("TODO: add this to schedule\n"+JSON.stringify(O.currentActivity));
  });
  $("#add_todo").mouseup(function (e){
    alert("TODO: add this to todo list\n"+JSON.stringify(O.currentActivity));
  });
});
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
}).call(this);
