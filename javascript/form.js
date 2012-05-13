
var autocompleteNames = new Array();
function initSuggestedList() {
  autocompleteNames = [];
  for (var i in O.activities.all("suggested")) {
    autocompleteNames.push(O.activities.get(i).name);
  }
  $("#activity_name").autocomplete( "option", "source", autocompleteNames);
}

window.initForm = function initForm () {
  
  $("#activity_name").autocomplete({
    'minLength':1,
    'close':function(event, ui){
      $("#activity_name").keyup();
    }
  });
  initSuggestedList();
  
  O.activities.commitment_changed('form',function commitmentUpdate(i,oldState){
    var activity = O.activities.get(i);
    if (oldState=='suggested' || activity.commitment == 'suggested'){
      initSuggestedList();
    }
  });
  
  $("#make_event").click(function(e){
    var userDefined = true;
    var name = $("#activity_name")[0].value
    var start = undefined;
    var duration = 60;
    var coords = [window.tempMarker.getPosition().lat(),window.tempMarker.getPosition().lng()];
    var range = [$("#radio-start-field")[0].value,$("#radio-end-field")[0].value];

    for (var i in O.activities.all("suggested")) {
      var activity = O.activities.get(i);
      if (name == activity.name){
        activity.coords = coords;
        activity.range = range;
        userDefined = false;
        break;
      }
    }
    
    if (userDefined){
      var activity = new O.Activity(name,coords,undefined,undefined,duration,range,true,"suggested");
      O.activities.set(activity.id,activity);
    }
    O.activities.todo('',activity.id);
    
    $("#activity_name").val("");
    $("#radio-start-field").val("");
    $("#radio-end-field").val("");
    
    if (window.tempMarker){
      window.tempMarker.setMap(null);
      window.tempMarker=null;
    }
    $(".doBetween-1").remove();
    
    saveState();
  });

  O.activities.selected("form",function(id,otherdata){
    if (window.tempMarker){
      window.tempMarker.setMap(null);
      window.tempMarker=null;
    }
    $(".doBetween-1").remove();
    
    //console.log("the form sees that "+id+" was selected.");
    var activity = O.activities.get(id);
    $("#activity_name").val(activity.name);
    $("#activity_name").attr('disabled','disabled');
    if (activity.range && activity.range[0]){
      $("#radio-start-field").val(new Date(Date.parse(activity.range[0])).toString("h:mmtt"));
      $("#radio-end-field").val(new Date(Date.parse(activity.range[1])).toString("h:mmtt"));
    }
    $("#activity").addClass("activitySelected");
  });

  O.activities.deselected("form",function(id,otherdata){
    //console.log("the form sees that "+id+" was de-selected.");
    var activity = O.activities.get(id);
    $("#activity_name").val("");
    $("#activity_name").removeAttr('disabled');  
    $("#radio-start-field").val("");
    $("#radio-end-field").val("");
    $("#activity").removeClass("activitySelected");    
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
    if (e.keyCode == 13){ //sumbit on enter
      if (O.activities.selected_activity){
        O.activities.deselect('');
      }else{
        $("#make_event").click();
      }
      return;
    }
    
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
          drawDoBetween(-1);
          return;
        }
      }
      
      if (window.tempMarker==null || window.tempMarker.getTitle()!=undefined){
        newMarker();
        $("#radio-start-field").val(startTime.toString("h:mmtt"));
        $("#radio-end-field").val(new Date( startTime.valueOf()).addHours(schedule.length/4).toString("h:mmtt"));
      }
    }
    drawDoBetween(-1);
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
  $("#radio-start-field").change(function (e){
    console.log(e);
    var start = $("#radio-start-field")[0].value;
    if (O.activities.selected_activity){
        O.activities.update("",O.activities.selected_activity.id,{"range":[start, O.activities.selected_activity.range[1]]});
    }else{
      drawDoBetween(-1);
    }
    //TODO: check if valid time. Highlight in red if not.
  });
  $("#radio-end-field").change(function (e){
    console.log(e);
    var end = $("#radio-end-field")[0].value
    if (O.activities.selected_activity){
        O.activities.update("",O.activities.selected_activity.id,{"range":[O.activities.selected_activity.range[0], end]});
    }else{
      drawDoBetween(-1);
    }
    //TODO: check if valid time. Highlight in red if not.
  });
}
