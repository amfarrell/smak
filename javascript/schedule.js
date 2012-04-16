window.initSchedule = function initSchedule () {
  var blockHeight = 15;   // vertical pixels per 15 minute chunk
  var startTime = 9;      //hour of the day (in military time)
  var schedule = "                                            ";      // currently displayed schedule
  var activitiesListPos = 0; // position of the end of the activities list. (counted in 15 min blocks)
  var scheduleItemWidth = 260;  //pixels width of schdeduleItem
  var borderWidth = 1;  //pixels width of border of schdeduleItem

  function initHeights() {
    $('.schedule').height(blockHeight*schedule.length);    
    $('.scheduleGrid').height(blockHeight*schedule.length);  
    $('.activitiesContainer').height(blockHeight*schedule.length);
    $('.activitiesResizeContainer').height(blockHeight*schedule.length);
    $('.activitiesList').height(blockHeight*schedule.length);
  }

  function initActivitiesList() {
    for (var i in O.activities.all()) {
      if (!O.activities.get(i).scheduledP) {
        addActivity(i, O.activities.get(i).duration/15)
        O.activities.add(i);
      }
    }
  }

  function addActivity(id, duration) { //duration in 15 min blocks
    setupActivity(id, duration, ".activitiesList", activitiesListPos);
    activitiesListPos += duration
  }

  function drawScheduleGrid() {
    $('.scheduleGrid').append("<table cellspacing='0'></table");
    for (var i=0; i<schedule.length; i++) {
      if (i%4==0) {
        var time = (startTime + i/4)%12;
        if (time==0) time = 12;
        $('.scheduleGrid table').append("<tr><td style='width:18px'>"+time+"</td><td style='width:278px'></td></tr>");
      }
    }
    $('.scheduleGrid td').height(blockHeight*4-2);
    //TODO: modify length of the map so that they line up roughly.
  }

  function drawSchedule(newSchedule) {
    schedule = newSchedule;
    var prevItem="";
      
    $('.schedule').html("");    //clear schedule  
    
    for (var i=0; i<schedule.length; i++) {
      var item = schedule[i];
      
      if (item != prevItem && item != " ") {
        setupActivity(item, 1, ".schedule", i);
              
        prevItem=item;
      } else if (item != " ") {
        var height = $(".schedule div.item:last").height();
        $(".schedule div.item:last").height(height+blockHeight);
      }
    }
  }

  function autoSchedule(){
    var unscheduledActivities = new Array();
    $(".activitiesList .item").each(function() {
      var height = Math.round(($(this).height() + borderWidth*2) / blockHeight);
      unscheduledActivities.push(new Array(height + 1).join(($(this).attr("id"))));
    });
    console.log("partially_schedule " + schedule + ", " + unscheduledActivities);
    $(".activitiesList").html('');
    drawSchedule(partially_schedule(schedule, unscheduledActivities));

  }

  function updateModel(id, list){
    var height = Math.round(($("#"+id).height() + borderWidth*2) / blockHeight);
    var positionY = Math.round(($("#"+id).position().top)/blockHeight);
    O.activities.get(id).duration = height*15;
    if ($("#"+id).parents(".schedule").length>0) {
      O.activities.get(id).start = positionY
      O.activities.get(id).scheduledP = true;
    } else {
      O.activities.get(id).scheduledP = false;
    }
    console.log(O.activities.get(id));
  }

  function setupActivity(id, duration, list, verticalPos){  //list = ".schedule" or ".activitiesList"
    $(list).append('<div class="scheduleItem item" id='+id+'>'+O.activities.get(id).name+'</div>');
      
    // Make item draggable
    $(list + " div.item:last").draggable({
      snap: '.schedule, .activitiesList',
      snapMode: "inner",
      cursor: "move",
      stack: "div.item", 
      opacity: 0.75, 
      start:function(event,ui) {
        $(this).each(selectItem);
      },
      drag:function(){
        if ($(this).overlaps($("#doBetween" +  $(this).attr("id")+" .doBetween"))) {
          $("#doBetween" +  $(this).attr("id")+" .doBetween").addClass("hover");
        } else {
          $("#doBetween" +  $(this).attr("id")+" .doBetween").removeClass("hover");
        }
      },
      stop: function(event, ui) { 
        var height = Math.round(($(this).height() + borderWidth*2) / blockHeight);
        var id = $(this).attr("id");
        if ((list == ".schedule" && ($(this).position().left>-160)) ||  // move in schedule
            (list == ".activitiesList" && ($(this).position().left>scheduleItemWidth/2)) ){  // move from Activities to Schedule
          var positionY = Math.round(($(this).position().top)/blockHeight);
          console.log(schedule + ", "+ id + ", "+ positionY +  ", "+ $(this).position().top+", "+ height);        
          drawSchedule(edit_distance(schedule,id, positionY,height));
          if (list == ".activitiesList") {  // move from Activities to Schedule
            $(this).remove();
          }
        } else if (list == ".schedule") {   // move from Schedule to Activities
          console.log("remove");
          addActivity($(this).attr("id"), height);
          $(this).remove();
          schedule = schedule.replace(new RegExp($(this).attr("id"), 'g'), " "); // remove item from schedule
        } else {  // move within Schedule
          $(this).css({"left":0, "top":0}); //return to original position
        }
        updateModel(id);
        $("#"+id).each(selectItem);
        $(".hover").removeClass("hover");
      }
    })
    
    // Make item resizable
    $(list + " div.item:last").resizable({
      containment: ".activitiesResizeContainer",  
      handles: "n,s",
      minHeight: blockHeight*2 - borderWidth*2,
      //minWidth: 258,
      start: function(event, ui) {  
        $(this).after("<div class='spaceHolder' style='height:"+ ($(this).height()+borderWidth*2) +"px'></div>");
        $(this).each(selectItem);
      },
      stop: function(event, ui) {
        var id = $(this).attr("id");
        if (list == ".schedule" ) {
          var positionY = Math.round(($(this).position().top)/blockHeight);
          var height = Math.round(($(this).height() + borderWidth*2) / blockHeight);
          console.log(schedule + ", "+ id + ", "+ positionY +  ", "+ height);        
          drawSchedule(edit_distance(schedule,id, positionY,height));
        } else {
          $(".activitiesList div.scheduleItem").css({
            "position": "relative",
            "left":0,
            "top":0
          });
          $(".spaceHolder").remove();
        }
        updateModel(id);
        $("#"+id).each(selectItem);
        O.map.drawpath(schedule);
      }
    });
    $(list + " div.item:last .ui-resizable-n").after("<div class='ui-icon ui-icon-grip-solid-horizontal-n'></div>");
    $(list + " div.item:last .ui-resizable-s").after("<div class='ui-icon ui-icon-grip-solid-horizontal-s'></div>");
    
    // Set item height
    $(list + " div.item:last").height(blockHeight*duration - borderWidth*2);  // -2 to compensate for the border height

    // Make selectable
    $(list + " div.item:last").click(toggleItem);
    
    // Set z-index so that items are always on top
    $(list + " div.item:last").css({
        "z-index":10,
    });
    
    if (list==".schedule"){
      $(list + " div.item:last").css({// Set item to it's current absolute position
        "position": "absolute",
        "left":0,
        "top":verticalPos*blockHeight,
      });
      $(list + " div.item:last").draggable("option", "containment", "#doBetween"+id);
    }else{
      $(list + " div.item:last").draggable("option", "containment", ".activitiesContainer");
    }
    
    // Add doBetweenbox
    if($("#doBetween"+id).length==0){   // if it doesn't exist already
      $(".activitiesContainer").after('<div class="doBetweenContainer" id="doBetween'+id+'"><div class="doBetween"></div></div>');
      $("#doBetween"+id).height(blockHeight*schedule.length);
      $("#doBetween"+id).css("z-index",-2).fadeTo(1,0);
      $("#doBetween"+id).resizable({ 
        grid: [1, blockHeight],
        handles: "n,s",
        stop: function(event, ui) {
          //TODO: update doBetween times
        }
      });
    }
  }

  function toggleItem(){
    //TODO: change color of pin on map.
    //maybe make it bounce
    if(!$(this).hasClass('selected')){
      $(".selected").removeClass('selected');
      $(this).addClass('selected');
      O.activities.select(this.id);
    }else{
      $(".selected").removeClass('selected');
      O.activities.deselect(this.id);
    }
    //updateDoBetweenBox();
  }

  //No
  function selectItem(){
    $(".selected:not(#"+$(this).attr("id")+")").removeClass('selected');
    $(this).addClass('selected');
    //updateDoBetweenBox();
    O.activities.select(this.id);
  }

  //No
  function updateDoBetweenBox(){
    if($(".selected").length){
      $(".doBetweenContainer:not(#doBetween"+$(".selected").attr("id")+")").css("z-index",-2).fadeTo(1,0);
      $("#doBetween" +  $(".selected").attr("id")).css("z-index",1).fadeTo(1,1);
      console.log(".doBetween" +  $(".selected").attr("id"));
    }else{
      $(".doBetweenContainer").css("z-index",-2).fadeTo(1,0);
    }
  }


  initHeights();
  drawScheduleGrid();
  drawSchedule(schedule);
  initActivitiesList();
}
