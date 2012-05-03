  var blockHeight = 15;   // vertical pixels per 15 minute chunk
  var startTime = new Date(Date.parse("9:30AM"));      //hour of the day (in military time)
  var schedule = "                                          ";      // currently displayed schedule
  var activitiesListPos = 0; // position of the end of the activities list. (counted in 15 min blocks)
  var scheduleItemWidth = 260;  //pixels width of schdeduleItem
  var borderMarginHeight = 5;  //pixels width of border and margin of schdeduleItem
  
  $('html').click(function() {
    deselectItem();
  });
  
  function initHeights() {
    $('.schedule').height(blockHeight*schedule.length);    
    //$('.scheduleGrid').height(blockHeight*schedule.length);  
    $('.activitiesContainer').height(blockHeight*schedule.length);
    $('.activitiesResizeContainer').height(blockHeight*schedule.length);
    $('.activitiesList').height(blockHeight*schedule.length);
  }

  function initActivitiesList() {
    for (var i in O.activities.all()) {
      if (!O.activities.get(i).scheduledP) {
        addActivity(i, O.activities.get(i).duration/15)
        O.activities.todo('schedule',i);
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
    $('#startTimeCell').html("Start Day at <input  onchange='changeDayStartEndTimes()' type='time' size='6' id='startTime' name='startTime' value='"+ startTime.toString("h:mmtt")+"'/>");
    $('#startTime').calendricalTime();
    $('.scheduleGrid').append("<table cellspacing='0'></table");
    for (var i=0; i<schedule.length; i++) {
      var time = (parseFloat(startTime.toString("h")) + startTime.toString("mm")/60 + i/4)%12;
      if (time==Math.floor(time)) { 
        if (time==0) time = 12;
        if (i > schedule.length - 4){//last time block is a partial hour
          console.log("schedule.length "+schedule.length-i+" " + i + " " +schedule.length);
          $('.scheduleGrid table').append("<tr><td class='gridTime' style='width:18px'>"+time+"</td><td class='gridSpace' style='width:278px'></td></tr>");
          $('.scheduleGrid td.gridTime:last').height(blockHeight*(schedule.length-i)-2);
          $('.scheduleGrid td.gridSpace:last').height(blockHeight*(schedule.length-i)-2);
        }else{  //normal blocks
          $('.scheduleGrid table').append("<tr><td class='gridTime' style='width:18px'>"+time+"</td><td class='gridSpace' style='width:278px'></td></tr>");
          $('.scheduleGrid td.gridTime:last').height(blockHeight*4-2);
          $('.scheduleGrid td.gridSpace:last').height(blockHeight*4-2);
        }
      }else if(i==0){ //first time block is a partial hour
        $('.scheduleGrid table').append("<tr><td class='gridTime' style='width:18px'></td><td class='gridSpace' style='width:278px'></td></tr>");
        $('.scheduleGrid td.gridTime:last').height(blockHeight*(4-(time-Math.floor(time))*4)-2);
        $('.scheduleGrid td.gridSpace:last').height(blockHeight*(4-(time-Math.floor(time))*4)-2);
      }
    }
    //$('.scheduleGrid td').height(blockHeight*4-2);
    $('.scheduleGrid').append("End Day at <input onchange='changeDayStartEndTimes()' type='time' size='6' id='endTime' name='endTime' value='"+ endTime.toString("h:mmtt")+"'/>");
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
    schedule = constrain_bounds(schedule, startDiff*4, parseFloat(endDiff)*4 + schedule.length);
    initHeights();
    drawScheduleGrid();
    updateDoBetween();
    drawSchedule(schedule);
  }
  function drawSchedule(newSchedule) {
  //XXX This also returns the list of Activity IDs.
    schedule = newSchedule;
    console.log("drawSchedule:"+ schedule);
    var prevItem="";
    var idList = [];
    var itemNum = 1;
      
    $('.schedule').html("");    //clear schedule  
    
    for (var i=0; i<schedule.length; i++) {
      var item = schedule[i];
      
      if (item != prevItem && item != " ") {
        setupActivity(item, 1, ".schedule", i, itemNum);
        idList.push(item)
              
        prevItem=item;
        itemNum +=1;
      } else if (item != " ") {
        var height = $(".schedule div.item:last").height();
        $(".schedule div.item:last").height(height+blockHeight);
        updateDuration(item);
        updateTimes(item);
      }
    }
    return idList;
  }

window.autoSchedule = function autoSchedule(){
    var unscheduledActivities = new Array();
    $(".activitiesList .item").each(function() {
      var height = Math.round(($(this).height() + borderMarginHeight) / blockHeight);
      unscheduledActivities.push(new Array(height + 1).join(($(this).attr("id"))));
    });
    console.log("partially_schedule " + schedule + ", " + unscheduledActivities);
    $(".activitiesList").html('');
    //var list = drawSchedule(partially_schedule(schedule, unscheduledActivities));
    //Map.renderPath(list);
  }

  function updateModel(id, list){
    var height = Math.round(($("#"+id).height() + borderMarginHeight) / blockHeight);
    var positionY = Math.round(($("#"+id).position().top)/blockHeight);
    O.activities.get(id).duration = height*15;
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
      O.activities.update("schedule",id,{"start":"" + hour + ":" + minute}); 
      //XXX brittle. depends on the increments being 15min.
      O.activities.schedule("schedule",id);
    } else {
      O.activities.deschedule("schedule",id);
    }
  }
  
  function updateDuration(id){
    var duration = (Math.floor($("#"+id).height())+borderMarginHeight) / blockHeight;
    if(duration<4){
      $("#"+id+" .duration").text("");
    }else{
      if (duration > 4)
        plural = "s";
      else
        plural = "";
      $("#"+id+" .duration").text((duration/4)+' Hour'+plural);
    }
      //O.activities.update("schedule",id,{"duration":duration}); 
    //XXX I think this is the wrong format.
  }
  
  function getStartTime(id){
    var positionY = Math.round(($("#"+id).position().top)/blockHeight);
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
    if (hour > 24){
      //XXX What should we do?
    }
    return hour + ":" + minute;
  }
  
  function getEndTime(id){
    var height = Math.round(($("#"+id).height() + borderMarginHeight) / blockHeight);
    var positionY = Math.round(($("#"+id).position().top)/blockHeight) + height;
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
    if (hour > 24){
      //XXX What should we do?
    }
    return hour + ":" + minute;
  }
  
  function updateTimes(id){
    var duration = (Math.floor($("#"+id).height())+borderMarginHeight) / blockHeight;
    if (($("#"+id).parents(".schedule").length>0 && $("#"+id).position().left>-160) ||  // move within schedule
       ($("#"+id).parents(".schedule").length==0 && ($("#"+id).position().left>scheduleItemWidth/2)) ){  // move from Activities to Schedule
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
    $(list).append('<div class="scheduleItem item" id='+id+'></div>');
    
    if (list == ".schedule"){
      $(list + " div.item:last").append("<div class='lock'><img src='unlock.png' alt='unlocked' /></div>");
      $(list + " div.item:last .lock").click(toggleLock);
      $(list + " div.item:last").append("<div class='activityName'>"+itemNumber+". "+O.activities.get(id).name+"</div>");
    }else{
      $(list + " div.item:last").append("<div class='activityName'>"+O.activities.get(id).name+"</div>");
    }
      $(list + " div.item:last").append("<div class='times'></div>");
    $(list + " div.item:last").append("<div class='duration'></div>");
    
    $(list + " div.item:last").corner();
    
    // Make item draggable
    $(list + " div.item:last").draggable({
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
        if ($(this).overlaps($(".doBetween" +  $(this).attr("id")+" .doBetweenTop")) ||
            $(this).overlaps($(".doBetween" +  $(this).attr("id")+" .doBetweenBottom"))) {
          $(this).addClass("outsideDoBetween");
        } else {
          $(this).removeClass("outsideDoBetween");
        }
      },
      stop: function(event, ui) { 
        var height = Math.round(($(this).height() + borderMarginHeight) / blockHeight);
        var id = $(this).attr("id");
        if ((list == ".schedule" && ($(this).position().left>-160)) ||  // move in schedule
            (list == ".activitiesList" && ($(this).position().left>scheduleItemWidth/2)) ){  // move from Activities to Schedule
          if (!$(this).overlaps($(".doBetween" +  $(this).attr("id")+" .doBetweenTop")) && // if moved to a location in the doBetween times
              !$(this).overlaps($(".doBetween" +  $(this).attr("id")+" .doBetweenBottom"))) {
                  var positionY = Math.round(($(this).position().top)/blockHeight);
                  if (list == ".activitiesList") {  // move from Activities to Schedule
                    $(this).remove();
                  }       
                  drawSchedule(edit_distance(schedule,id, positionY,height));
          }else{
            $(this).css({"left":0, "top":0}); //return to original position
          }
        } else if (list == ".schedule") {   // move from Schedule to Activities
          addActivity($(this).attr("id"), height);
          $(this).remove();
          schedule = schedule.replace(new RegExp($(this).attr("id"), 'g'), " "); // remove item from schedule
        } else {  // move within Activities
          $(this).css({"left":0, "top":0}); //return to original position
        }
        $(this).removeClass("outsideDoBetween");
        updateTimes(id);
        selectItem(id);
        updateModel(id); //We get errors if we don't change state (
      }
    })
    
    $(list + " div.item:last").append("<div class='grip-n ui-resizable-handle ui-resizable-n' id='grip-n"+id+"'></div>");
    $(list + " div.item:last").append("<div class='grip-s ui-resizable-handle ui-resizable-s' id='grip-s"+id+"'></div>");
    
    // Make item resizable
    $(list + " div.item:last").resizable({ 
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
      },
      stop: function(event, ui) {
        var id = $(this).attr("id");
        if (list == ".schedule" ) {
          var positionY = Math.round(($(this).position().top)/blockHeight);
          var height = Math.round(($(this).height() + borderMarginHeight) / blockHeight);  
          drawSchedule(edit_distance(schedule,id, positionY,height));
        } else {
          $(".activitiesList div.scheduleItem").css({
            "position": "relative",
            "left":0,
            "top":0
          });
          $(".spaceHolder").remove();
        }
        updateDuration(id);
        updateTimes(id);
        selectItem(id);
        updateModel(id);
        //O.map.drawpath(schedule);
      }
    });
    $(list + " div.item:last .ui-resizable-n").after("<div class='ui-icon ui-icon-grip-solid-horizontal-n'></div>");
    $(list + " div.item:last .ui-resizable-s").after("<div class='ui-icon ui-icon-grip-solid-horizontal-s'></div>");
    //$(list + " div.item:last .ui-resizable-n").html("<div class='grip-n'></div>");
    //$(list + " div.item:last .ui-resizable-s").html("<div class='grip-s'></div>");
    
    // Set item height
    $(list + " div.item:last").height(blockHeight*duration - borderMarginHeight);  // -2 to compensate for the border height
    updateDuration(id);
    
    // Make selectable
    $(list + " div.item:last").click(toggleItem);
    
    // Set z-index so that items are always on top
    $(list + " div.item:last").css({
        "z-index":10,
    });
    
    // Add doBetweenbox
    if($(".doBetween"+id).length==0){   // if it doesn't exist already
      drawDoBetween(id)
    }
    
    if (list==".schedule"){
      $(list + " div.item:last").css({// Set item to it's current absolute position
        "position": "absolute",
        "left":0,
        "top":verticalPos*blockHeight,
      });
      //TODO:  disable resizable and draggable if object is locked
      
      $(list + " div.item:last").draggable("option", "containment", ".doBetween"+id);
      $(list + " div.item:last").resizable("option", "containment", ".doBetween"+id);
    }else{
      $(list + " div.item:last").draggable("option", "containment", ".activitiesContainer");
      $(list + " div.item:last").resizable("option", "containment", ".activitiesResizeContainer");
    }
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
    $(".selected").removeClass('selected');
    updateDoBetweenBox();
    O.activities.deselect('schedule');
  }
  function selectItem(id){
    $(".selected:not(#"+id+")").removeClass('selected');
    $("#"+id).addClass('selected');
    updateDoBetweenBox();
    O.activities.select('schedule',id);
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

  function dateToNumber(date){ //takes date object and outputs a decimal hour time
    return parseFloat(date.toString("H")) + date.toString("mm")/60;
  }
