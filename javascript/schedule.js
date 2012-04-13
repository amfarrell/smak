
var blockHeight = 20;   // vertical pixels per 15 minute chunk
var startTime = 9;      //hour of the day (in military time)
var schedule = "AA  BB CCC          ";      // currently displayed schedule
var activitiesListPos = 0; // position of the end of the activities list. (counted n 15 min blocks)
var scheduleItemWidth = 260;  //pixels width of schdeduleItem
var borderWidth = 5;  //pixels width of border of schdeduleItem

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

function toggleItem(){
  if(!$(this).hasClass('selected')){
    $(".selected").removeClass('selected');
    $(this).addClass('selected');
  }else{
    $(".selected").removeClass('selected');
  }
  //updateDoBetweenBox();
}

function selectItem(){
  $(".selected:not(#"+$(this).attr("id")+")").removeClass('selected');
  $(this).addClass('selected');
  //updateDoBetweenBox();
}

function updateDoBetweenBox(){
  if($(".selected").length){
    $(".doBetweenContainer:not(#doBetween"+$(".selected").attr("id")+")").css("z-index",-2).fadeTo(1,0);
    $("#doBetween" +  $(".selected").attr("id")).css("z-index",1).fadeTo(1,1);
    console.log(".doBetween" +  $(".selected").attr("id"));
  }else{
    $(".doBetweenContainer").css("z-index",-2).fadeTo(1,0);
  }
}

function setupActivity(id, duration, list, verticalPos){  //list = ".schedule" or ".activitiesList"
  $(list).append('<div class="scheduleItem item" id='+id+'>'+id+'</div>');
    
  // Make item draggable
  $(list + " div.item:last").draggable({
    snap: '.schedule, .activitiesList',
    snapMode: "inner",
    cursor: "move",
    stack: "div.item", 
    opacity: 0.75, 
    start:function(event,ui){
      $(this).each(selectItem);
    },
    drag:function(){
      if($(this).overlaps($("#doBetween" +  $(this).attr("id")+" .doBetween"))){
        $("#doBetween" +  $(this).attr("id")+" .doBetween").addClass("hover");
      }else{
        $("#doBetween" +  $(this).attr("id")+" .doBetween").removeClass("hover");
      }
    },
    stop: function(event, ui) { 
      var height = Math.round(($(this).height() + borderWidth*2) / blockHeight);
      var id = $(this).attr("id");
      if ((list == ".schedule" && ($(this).position().left>-160)) ||  // move in schedule
          (list == ".activitiesList" && ($(this).position().left>scheduleItemWidth/2)) ){  // move from Activities to Schedule
        var positionY = Math.round(($(this).position().top)/blockHeight);
        console.log(schedule + ", "+ id + ", "+ positionY +  ", "+ height);        
        drawSchedule(edit_distance(schedule,id, positionY,height));
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
      $("#"+id).each(selectItem);
      $(".hover").removeClass("hover");
    }
  })
  
  // Make item resizable
  $(list + " div.item:last").resizable({
    //containment: "#doBetween"+id,  
    handles: "n,s",
    start: function(event, ui) {  
      $(this).after("<div class='spaceHolder' style='height:"+ ($(this).height()+borderWidth*2) +"px'></div>");
      $(this).each(selectItem);
    },
    stop: function(event, ui) {
      var id = $(this).attr("id");
      if (list == ".schedule" ){
        var positionY = Math.round(($(this).position().top)/blockHeight);
        var height = Math.round(($(this).height() + borderWidth*2) / blockHeight);
        console.log(schedule + ", "+ id + ", "+ positionY +  ", "+ height);        
        drawSchedule(edit_distance(schedule,id, positionY,height));
      }else{
        $(".activitiesList div.scheduleItem").css({
          "position": "relative",
          "left":0,
          "top":0
        });
        $(".spaceHolder").remove();
      }
      $("#"+id).each(selectItem);
    }
  });
  
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
    $("#doBetween"+id).height(blockHeight*20);
    $("#doBetween"+id).css("z-index",-2).fadeTo(1,0);
    $("#doBetween"+id).resizable({
      //containment: ".activitiesContainer",  
      grid: [1, blockHeight],
      handles: "n,s",
      stop: function(event, ui) {
        //TODO: update doBetween times
      }
    });
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