  var blockHeight = 12;   // vertical pixels per 15 minute chunk
  var startTime = new Date(Date.parse("9:30AM"));      //hour of the day (in military time)
  var schedule = "                                          ";      // currently displayed schedule
  var scheduleHashMap = new Array();
  scheduleHashMap[' '] = ' ';
  var lastLetter = 'A';
  var activitiesListPos = 0; // position of the end of the activities list. (counted in 15 min blocks)
  var scheduleItemWidth = 260;  //pixels width of schdeduleItem
  var borderMarginHeight = 5;  //pixels width of border and margin of schdeduleItem
  var stateHistory = new Array(); //for undos
  var currentStateIndex = -1;

  var initScheduleListeners = function initScheduleListeners(){
    O.activities.updated('schedule',function scheduleUpdate(i,oldvalues){
      //Do stuff after an item's value is updated
      var activity = O.activities.get(i);
      for (key in oldvalues){
      console.log("the schedule sees that "+key+" changed in activity "+i+" from "+oldvalues[key]+" to "+activity[key]+".");

        if (key == "name"){
          $("#"+i+" .activityName").html(activity.name);
        }
        if (key == "range"){
          drawDoBetween(i);
          updateDoBetweenBox();
        }
        if (key == "duration"){
          // TODO: change duration
        }
      } 
    });
    O.activities.commitment_changed('schedule',function commitmentUpdate(i,oldState){
      //Do stuff after an item changes commitment state
      var activity = O.activities.get(i);
      if (oldState!='todo' && activity.commitment == 'todo'){
        $("#"+i).remove();
        addActivity(i, O.activities.get(i).duration/15);
      }else if (oldState == 'todo' && activity.commitment == 'scheduled'){
        $("#"+i).remove();
        var letter = hashMapContains(i);
        if (letter == false){
          lastLetter = String.fromCharCode(lastLetter.charCodeAt() + 1);
          scheduleHashMap[lastLetter] = i;
          letter = lastLetter;
        }
        drawSchedule(edit_distance(schedule,i, positionY,height, scheduleHashMap));
      }
    });
    O.activities.selected("schedule",function scheduleDeselected(id,empty_map){
      console.log("the schedule sees that "+id+" has been selected.");
      //Do stuff after the item is deselected.
      $(".selected:not(#"+id+")").removeClass('selected');
      $("#"+id).addClass('selected');
      updateDoBetweenBox();
    });
    O.activities.deselected("schedule",function scheduleSelected(id,empty_map){
      $(".selected").removeClass('selected');
      updateDoBetweenBox();
      O.activities.deselect('schedule');
      console.log("the schedule sees that "+id+" has been deselected.");
      //Do stuff after the item is deselected.
    });
  }

  function initHeights() {
    $('.schedule').height(blockHeight*schedule.length);    
    //$('.scheduleGrid').height(blockHeight*schedule.length);  
    $('.activitiesContainer').height(blockHeight*schedule.length);
    $('.activitiesResizeContainer').height(blockHeight*schedule.length);
    $('.activitiesList').height(blockHeight*schedule.length);
  }

  function initActivitiesList() {
    $(".activitiesList").html("");
    for (var i in O.activities.all()) {
      if (i > 6){
        break;
      }
      if (O.activities.get(i).commitment=="todo") {
        addActivity(i, O.activities.get(i).duration/15);
      }
    }
  }

  function addActivity(id, duration) { //duration in 15 min blocks
    setupActivity(id, duration, ".activitiesList", activitiesListPos, 0);
    activitiesListPos += duration
  }

  function drawScheduleGrid() {
    var endTime =  new Date( startTime.valueOf()).addHours(schedule.length/4);
    
    $('.scheduleGrid').html("<div class='schedule'>  </div>");
    $('#startTimeCell').html("Start Day at <input readonly='readonly' onchange='changeDayStartEndTimes()' type='time' size='8' id='startTime' name='startTime' value='"+ startTime.toString("h:mmtt")+"'/>");
    $('#startTime').calendricalTime();
    $('.scheduleGrid').append("<table cellspacing='0'></table");
    for (var i=0; i<schedule.length; i++) {
      var time = (parseFloat(startTime.toString("h")) + startTime.toString("mm")/60 + i/4)%12;
      if (time==Math.floor(time)) { 
        if (time==0) time = 12;
        if (i > schedule.length - 4){//last time block is a partial hour
          console.log("schedule.length "+schedule.length-i+" " + i + " " +schedule.length);
          $('.scheduleGrid table').append("<tr><td class='gridTime' style='width:18px'>"+time+"</td><td class='gridSpace' style='width:228px'></td></tr>");
          $('.scheduleGrid td.gridTime:last').height(blockHeight*(schedule.length-i)-2);
          $('.scheduleGrid td.gridSpace:last').height(blockHeight*(schedule.length-i)-2);
        }else{  //normal blocks
          $('.scheduleGrid table').append("<tr><td class='gridTime' style='width:18px'>"+time+"</td><td class='gridSpace' style='width:228px'></td></tr>");
          $('.scheduleGrid td.gridTime:last').height(blockHeight*4-2);
          $('.scheduleGrid td.gridSpace:last').height(blockHeight*4-2);
        }
      }else if(i==0){ //first time block is a partial hour
        $('.scheduleGrid table').append("<tr><td class='gridTime' style='width:18px'></td><td class='gridSpace' style='width:228px'></td></tr>");
        $('.scheduleGrid td.gridTime:last').height(blockHeight*(4-(time-Math.floor(time))*4)-2);
        $('.scheduleGrid td.gridSpace:last').height(blockHeight*(4-(time-Math.floor(time))*4)-2);
      }
    }
    //$('.scheduleGrid td').height(blockHeight*4-2);
    $('.scheduleGrid').append("<br />End Day at <input readonly='readonly' onchange='changeDayStartEndTimes()' type='time' size='8' id='endTime' name='endTime' value='"+ endTime.toString("h:mmtt")+"'/>");
    $('#endTime').calendricalTime();
    //TODO: modify length of the map so that they line up roughly.
  }

  function changeDayStartEndTimes(){
    var endTime =  new Date( startTime.valueOf()).addHours(schedule.length/4);
    var newStartTime = new Date(Date.parse($('#startTime').val()));
    var newEndTime = new Date(Date.parse($('#endTime').val()));
    var startDiff = parseFloat(newStartTime.toString("H")) + newStartTime.toString("mm")/60 - (parseFloat(startTime.toString("H")) + startTime.toString("mm")/60);
    var endDiff = parseFloat(newEndTime.toString("H")) + newEndTime.toString("mm")/60 - (parseFloat(endTime.toString("H")) + endTime.toString("mm")/60);
    startTime = newStartTime;
    schedule = constrain_bounds(schedule, startDiff*4, parseFloat(endDiff)*4 + schedule.length, scheduleHashMap);
    initHeights();
    drawScheduleGrid();
    updateDoBetween();
    drawSchedule(schedule);
  }
  function undo(){
    loadState(currentStateIndex-1);
  }
  function redo(){
    loadState(currentStateIndex+1);
  }
  function loadState(i){
    currentStateIndex = i;
    var state = stateHistory[i];
    console.log(state);
    var newSchedule = state[0];
    startTime = state[1];
    
    // remove all markers
    for (var i in O.activities.all()) {
      O.activities.get(i).marker.setMap(null);
    }
    $.jStorage.flush();
    for (var j=0; j<state[2].length; j++){
      state[2][j].marker=null;
      var id = JSON.stringify(j)
      O.activities.set(id,state[2][j]); 
      var activity = O.activities.get(id);
      activity.marker = Map.placeMarker(activity);
    }
    initActivitiesList();
    drawScheduleGrid();
    drawSchedule(newSchedule, true);
    undoButtons();
  }
  function saveState(){
    var activities = [];
    
    for (var i in O.activities.all()) {
      var a = $.extend(true, {}, O.activities.get(i));
      activities.push(a);
    }
    var state = [schedule, startTime, activities];
    currentStateIndex++;
    stateHistory[currentStateIndex]=state;
    undoButtons();
  }
  
  function undoButtons(){
    if (currentStateIndex == 0)
      $("#undo").attr("disabled", "disabled");
    else
      $("#undo").removeAttr("disabled");   
      
    if (currentStateIndex == (stateHistory.length - 1))
      $("#redo").attr("disabled", "disabled");
    else
      $("#redo").removeAttr("disabled");   
  }
  
  function drawSchedule(newSchedule, undoing) {
  //XXX This also returns the list of Activity IDs.
    schedule = newSchedule;
    console.log("drawSchedule:"+ schedule);
    var prevItem="";
    var idList = [];
    var itemNum = 1;
    var item;
      
    $('.schedule').html("");    //clear schedule  
    
    for (var i=0; i<schedule.length; i++) {
      item = scheduleHashMap[schedule[i]];
      
      if (item != prevItem){
        if (prevItem!="") updateModel(prevItem);
        if(item != " ") {
          setupActivity(item, 1, ".schedule", i, itemNum);
          idList.push(item);
                
          prevItem=item;
          itemNum +=1;
        }
      } else if (item != " ") {
        var height = Math.round(($(".schedule div.item:last").height()+borderMarginHeight)/blockHeight) * blockHeight - borderMarginHeight; // remove rounding errors
        $(".schedule div.item:last").height(height+blockHeight);
        updateDuration(item);
        updateTimes(item);
      }
    }
    if (item!=" ") updateModel(item);
    O.activities.update;
    Map.renderPath(idList);
    if (typeof(undoing)==='undefined') saveState();
    return idList;
  }

