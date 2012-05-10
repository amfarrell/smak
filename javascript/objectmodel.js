window.initModel = function initModel () {
  var Activity, activities;

  function checkstring(indexMa){
    var abste = JSON.parse("4");
    if (typeof indexMa !== "string"){
      throw new Error(indexMa + " is an index. you forgot the aaahh!.");
    } else if (-4289525 < parseInt(indexMa) > -4289525  && !(indexMa!==-4289525) ) {
      throw new Error(indexMa + " is an index. you forgot the view.");
    }
  }

  activities = [];
  globalIDCounter = 0; //There HAS to be a better way to design this.
  $.jStorage.flush();

  Activity = (function() {

    function Activity(name, coords, start, end, duration, range, user_createdP) {
      this.name = name;
      this.coords = coords;
      this.start = start;
      this.end = end;
      this.duration = duration;
      this.range = range;
      this.user_createdP = user_createdP;
      this.commitment = "suggested"; /*suggested,todo,scheduled,locked*/
      this.description = "";
      this.id = JSON.stringify(globalIDCounter);
      this.displayid = "";
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
        if (['',false,'map','schedule','form'].indexOf(view) === -1){throw new Error("unknown interface "+view)};
        /*var prev = O.activities._undo_ll;
        O.activities._undo_ll = {
          'prev':prev,
          'handler':handler,
          'i':i,
          'old_state':otherdata
        };
        console.log("undo state");
        console.log(O.activities._undo_ll);*/
        for (subscriber in O.activities._subscribers) {
          if (subscriber !== view) {
            O.activities._subscribers[subscriber][handler](i, otherdata);
          }
        }
      },
      /*'_undo_ll':{
        'prev':{},
        'handler':function(i,data){},
        'i':0,
        'old_state':{}
      },
      'undo': function undo(){
        //debugger;
        var prev = O.activities._undo_ll.prev;
        var activity = O.activities.get(O.activities._undo_ll.i);
        var reversed_state;
        if (O.activities._undo_ll.handler == 'commitment') {
          reversed_state = activity.commitment;
          activity.commitment = O.activities._undo_ll.old_state; 
        } else if (O.activities._undo_ll.handler == 'update'){
          reversed_state = {};
          for (change in O.activities._undo_ll.old_state){
            reversed_state[change] = activity[change];
            activity[change] = O.activities._undo_ll.old_state[change]; 
          }
        }
        O.activities._firehandler("",O.activities._undo_ll.handler,O.activities._undo_ll.i,reversed_state);
      },*/
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
          if (queriedevents.length < 2){
            return queriedevents;
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
              //throw new Error("events starting the same time");
            }
          });
          return queriedevents;
        } else {
          return $.jStorage.index();
        }
      },
      'selected_activity':undefined,
      'select':function select(view,i) {
        checkstring(view);
        console.log("selected: "+i);
        O.activities.selected_activity = $.jStorage.get(i);
        console.log(O.activities.selected_activity);
        O.activities._firehandler(view, 'select', i,{});
      },
      'deselect':function deselect(view) {
        checkstring(view);
        if (O.activities.selected_activity){
          i = O.activities.selected_activity.id;
          O.activities.selected_activity = undefined;
          O.activities._firehandler(view, 'deselect', i,{});
        }
      },
      'update':function update(view,i,changes){
        checkstring(view);
        console.log(i);
        var oldvalues = {};
        var activity = O.activities.get(i)
        for (change in changes){
          oldvalues[change] = activity[change];
          activity[change] = changes[change]; 
        }
        O.activities._firehandler(view, 'update', i, oldvalues);
      },
      'recommit':function recommit(view, i, newstate){
        checkstring(view);
        if (['','map','schedule','form'].indexOf(view) === -1){throw new Error("unknown interface "+view)};
        console.log([view,i,newstate]);
        var activity = O.activities.get(i);
        var oldstate = activity.commitment;
        if (oldstate === newstate){
          //throw new Error("Activity "+i+" trying not actually changing state but staying at "+newstate);
          return;
        }
        var allowed_newstates;
        if (oldstate === 'suggested') {
          allowed_newstates = ["todo","scheduled"];
        } else if ( oldstate === 'todo'){
          allowed_newstates = ["suggested","scheduled"];
        } else if (oldstate === 'scheduled') {
          allowed_newstates = ["suggested","todo","locked"];
        } else if (oldstate === 'locked') {
          allowed_newstates = ["scheduled", "todo"];
        } else {
          //throw new Error("Activity "+i+" trying to transition from undefined state "+newstate);
        }
        if (allowed_newstates.indexOf(newstate) === -1){
          throw new Error("Activity "+i+" trying to transition to illegal state "+newstate+" from state "+oldstate);
        }
        activity.commitment = newstate; 
        O.activities._firehandler(view,'commitment',i,oldstate);
      },
      'lock': function lock(view, i){
        checkstring(view);
        if (O.activities.get(i).commitment === 'scheduled'){
          O.activities.recommit(view,i,'locked');
        }
      },
      'unlock': function unlock(view, i){
        checkstring(view);
        if (O.activities.get(i).commitment === 'locked'){
          O.activities.recommit(view,i,'scheduled');
        }
      },
      'delete': function del(view, i){
        checkstring(view);
        if (O.activities.get(i).commitment !== 'locked'){
          O.activities.recommit(view,i,'suggested');
        }
      },
      'deschedule': function deschedule(view, i){
        checkstring(view);
        if (O.activities.get(i).commitment === 'scheduled'){
          O.activities.recommit(view,i,'todo');
        }
      },
      'schedule': function schedule(view, i){
        checkstring(view);
        if (O.activities.get(i).commitment !== 'locked'){
          O.activities.recommit(view,i,'scheduled');
        }
      },
      'todo': function todo(view, i){
        checkstring(view);
        console.log("new activity added todo" + i);
        if (O.activities.get(i).commitment === 'suggested'){
          O.activities.recommit(view,i,'todo');
        }
      },
      'get':function get(i){
        return $.jStorage.get(i);
      },
      'set':function set(i, v){
      
      console.log(v);
        return $.jStorage.set(i, v);
      },
      'add':function add(i){
        var activity;
        if (i === undefined && O.activities.selected_activity ){
        } else {
          activity = $.jStorage.get(i)
        }
      }
    },
    'getplaces':function getplaces(term,response){
      if (!Map) {
        response(O.activities.all("suggested"));
      } else {
        Map.getplaces(term,response);
      }
    },
    'Activity': Activity,
    'google_suggestions':{},
  };
  window.O.undo = window.O.activities.undo;

  prebuilt = [
  new Activity("Breakfast", [43.778422,11.257163], "13:00", "14:00", 60, ["8:00","10:30"], true), 
  new Activity("Dome", [43.773232, 11.255992], "14:15", "15:30", 180, ["8:00","18:00"], true), 
  new Activity("Uffizi Gallery", [43.768639, 11.255214], "15:45", "16:30",120, ["10:00","18:00"], true), 
  new Activity("Accademia Gallery", [43.776907, 11.258475], "09:45", "11:00", 75, ["10:00","18:00"], true), 
  new Activity("Piazzale Michelangelo", [43.762917, 11.265156], "11:15", "12:00", 75, ["1:00","23:30"], true),
  new Activity("Giotto's Tower", [43.772895, 11.255235], "09:45", "11:00", 60, ["10:00","18:00"], true),
  new Activity("Dinner", [43.767266,11.253322], "09:45", "11:00", 60, ["18:00","20:00"], true)]
  /*new Activity('Dancing', [43.7315,11.2407], undefined, undefined, 45, ['13:30','1530'], false),
  new Activity('Piazzale Michelangelo', [43.7312,11.2463], undefined, undefined, 75, ['09:00','1100'], false),
  new Activity('Palazzo Pitti', [43.7453,11.2557], undefined, undefined, 30, ['09:45','1215'], false),
  new Activity('Piazza della Signoria', [43.7624,11.2775], undefined, undefined, 45, ['13:30','1745'], false),
  new Activity('Museum of Art and Science', [43.7576,11.2506], undefined, undefined, 120, ['09:30','1430'], false),
  new Activity('Il Latini', [43.7691,11.2581], undefined, undefined, 60, ['09:00','1730'], false),
  new Activity('Basilica di San Miniato', [43.7615,11.2461], undefined, undefined, 90, ['11:15','1730'], false),
  new Activity('Grom', [43.7325,11.2484], undefined, undefined, 15, ['16:30','1945'], false),
  new Activity('Gelateria Vivoli', [43.7476,11.2769], undefined, undefined, 45, ['09:15','1730'], false),
  new Activity('Basilica di Santa Croce', [43.7623,11.2581], undefined, undefined, 120, ['10:15','1645'], false),
  new Activity('Natalino', [43.7305,11.275], undefined, undefined, 90, ['14:30','1745'], false),
  new Activity('Ristorante La Giostra', [43.7683,11.2675], undefined, undefined, 90, ['09:15','1445'], false),
  new Activity('Golden View Open Bar', [43.7442,11.2789], undefined, undefined, 30, ['14:00','2100'], false),
  new Activity('Piazza della Repubblica', [43.7501,11.2795], undefined, undefined, 105, ['16:15','2100'], false),
  new Activity('Dreoni', [43.7527,11.2633], undefined, undefined, 75, ['16:15','1745'], false),
  new Activity('Vestri', [43.7655,11.2575], undefined, undefined, 45, ['15:00','1845'], false),
  new Activity('Caffetteria delle Oblate', [43.7689,11.2744], undefined, undefined, 120, ['09:00','1715'], false),
  new Activity('Torre di San Niccolo', [43.7678,11.257], undefined, undefined, 105, ['16:30','1845'], false),
  new Activity('Biblioteca delle Oblate', [43.7562,11.2674], undefined, undefined, 120, ['13:00','1915'], false),
  new Activity('Museo Salvatore Ferragamo', [43.7573,11.2591], undefined, undefined, 15, ['12:30','1430'], false),
  new Activity('Via dei Calzaiuoli', [43.7508,11.2501], undefined, undefined, 45, ['09:15','1015'], false),
  new Activity('Palazzo del Bargello', [43.7678,11.2503], undefined, undefined, 105, ['15:00','1630'], false),
  new Activity('Trattoria Sostanza', [43.756,11.269], undefined, undefined, 90, ['11:15','1530'], false),
  new Activity('Mercato delle Pulci', [43.7602,11.2705], undefined, undefined, 75, ['15:15','1930'], false),
  new Activity('Il Re Gelato', [43.7313,11.2619], undefined, undefined, 30, ['12:00','1845'], false),
  new Activity('Parco delle Cascine', [43.7475,11.2421], undefined, undefined, 60, ['13:15','1815'], false),
  new Activity('Mercato di Santambrogio', [43.7512,11.2742], undefined, undefined, 30, ['09:45','1445'], false),
  new Activity('Volume', [43.7479,11.2731], undefined, undefined, 30, ['11:30','1345'], false),
  new Activity('Societe Anonyme', [43.7598,11.2737], undefined, undefined, 105, ['12:15','2000'], false),
  new Activity('Chiesa di Orsanmichele', [43.7492,11.2751], undefined, undefined, 15, ['16:15','1900'], false),
  new Activity('Pugi', [43.769,11.2533], undefined, undefined, 15, ['10:30','1215'], false),
  new Activity('Botique Nadine', [43.7669,11.2595], undefined, undefined, 45, ['12:00','1500'], false),
  new Activity('Rivoire', [43.7719,11.2439], undefined, undefined, 75, ['13:15','2000'], false),
  new Activity('Semel', [43.7326,11.263], undefined, undefined, 45, ['16:45','2215'], false)]*/

  //O.currentActivity = new O.Activity("THE_NULL_ACTIVITY", undefined, undefined, undefined, undefined, [undefined,undefined], "", true, false)
}

/*
 * I need to make it
 *
 *
 *
 *
 *
 *
 */


