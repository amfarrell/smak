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
    debugger;
    var name = $("#activity_name")[0].value
    if ($("#radio-start-end")[0].checked){
      var start = undefined;
      var duration = 60;
      var range = [$("#radio-start-field")[0].value,$("#radio-end-field")[0].value];
    } else if ($("#radio-start-at")[0].checked){
      var start = $("#radio-start-at-field")[0].value;
      var duration = 60;
      var range = [undefined,undefined];
    } else if ($('#radio-autotime')){
      var start = undefined;
      var duration = 60;
      var range = [$("#radio-start-field").value,$("#radio-end-field").value];
    }
    var activity = new O.Activity(name,[undefined,undefined],start,undefined,range,true,"todo");
    O.activities.set(activity.id,activity);
  });

  O.activities.selected("form",function(id,otherdata){
    debugger;
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
      $('#radio-autotime').checked = true;
    }
  });

  /*
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


  */
}
