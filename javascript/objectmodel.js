window.initModel = function initModel () {
  var Activity, activities;

  activities = [];
  globalIDCounter = 0; //There HAS to be a better way to design this.
  $.jStorage.flush();

  Activity = (function() {

    function Activity(name, coords, start, end, duration, range, user_createdP, commitment) {
      this.name = name;
      this.coords = coords;
      this.start = start;
      this.end = end;
      this.duration = duration;
      this.range = range;
      this.user_createdP = user_createdP;
      this.commitment = commitment; /*suggested,todo,scheduled,locked*/
      this.description = "";
      this.id = JSON.stringify(globalIDCounter);
      this.nextevent = undefined;
      this.prevevent = undefined;
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
          'update':function(i,changes){},//console.log("the map sees that activity"+i+"now has");console.log(changes);},
          'select':function(i,changes){},//console.log("the map sees that activity"+i+"now is selected");},
          'deselect':function(i,changes){},//console.log("the map sees that activity"+i+"now is deselected");},
          'commitment':function(i,oldstate){console.log("the map sees that activity"+i+"was "+oldstate+"and is now"+O.activities.get(i).commitment);}
        },
        'schedule':{
          'update': function(i,changes){},//console.log("the schedule sees that activity"+i+"now has");console.log(changes)},
          'select':function(i,changes){},//console.log("the schedule sees that activity"+i+"now is selected");},
          'deselect':function(i,changes){},//console.log("the schedule sees that activity"+i+"now is deselected");},
          'commitment':function(i,oldstate){}//console.log("the schedule sees that activity"+i+"was "+oldstate+"and is now"+O.activities.get(i).commitment);}
        }, 
        'form':{
          'update':function(i,changes){},//console.log("the form sees that activity"+i+"now has");console.log(changes)},
          'select':function(i,changes){},//console.log("the form sees that activity"+i+"now is selected");},
          'deselect':function(i,changes){},//console.log("the form sees that activity"+i+"now is deselected");},
          'commitment':function(i,oldstate){}//console.log("the form sees that activity"+i+"was "+oldstate+"and is now"+O.activities.get(i).commitment);}
        }
      },
      'selected':function(view,handler) {
        if (['map','schedule','form'].indexOf(view) === -1){throw new Error("unknown interface "+view)};
        O.activities._subscribers[view]['select'] = handler;
      },
      'deselected':function(view,handler) {
        if (['map','schedule','form'].indexOf(view) === -1){throw new Error("unknown interface "+view)};
        O.activities._subscribers[view]['deselect'] = handler;
      },
      'updated':function(view,handler) {
        if (['map','schedule','form'].indexOf(view) === -1){throw new Error("unknown interface "+view)};
        O.activities._subscribers[view]['update'] = handler;
      },
      'commitment_changed':function(view,handler) {
        if (['map','schedule','form'].indexOf(view) === -1){throw new Error("unknown interface "+view)};
        O.activities._subscribers[view]['commitment'] = handler;
      },
      '_firehandler':function _firehandler(view, handler, i, otherdata) {
        if (['map','schedule','form'].indexOf(view) === -1){throw new Error("unknown interface "+view)};
        for (subscriber in O.activities._subscribers) {
          if (subscriber !== view) {
            O.activities._subscribers[subscriber][handler](i, otherdata);
          }
        }
      },
      'all':function allActivities (type) {
        var queriedevents = [];
        var a;
        if ( type === "activities" ) {
          for (i in $.jStorage.index()){
            queriedevents.push($.jStorage.get(i));
            }
          return queriedevents;
        } else if (['todo','scheduled','suggested',"locked"].indexOf(type) !== -1) {
          for (i in $.jStorage.index()){
            a = $.jStorage.get(i);
            if (a.commitment === type){
              queriedevents.push(a);
            }
          }
          return queriedevents;
        } else if (type === "ordered_schedule") {
          for (i in $.jStorage.index()){
            a = $.jStorage.get(i);
            if (a.commitment === "scheduled" || a.commitment === "locked"){
              queriedevents.push(a);
            }
          }
          queriedevents.sort(function find_later_events(event1,event2){
            //Put the later events later in the list.
            //
            if (event1.start.length === 4){ // So that you can compare the times by comparing strings
              event1.start = "0" + event1.start
            }
            if (event2.start.length === 4){
              event2.start = "0" + event1.start
            }
            if (event1.end.length === 4){
              event1.end = "0" + event1.end
            }
            if (event2.end.length === 4){
              event2.end = "0" + event1.end
            }
            if (event1.start > event2.start){
              //if (event1.end < event2.end){
              //  throw new Error("overlapping events");
              //}
              return 1;
            } else if (event1.start < event2.start){
              //if (event1.end > event2.end){
              //  throw new Error("overlapping events");
              //}
              return -1;
            } else {
              throw new Error("events starting the same time");
            }
          });
          return queriedevents;
        } else {
          return $.jStorage.index();
        }
      },
      'selected_activity':undefined,
      'select':function select(view,i) {
        console.log("selected: "+i);
        //debugger;
        O.activities.selected_activity = $.jStorage.get(i);
        O.activities._firehandler(view, 'select', i,{});
      },
      'deselect':function deselect(view) {
        i = O.activities.selected_activity.id;
        O.activities.selected_activity = undefined;
        O.activities._firehandler(view, 'deselect', i,{});
      },
      'update':function update(view,i,changes){
        console.log(i);
        var activity = O.activities.get(i)
        for (change in changes){
          activity[change] = changes[change]; 
        }
        O.activities._firehandler(view, 'update', i, changes);
      },
      'recommit':function recommit(view, i, newstate){
        if (['map','schedule','form'].indexOf(view) === -1){throw new Error("unknown interface "+view)};
        console.log([view,i,newstate]);
        var activity = O.activities.get(i);
        var oldstate = activity.commitment;
        if (oldstate === newstate){
          return;
          throw new Error("Activity "+i+" trying not actually changing state but staying at "+newstate)
        }
        var allowed_newstates;
        if (oldstate === 'suggested') {
          allowed_newstates = ["todo","scheduled"];
        } else if ( oldstate === 'todo'){
          allowed_newstates = ["suggested","scheduled"];
        } else if (oldstate === 'scheduled'){
          allowed_newstates = ["suggested","todo","locked"];
        } else if (oldstate === 'locked'){
          allowed_newstates = ["scheduled"];
        } else {
          throw new Error("Activity "+i+" trying to transition from undefined state "+newstate);
        }
        if (allowed_newstates.indexOf(newstate) === -1){
          throw new Error("Activity "+i+" trying to transition to illegal state "+newstate+" from state "+oldstate);
        }
        activity.commitment = newstate; 
        O.activities._firehandler(view,'commitment',i,oldstate);
      },
      'lock': function lock(view, i){
        O.activities.recommit(view,i,'locked');
      },
      'unlock': function unlock(view, i){
        O.activities.recommit(view,i,'scheduled');
      },
      'delete': function del(view, i){
        O.activities.recommit(view,i,'suggested');
      },
      'deschedule': function deschedule(view, i){
        O.activities.recommit(view,i,'todo');
      },
      'schedule': function deschedule(view, i){
        O.activities.recommit(view,i,'scheduled');
      },
      'todo': function todo(view, i){
        O.activities.recommit(view,i,'todo');
      },
      'get':function get(i){
        return $.jStorage.get(i);
      },
      'set':function set(i, v){
        return $.jStorage.set(i, v);
      },
      'add':function add(i){
        var activity;
        if (i === undefined){
          activity = O.currentActivity;
        } else {
          activity = $.jStorage.get(i)
        }
      }
    },
    'Activity': Activity,
  };

  prebuilt = [
  new Activity("Breakfast", [43.784, 11.253], "13:00", "14:00", 60, ["8:00","10:30"], true, "suggested"), 
  new Activity("Dome", [43.785, 11.251], "14:15", "15:30", 180, ["8:00","18:00"], true, "suggested"), 
  new Activity("Uffizi Gallery", [43.772, 11.257], "15:45", "16:30",120, ["10:00","18:00"], true, "suggested"), 
  new Activity("Accademia Gallery", [43.792, 11.257], "09:45", "11:00", 75, ["10:00","18:00"], true, "suggested"), 
  new Activity("Piazzale Michelangelo", [43.790, 11.257], "11:15", "12:00", 75, ["1:00","23:30"], true, "suggested"),
  new Activity("Giotto's Tower", [43.780, 11.267], "09:45", "11:00", 60, ["10:00","18:00"], true, "suggested"),
  new Activity("Dinner", [43.782, 11.257], "09:45", "11:00", 60, ["18:00","20:00"], true, "suggested")];


  var a;
  for (a in prebuilt){
    O.activities.set(a,prebuilt[a]); 
  }
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

