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

  $("#activity_name").keyup(function (e){
    console.log(e)
    var name = $("#activity_name")[0].value
    if (e.which === 40) {
      //decrement
    } else if (e.which === 38) { 
      //increment
    }
    if (O.currentActivity){
        O.activities.update("",O.currentActivity.id,{"name":name});
    }
    //TODO: check if valid time. Highlight in red if not.
  });
  $("#radio-start-field").keyup(function (e){
    console.log(e)
    var start = $("#radio-start-field")[0].value
    if (e.which === 40) {
      //decrement
    } else if (e.which === 38) { 
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
      //decrement
    } else if (e.which === 38) { 
      //increment
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
      //decrement
    } else if (e.which === 38) { 
      //increment
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
