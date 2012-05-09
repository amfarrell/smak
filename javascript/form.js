window.initForm = function initForm () {
  
  $("#activity_name").autocomplete({
    'minLength':3,
    'source':O.getplaces
  });
  
  function initSuggestedList() {
    for (var i in O.activities.all("suggested")) {
      addSuggestion(O.activties.get(i));
    }
  }
  $("#make_event").click(function (e){
    var name = $("#activity_name")[0].value
    if ($("#radio-start-end")[0].checked){
      var start = undefined;
      var duration = 60;
      var range = [$("#radio-start-field")[0].value,$("#radio-end-field")[0].value];
    } else if ($("#radio-start-at")[0].checked){
      var start = $("#radio-start-at-field")[0].value;
      var duration = 60;
      var range = [undefined,undefined];
    } else if ($('#radio-autotime')[0].checked){
      var start = undefined;
      var duration = 60;
      var range = [undefined,undefined];
    }

    //function Activity(name, coords, start, end, duration, range, user_createdP, commitment) {
    var activity = new O.Activity(name,Map.currentCoords,start,undefined,undefined,range,true,"todo");
    O.activities.set(activity.id,activity);
    $("#activity_name")[0].value = '';
    $("#radio-start-end")[0].checked = false;
    $("#radio-start-field").value = '';
    $("#radio-end-field").value = '';
    $('#radio-autotime')[0].checked = false;
    $("#radio-start-at")[0].checked = false;
    $("#radio-start-at-field").value = '';
    
  });

  O.activities.selected("form",function(id,otherdata){
    console.log("the form sees that "+id+" was selected.");
    var activity = O.activities.get(id);
    $("#activity_name")[0].value = activity.name 
    if (activity.range && activity.range[0]){
      $("#radio-start-end")[0].checked = true;
      $("#radio-start-field")[0].value = activity.range[0];
      $("#radio-end-field")[0].value = activity.range[1];
    } else if (activity.start){
      $("#radio-start-at")[0].checked = true;
      var start = $("#radio-start-at-field")[0].value = activity.start;
    } else {
      $('#radio-autotime')[0].checked = true;
    }
    $('#location_text')[0].value = activity.coords;
    console.log(activity.coords);
  });
  O.activities.updated("form",function form_updated(id,olddata){
    var activity = O.activities.get(id);
    if (activity.id === O.activities.selected_activity.id){
      $("#activity_name")[0].value = activity.name;
      $("#radio-start-field").value = activity.range[0];
      $("#radio-end-field").value = activity.range[1];
      $("#radio-start-at-field").value = activity.start;
    }

  });

  $("#activity_name").keyup(function (e){
    console.log(e)
    var name = $("#activity_name")[0].value
    if (O.currentActivity){
        O.activities.update("",O.currentActivity.id,{"name":name});
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
    if (O.currentActivity){
        O.activities.update("",O.currentActivity.id,{"range":[start, O.currentActivity.range[1]]});
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
    if (O.currentActivity){
        O.activities.update("",O.currentActivity.id,{"range":[O.currentActivity.range[0], end]});
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
    if (O.currentActivity){
        O.activities.update("",O.currentActivity.id,{"start":start_at});
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
    O.currentActivity.duration = e.srcElement.value;
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


  */
}
