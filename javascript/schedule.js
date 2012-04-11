
var blockHeight = 20;   // vertical pixels per 15 minute chunk
var startTime = 9;      //hour of the day (in military time)
var schedule = "AA  BB C            ";      // currently displayed schedule
var activitiesListPos = 0; // position of the end of the activities list. (counted n 15 min blocks)
var scheduleItemWidth = 260;  //pixels width of schdeduleItem

function drawSchedule(newSchedule){
  schedule = newSchedule;
  console.log(schedule);
  var prevItem="";
  
  $('.schedule').height(blockHeight*schedule.length);    
  $('.scheduleGrid').height(blockHeight*schedule.length);  
  $('.activitiesContainer').height(blockHeight*schedule.length);
  $('.activitiesList').height(blockHeight*schedule.length);
  
  $('.schedule').html("");    //clear schedule  
  
  for( var i=0; i<schedule.length; i++){
    var item = schedule[i];
    
    if(item != prevItem && item != " "){
      setupActivity(item, 1, ".schedule", i);
            
      prevItem=item;
    }else if (item != " "){
      var height = $(".schedule div.item:last").height();
      $(".schedule div.item:last").height(height+blockHeight);
    }
  }
}

function setupActivity(name, duration, list, verticalPos){  //list = ".schedule" or ".activitiesList"
  $(list).append('<div class="scheduleItem item" id='+name+'>'+name+'</div>');
    
  // Make item draggable
  $(list + " div.item:last").draggable({
    containment: ".activitiesContainer",  
    snap: '.schedule, .activitiesList',
    snapMode: "inner",
    cursor: "move",
    //grid: [1, blockHeight], 
    stack: "div.item", 
    opacity: 0.75, 
    stop: function(event, ui) { 
      var height = Math.round(($(this).height() + 2) / blockHeight);
      if ((list == ".schedule" && ($(this).position().left>-160)) ||  // move in schedule
          (list == ".activitiesList" && ($(this).position().left>scheduleItemWidth/2)) ){  // move from Activities to Schedule
        var positionY = Math.round(($(this).position().top)/blockHeight);
        console.log(schedule + ", "+ $(this).attr("id") + ", "+ positionY +  ", "+ height);        
        drawSchedule(edit_distance(schedule,$(this).attr("id"), positionY,height));
        if(list == ".activitiesList"){  // move from Activities to Schedule
          $(this).remove();
        }
      }else if(list == ".schedule") {   // move from Schedule to Activities
        console.log("remove");
        addActivity($(this).attr("id"), height/4);
        $(this).remove();
        schedule = schedule.replace(new RegExp($(this).attr("id"), 'g'), " "); // remove item from schedule
      }else{  // move within Schedule
        $(this).css({"left":0, "top":0}); //return to original position
      }
    }
  })
  
  // Make item resizable
  $(list + " div.item:last").resizable({
    containment: ".activitiesContainer",  
    //grid: [50, blockHeight],
    handles: "n,s",
    start: function(event, ui) {  
      $(this).after("<div class='spaceHolder' style='height:"+ ($(this).height()+2) +"px'></div>");
    },
    stop: function(event, ui) {
      if (list == ".schedule" ){
        var positionY = Math.round(($(this).position().top)/blockHeight);
        var height = Math.round(($(this).height() + 2) / blockHeight);
        console.log(schedule + ", "+ $(this).attr("id") + ", "+ positionY +  ", "+ height);        
        drawSchedule(edit_distance(schedule,$(this).attr("id"), positionY,height));
      }else{
        $(".activitiesList div.scheduleItem").css({
          "position": "relative",
          "left":0,
          "top":0
        });
        $(".spaceHolder").remove();
      }
    }
  });
  
  $(list + " div.item:last").height(blockHeight*duration - 2);  // -2 to compensate for the border height

  
  // Set item to it's current absolute position
  if (list==".schedule"){
    $(list + " div.item:last").css({
      "position": "absolute",
      "left":0,
      "top":verticalPos*blockHeight
    });
  }else{
    /*$( list + " div.item:last" ).bind( "resize", function(event, ui)  {
          ui.size.height = ui.originalSize.height;
          (ui.helper).css({'position': '', 'top': '0px'});
    });*/
  }
}

function addActivity(name, duration){ //duration in hours
  setupActivity(name, duration*4, ".activitiesList", activitiesListPos);
  
  activitiesListPos += duration*4
}

function drawScheduleGrid(){
  $('.scheduleGrid').append("<table cellspacing='0'></table");
  console.log(schedule.length);
  for(var i=0; i<schedule.length; i++){
    if (i%4==0){
      var time = (startTime + i/4)%12;
      if (time==0) time = 12;
      $('.scheduleGrid table').append("<tr><td style='width:18px'>"+time+"</td><td style='width:278px'></td></tr>");
    }
  }
  $('.scheduleGrid td').height(blockHeight*4);
}