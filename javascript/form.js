window.initForm = function initForm () {
  
  
  var autocompleteNames = new Array();
  
  $("#activity_name").autocomplete({
    'minLength':1
  });
  initSuggestedList();
  
  function initSuggestedList() {
    autocompleteNames = new Array();
    for (var i in O.activities.all("suggested")) {
      autocompleteNames.push(O.activities.get(i).name);
    }
    $("#activity_name").autocomplete( "option", "source", autocompleteNames);
  }
  $("#make_event").click(function submitMakeEvent(e){
    var name = $("#activity_name")[0].value
    var start = undefined;
    var duration = 60;
    var range = [$("#radio-start-field")[0].value,$("#radio-end-field")[0].value];

    //function Activity(name, coords, start, end, duration, range, user_createdP, commitment) {
    var activity = new O.Activity(name,[window.tempMarker.getPosition().lat(),window.tempMarker.getPosition().lng()],start,undefined,duration,range,true,"suggested");
    O.activities.set(activity.id,activity);
    O.activities.todo('',activity.id);
    
    $("#activity_name").val("");
    $("#radio-start-field").val("");
    $("#radio-end-field").val("");
    
    if (window.tempMarker){
      window.tempMarker.setMap(null);
      window.tempMarker=null;
    }
    
  });

  O.activities.selected("form",function(id,otherdata){
    if (window.tempMarker){
      window.tempMarker.setMap(null);
      window.tempMarker=null;
    }
    console.log("the form sees that "+id+" was selected.");
    var activity = O.activities.get(id);
    $("#activity_name").val(activity.name);
    if (activity.range && activity.range[0]){
      $("#radio-start-field").val(new Date(Date.parse(activity.range[0])).toString("h:mmtt"));
      $("#radio-end-field").val(new Date(Date.parse(activity.range[1])).toString("h:mmtt"));
    }
    $("#add_activity_form").addClass("activitySelected");
  });

  O.activities.deselected("form",function(id,otherdata){
    console.log("the form sees that "+id+" was de-selected.");
    var activity = O.activities.get(id);
    $("#activity_name").val("");
    $("#radio-start-field").val("");
    $("#radio-end-field").val("");
    $("#add_activity_form").removeClass("activitySelected");    
  });

  O.activities.updated("form",function form_updated(id,olddata){
    var activity = O.activities.get(id);
    if (O.activities.selected_activity && activity.id === O.activities.selected_activity.id){
      $("#activity_name")[0].value = activity.name;
      $("#radio-start-field").val(new Date(Date.parse(activity.range[0])).toString("h:mmtt"));
      $("#radio-end-field").val(new Date(Date.parse(activity.range[1])).toString("h:mmtt"));
    }

  });

  $("#activity_name").keyup(function (e){
    if (e.keycode == 13)submitMakeEvent(e);
    
    var name = $("#activity_name")[0].value
    if (O.activities.selected_activity){
        O.activities.update("",O.activities.selected_activity.id,{"name":name});
    }else {
      for (var i in O.activities.all("suggested")) {
        if (name == O.activities.get(i).name){
          var activity = O.activities.get(i);
          if (window.tempMarker && window.tempMarker.getTitle() == activity.name){
          }else{
            if (window.tempMarker){
              window.tempMarker.setMap(null);
              window.tempMarker=null;
            }
            window.tempMarker = Map.placeMarker(activity);
            
            $("#radio-start-field").val(new Date(Date.parse(activity.range[0])).toString("h:mmtt"));
            $("#radio-end-field").val(new Date(Date.parse(activity.range[1])).toString("h:mmtt"));
          }
          return;
        }
      }
      
      if (window.tempMarker==null || window.tempMarker.getTitle()!=undefined){
      if (window.tempMarker!=null)console.log(window.tempMarker.getTitle())
        newMarker();
        $("#radio-start-field").val(startTime.toString("h:mmtt"));
        $("#radio-end-field").val(new Date( startTime.valueOf()).addHours(schedule.length/4).toString("h:mmtt"));
      }
    }
    //TODO: check if valid time. Highlight in red if not.
  });
    
  function incremened_time(time){
      if (time === ""){
        return time;
      }
      time = time.split(':');
      time[1] = parseInt(time[1]) + 15;
      if (time[1] > 59){
        time[0] = parseInt(time[0]) +1
        time[1] = time[1] - 60;
      }
      return ""+time[0]+':'+time[1];
  }
  function decremened_time(time){
      if (time === ""){
        return time;
      }
      time = time.split(':');
      time[1] = parseInt(time[1]) - 15;
      if (time[1] < 0){
        time[0] = parseInt(time[0]) -1
        time[1] = time[1] + 60;
      }
      return ""+time[0]+':'+time[1];
  }
  $("#radio-start-field").keyup(function (e){
    console.log(e)
    var start = $("#radio-start-field")[0].value;
    if (e.which === 40) {
      start = decremened_time(start);
    } else if (e.which === 38) { 
      start = incremened_time(start);
      //increment
    }
    if (O.activities.selected_activity){
        O.activities.update("",O.activities.selected_activity.id,{"range":[start, O.activities.selected_activity.range[1]]});
    }
    //TODO: check if valid time. Highlight in red if not.
  });
  $("#radio-end-field").keyup(function (e){
    console.log(e)
    console.log(e.which);
    var end = $("#radio-end-field")[0].value
    if (e.which === 40) {
      end = decremened_time(end);
    } else if (e.which === 38) { 
      end = incremened_time(end);
    } 
    if (O.activities.selected_activity){
        O.activities.update("",O.activities.selected_activity.id,{"range":[O.activities.selected_activity.range[0], end]});
    }
    //TODO: check if valid time. Highlight in red if not.
  });
  $("#radio-start-at-field").keyup(function (e){
    console.log(e)
    console.log(e.which);
    var start_at = $("#radio-start-at-field")[0].value
    if (e.which === 40) {
      start_at = decremened_time(start_at);
    } else if (e.which === 38) { 
      start_at = incremened_time(start_at);
    }
    if (O.activities.selected_activity){
        O.activities.update("",O.activities.selected_activity.id,{"start":start_at});
    }
    //TODO: check if valid time. Highlight in red if not.
  });

  /*
  $("#range_duration").keyup(function (e){
    console.log(e.which);
    if (e.which === 40) {
      //decrement
    } else if (e.which === 38) { 
      //increment
    } 
    O.activities.selected_activity.duration = e.srcElement.value;
    //TODO: check if valid time. Highlight in red if not.
  });
  $("#range_end").keyup(function (e){
    console.log(e.which);
    if (e.which === 40) {
      //decrement
    } else if (e.which === 38) { 
      //increment
    }
    O.activities.selected_activity.range[0] = e.srcElement.value;
    //TODO: check if valid time. Highlight in red if not.
    //TODO: visualize the time in some way.
  });
  $("#add_schedule").mouseup(function (e){

  });
  $("#add_todo").mouseup(function (e){
    alert("TODO: add this to todo list\n"+JSON.stringify(O.activities.selected_activity));
  });


  */
}