window.autoSchedule = function autoSchedule(){
    var unscheduledActivities = new Array();
    $(".activitiesList .item").each(function() {
      var height = Math.round(($(this).height() + borderMarginHeight) / blockHeight);
      var id = $(this).attr("id")
      var letter = hashMapContains(id);
      if (letter == false){
        lastLetter = String.fromCharCode(lastLetter.charCodeAt() + 1);
        scheduleHashMap[lastLetter] = id;
        letter = lastLetter;
      }
      unscheduledActivities.push(new Array(height + 1).join(letter));
      
    });
    console.log("partially_schedule " + schedule + ", " + unscheduledActivities);
    $(".activitiesList").html('');
    var list = drawSchedule(partially_schedule(schedule, unscheduledActivities, scheduleHashMap));
    Map.renderPath(list);
  }

  function updateModel(id, list){
    var height = getDuration(id);
    var positionY = getPositionY(id);
    var duration = height*15;
    if ($("#"+id).parents(".schedule").length>0) {
      var minute = Math.floor(15*(positionY%4) +  startTime.getMinutes("mm"));
      var hour = Math.floor(positionY/4) + parseFloat(startTime.toString("H"));
      if (minute >= 60){
        hour = ""+(hour + Math.floor(minute/60));
        minute = ""+ (minute%60);
      } else {
        hour = ""+hour
        minute = ""+ minute
      }
      if (hour.length < 2){
        hour = "0"+hour
      }
      if (minute.length < 2){
        minute = "0"+minute
      }
      if (hour > 24){
        //XXX What should we do?
      }
      var endmin = minute + duration;
      var endhr = hour;
      while (endmin > 59){
        endmin = endmin - 60;
        endhr = endhr +1;
      }
      O.activities.update("schedule",id,{"start":"" + hour + ":" + minute, "end":""+endhr+":"+endmin,"duration":duration}); 
      //XXX brittle. depends on the increments being 15min.
      O.activities.schedule("schedule",id);
    } else {
      O.activities.deschedule("schedule",id);
      O.activities.update("schedule",id,{"start":undefined, "end":undefined}); 
    }
  }
  
  function updateDuration(id){
    var duration = getDuration(id);
    if(duration<4){
      $("#"+id+" .duration").text("");
    }else{
      if (duration > 4)
        plural = "s";
      else
        plural = "";
      $("#"+id+" .duration").text((duration/4)+' Hour'+plural);
    }
    
    if (duration <6 && duration>=4){
      $("#"+id+" .activityCenter").css("margin-top", "-2px");
    }else{
      $("#"+id+" .activityCenter").css("margin-top", "");
    }
      //O.activities.update("schedule",id,{"duration":duration}); 
    //XXX I think this is the wrong format.
  }
  
  function getStartTime(id){
    var positionY = getPositionY(id);
    var minute = Math.floor(15*(positionY%4) +  startTime.getMinutes("mm"));
    var hour = Math.floor(positionY/4) + parseFloat(startTime.toString("H"));
    if (minute >= 60){
      hour = ""+(hour + Math.floor(minute/60));
      minute = ""+ (minute%60);
    } else {
      hour = ""+hour
      minute = ""+ minute
    }
    if (minute.length < 2){
      minute = "0"+minute
    }
    hour = hour%12;
    if (hour == 0){
      hour = 12;
    }
    return hour + ":" + minute;
  }
  
  function getEndTime(id){
    var height = getDuration(id);
    var positionY = getPositionY(id) + height;
    var minute = Math.floor(15*(positionY%4) +  startTime.getMinutes("mm"));
    var hour = Math.floor(positionY/4) + parseFloat(startTime.toString("H"));
    if (minute >= 60){
      hour = ""+(hour + Math.floor(minute/60));
      minute = ""+ (minute%60);
    } else {
      hour = ""+hour
      minute = ""+ minute
    }
    if (minute.length < 2){
      minute = "0"+minute
    }
    hour = hour%12;
    if (hour == 0){
      hour = 12;
    }
    return hour + ":" + minute;
  }
  
  function updateTimes(id){
    var duration = getDuration(id);
    if (($("#"+id).parents(".schedule").length>0 && $("#"+id).position().left>-160) ||  // move within schedule
       ($("#"+id).parents(".schedule").length==0 && ($("#"+id).position().left>scheduleItemWidth/2)) ){  // move from Activities to Schedule
          var start = getStartTime(id);
          var end = getEndTime(id);
          if(duration<4){   // if the activity is too short, hide the times
            $("#"+id+" .times").text("");
          }else{
            $("#"+id+" .times").text(getStartTime(id) + " - " + getEndTime(id));
          }
    }else{    // if the activity is hovering over the activities list, hide the times
      $("#"+id+" .times").text("");
    }
  }
  
  function toggleLock(event){
    var id = $(this).parent(".item").attr("id");
    if ($(this).children("img").attr("src") == 'unlock.png'){
      $(this).html("<img src='lock.png' alt='locked' /></a>");
      $("#" + id).draggable( "disable" );
      $("#" + id).resizable( "disable" );
      event.stopPropagation();    
      O.activities.lock('schedule',id);
    }else{
      $(this).html("<img src='unlock.png' alt='unlocked' /></a>");
      $("#" + id).draggable( "enable" );
      $("#" + id).resizable( "enable" );
      event.stopPropagation();    
      O.activities.unlock('schedule',id);
    }
  }
  function setupActivity(id, duration, list, verticalPos, itemNumber){  //list = ".schedule" or ".activitiesList"
    $("#" + id).remove();
    if (list == ".activitiesList"){ 
      if($(".activitiesList .scheduleItem").length == 0) $(list).append('<div class="scheduleItem item" id='+id+'></div>'); //add first item
      else{ // insert into list
        $(".activitiesList .scheduleItem").each(function(){
              if ($(this).attr('id') > id) {
                  $(this).before('<div class="scheduleItem item" id='+id+'></div>');
                  return false;
              }
        });
        if ($("#" + id).length == 0){ // if still not added, add to end of list
          $(".activitiesList").append('<div class="scheduleItem item" id='+id+'></div>');
        }
      }
    }else
      $(".schedule").append('<div class="scheduleItem item" id='+id+'></div>');
        
    // Make item draggable
    $("#" + id).draggable({
      snap: '.schedule, .activitiesList',
      snapMode: "inner",
      cursor: "move",
      stack: "div.item",
      opacity: 0.75, 
      start:function(event,ui) {
        selectItem(id);
      },
      drag:function(){
        updateTimes(id);
        if ($(this).overlaps($(".doBetween" +  $(this).attr("id")+" .doBetweenTop"))){
          if ($(".error").length == 0) $(this).append("<div class='error'>Cannot be placed before "+O.activities.get(id).range[0]+".</div>");
          else $(".error").html("Cannot be placed before "+O.activities.get(id).range[0]);
        }else if($(this).overlaps($(".doBetween" +  $(this).attr("id")+" .doBetweenBottom"))){
          if ($(".error").length == 0) $(this).append("<div class='error'>Cannot be placed after "+O.activities.get(id).range[1]+".</div>");
          else $(".error").html("Cannot be placed after "+O.activities.get(id).range[1]);
        }else if($(this).overlaps($(".ui-draggable-disabled"))) {
          if ($(".error").length == 0) $(this).append("<div class='error'>Cannot be placed on a locked activity.</div>");
          else $(".error").html("Cannot be placed on a locked activity.");
        }else{
          $(".error").remove();
        }
        
        if ($(".error").length == 0){
          $(this).removeClass("outsideDoBetween");
        }else{
          $(this).addClass("outsideDoBetween");
        }
      },
      stop: function(event, ui) { 
        var id = $(this).attr("id");
        var height = getDuration(id);
        if ((list == ".schedule" && ($(this).position().left>-160)) ||  // move in schedule
            (list == ".activitiesList" && ($(this).position().left>scheduleItemWidth/2)) ){  // move from Activities to Schedule
          if (!$(this).overlaps($(".doBetween" +  $(this).attr("id")+" .doBetweenTop")) && // if moved to a location not in the doBetween times
              !$(this).overlaps($(".doBetween" +  $(this).attr("id")+" .doBetweenBottom")) &&
              !$(this).overlaps($(".ui-draggable-disabled"))) { //or on a locked item
                  var positionY = getPositionY(id);
                  if (list == ".activitiesList") {  // move from Activities to Schedule
                    $(this).remove();
                  }      
                  var letter = hashMapContains(id);
                  if (letter == false){
                    lastLetter = String.fromCharCode(lastLetter.charCodeAt() + 1);
                    scheduleHashMap[lastLetter] = id;
                    letter = lastLetter;
                  }
                  console.log(scheduleHashMap);
                  drawSchedule(edit_distance(schedule,letter, positionY, height, scheduleHashMap));
          }else{
            $(this).css({"left":ui.originalPosition.left, "top":ui.originalPosition.top}); //return to original position
          }
        } else if (list == ".schedule") {   // move from Schedule to Activities
          addActivity($(this).attr("id"), height);
          $(this).remove();
          schedule = schedule.replace(new RegExp($(this).attr("id"), 'g'), " "); // remove item from schedule
          
					var new_activities = get_id_list(schedule.split(""));
					Map.renderPath(new_activities);
					saveState();
					
        } else {  // move within Activities
          $(this).css({"left":0, "top":0}); //return to original position
        }
        $(".error").remove();
        $(this).removeClass("outsideDoBetween");
        updateTimes(id);
        selectItem(id);
        updateModel(id); //We get errors if we don't change state (
      }
    });
    
    $("#" + id).append("<div class='grip-n ui-resizable-handle ui-resizable-n' id='grip-n"+id+"'></div>");
    $("#" + id).append("<div class='grip-s ui-resizable-handle ui-resizable-s' id='grip-s"+id+"'></div>");
    
    // Make item resizable
    $("#" + id).resizable({ 
      //handles: "n,s",
      handles: {n: "#grip-n"+id,
                s: "#grip-s"+id},
      grid: [1, blockHeight],
      minHeight: blockHeight*2 - borderMarginHeight,
      //minWidth: 258,
      start: function(event, ui) {  
        $(this).after("<div class='spaceHolder' style='height:"+ ($(this).height()+borderMarginHeight) +"px'></div>");
        selectItem(id);
      },
      resize:function(event, ui) {  
        updateDuration(id);
        updateTimes(id);
        if ($(this).overlaps($(".ui-draggable-disabled")) && $(".error").length == 0) {
          $(this).append("<div class='error'>Cannot be placed on a locked activity.</div>");
          $(this).addClass("outsideDoBetween");
        } else if($(".error").length == 0){
          $(".error").remove();
          $(this).removeClass("outsideDoBetween");
        }
      },
      stop: function(event, ui) {
        var id = $(this).attr("id");
        console.log(ui);
        if (list == ".schedule" ) {
          var positionY = getPositionY(id);
          var height = getDuration(id);
          if (!$(this).overlaps($(".ui-draggable-disabled"))) { // not on a locked item   
            var letter = hashMapContains(id);
            drawSchedule(edit_distance(schedule,letter, positionY,height, scheduleHashMap));
          }else{
            $(this).css({"left":ui.originalPosition.left, "top":ui.originalPosition.top, "height":ui.originalSize.height}); //return to original position
          }
        } else {
          $(".activitiesList div.scheduleItem").css({
            "position": "relative",
            "left":0,
            "top":0
          });
          $(".spaceHolder").remove();
        }
        $(".error").remove();
        $(this).removeClass("outsideDoBetween");
        updateDuration(id);
        updateTimes(id);
        selectItem(id);
        updateModel(id);
        //Map.renderPath(list);
      }
    });
    $("#" + id+ " .ui-resizable-n").after("<div class='ui-icon ui-icon-grip-solid-horizontal-n'></div>");
    $("#" + id+ " .ui-resizable-s").after("<div class='ui-icon ui-icon-grip-solid-horizontal-s'></div>");
    //$(list + " div.item:last .ui-resizable-n").html("<div class='grip-n'></div>");
    //$(list + " div.item:last .ui-resizable-s").html("<div class='grip-s'></div>");
    
    // Set item height
    $("#" + id).height(blockHeight*duration - borderMarginHeight);  // -2 to compensate for the border height
    
    // Make selectable
    $("#" + id).bind('click touchstart touchend',toggleItem);
    
    // Set z-index so that items are always on top
    $("#" + id).css({
        "z-index":10,
    });
    
    // Add doBetweenbox
    if($(".doBetween"+id).length==0){   // if it doesn't exist already
      drawDoBetween(id)
    }
    
    if (list == ".schedule"){
      if(O.activities.get(id).commitment == "locked"){
        $("#" + id).append("<div class='lock'><img src='lock.png' alt='locked' /></div>");
        $("#" + id).draggable( "disable" );
        $("#" + id).resizable( "disable" );
      }else
        $("#" + id).append("<div class='lock'><img src='unlock.png' alt='unlocked' /></div>");
      $("#" + id + " .lock").click(toggleLock);
      var letter = String.fromCharCode(64+itemNumber);
      $("#" + id).append("<div class='activityCenter'><img height='5px' src='Google Maps Markers/darkgreen_Marker"+letter+".png' alt='"+letter+"'/>"+O.activities.get(id).name+"</div>");
     
      $("#" + id).css({// Set item to it's current absolute position
        "position": "absolute",
        "left":0,
        "top":verticalPos*blockHeight,
      });
      
      $("#" + id).draggable("option", "containment", ".doBetween"+id);
      $("#" + id).resizable("option", "containment", ".doBetween"+id);
    }else{    // activitiesList 
      $("#" + id).append("<div class='activityCenter'><div class='activityName'>"+O.activities.get(id).name+"</div></div>");
      $("#" + id).draggable("option", "containment", ".activitiesContainer");
      $("#" + id).resizable("option", "containment", ".activitiesResizeContainer");
    }
    $("#" + id).append("<div class='times'></div>");
    $("#" + id).append("<div class='duration'></div>");

    
    $("#" + id).corner();
    
    updateDuration(id);
    updateModel(id);
    updateTimes(id);
  }
  
  function updateDoBetween(){
    for (var i in O.activities.all()) {
      drawDoBetween(i);
    }
  }
  
  function drawDoBetween(id){
    var range = O.activities.get(id).range;
    var boxStartTime = new Date(Date.parse(range[0]));
    var endTime =  new Date( startTime.valueOf()).addHours(schedule.length/4);
    var startPosition = dateToNumber(boxStartTime) - dateToNumber(startTime);  //in hours
    if (startPosition<0) startPosition = 0;
    if (dateToNumber(new Date(Date.parse(range[1]))) > dateToNumber(endTime)) 
      var endPosition =  dateToNumber(endTime) - dateToNumber(startTime); // in hours
    else 
      var endPosition = dateToNumber(new Date(Date.parse(range[1]))) - dateToNumber(startTime); // in hours
    
    var boxDuration = endPosition - startPosition; // in hours
    
    $(".doBetween"+id).remove()   //remove if already exists
    $(".doBetweenContainerContainer").append('<div class="doBetweenContainer doBetween'+id+'"><div class="doBetweenTop"></div><div class="doBetweenBottom"></div></div>');
    $(".doBetween"+id).css("z-index",-2).fadeTo(1,0);
    $(".doBetween"+id).height(blockHeight*boxDuration*4);
    $(".doBetween"+id).css("top",startPosition*blockHeight*4);
    
    $(".doBetween"+id+" .doBetweenTop").height(blockHeight*startPosition*4);
    $(".doBetween"+id+" .doBetweenTop").css("top",-blockHeight*startPosition*4);
    
    $(".doBetween"+id+" .doBetweenBottom").height(blockHeight*(schedule.length - endPosition*4));
    $(".doBetween"+id+" .doBetweenBottom").css("bottom",-(blockHeight*(schedule.length - endPosition*4)));
  }

  /*
   * XXX these should take either an event or an id of the activity represented.
   */
  function toggleItem(event){
    if(!$(this).hasClass('selected')){
      selectItem($(this).attr("id"));
    }else{
      $(".selected").removeClass('selected');
      O.activities.deselect('schedule',this.id);
      updateDoBetweenBox();
    }
    event.stopPropagation();
  }
  function deselectItem(){
    //Do stuff before the item is deselected.
    /*
    $(".selected").removeClass('selected');
    updateDoBetweenBox();
    */
    O.activities.deselect('');
  }
  function selectItem(id){
    //Do stuff before the item is selected.
    /*
    $(".selected:not(#"+id+")").removeClass('selected');
    $("#"+id).addClass('selected');
    updateDoBetweenBox();
    */
    O.activities.select('',id);
  }

  function updateDoBetweenBox(){
    if($(".selected").length){
      $(".doBetweenContainer:not(.doBetween"+$(".selected").attr("id")+")").css("z-index",-2).fadeTo(1,0);
      $(".doBetween" +  $(".selected").attr("id")).css("z-index",1).fadeTo(1,1);
    }else{
      $(".doBetweenContainer").css("z-index",-2).fadeTo(1,0);
    }
  }
  
  function pad(number, length) {
    var str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
  }

  function getDuration(id){ // gets the duration (in # of 15 minute blocks) of the item from the size of the box
    return Math.round(($("#"+id).height() + borderMarginHeight) / blockHeight);
  }
  
  function getPositionY(id){ // gets the position (in # of 15 minute blocks from start) of the item from the location of the box
    return Math.round(($("#"+id).position().top)/blockHeight);
  }
  function dateToNumber(date){ //takes date object and outputs a decimal hour time
    return parseFloat(date.toString("H")) + date.toString("mm")/60;
  }
  
  function hashMapContains(id){
    for(var key in scheduleHashMap){
      if (scheduleHashMap[key] == id) 
        return key;
    }
    return false;
  }

