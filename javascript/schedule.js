
var blockHeight = 20;  // vertical pixels per 15 minute chunk
var scheduleLength = 24; // # of blocks of 15 minutes
var startTime = 9;  

function drawSchedule(schedule){
  console.log(schedule);
  var prevItem="";
  
  scheduleLength = schedule.length;
  $('.schedule').height(blockHeight*schedule.length);    
  $('.scheduleGrid').height(blockHeight*schedule.length);     
  drawScheduleGrid();
  
  $('.schedule').html("<div></div>");    //find location of top of schedule
  var startLocation = $(".schedule div:last").position();
  $('.schedule').html("");    //clear schedule  
  
  for( var i=0; i<schedule.length; i++){
    var item = schedule[i];
    
    if(item != prevItem){
      if (item == " "){ //if blank
        $('.schedule').append('<div class="item">'+item+'</div>');
        $(".schedule div.blank:last").height(blockHeight); 
      }else{
        $('.schedule').append('<div class="scheduleItem item" id='+item+'>'+item+'</div>');
        
        // Set item to it's current absolute position
        $(".schedule div.item:last").css({
          "position": "absolute",
          "left":startLocation.left,
          "top":startLocation.top + i*blockHeight
        });
        
        // Make item draggable
        $(".schedule div.item:last").draggable({ 
          axis: "y" , 
          containment: "parent",  
          cursor: "move", 
          grid: [50, blockHeight],  
          stack: ".schedule div:last", 
          opacity: 0.75, 
          stop: function(event, ui) { 
            var position = ($(this).position().top - startLocation.top)/blockHeight;
            var height = ($(this).height() + 2) / blockHeight;
            console.log(schedule + ", "+ $(this).attr("id") + ", "+ position +  ", "+ height);        
            drawSchedule(edit_distance(schedule,$(this).attr("id"), position,height));
          }
        })
        
        // Make item resizable
        $(".schedule div.item:last").resizable({
          containment: ".schedule",
          grid: [50, blockHeight],
          handles: "n,s",
          stop: function(event, ui) {
            var position = ($(this).position().top - startLocation.top)/blockHeight;
            var height = ($(this).height() + 2) / blockHeight;
            console.log(schedule + ", "+ $(this).attr("id") + ", "+ position + ", "+ height);        
            drawSchedule(edit_distance(schedule,$(this).attr("id"), position,height));
          }
        });
        $(".schedule div.item:last").height(blockHeight - 2);  // -2 to compensate for the border height
      }
      
      prevItem=item;
    }else{
      var height = $(".schedule div.item:last").height();
      $(".schedule div.item:last").height(height+blockHeight);
    }
  }
}

function drawScheduleGrid(){
  $('.scheduleGrid').html("<table cellspacing='0'></table");
  for(var i=0; i<scheduleLength; i++){
    if (i%4==0){
      var time = (startTime + i/4)%12;
      if (time==0) time = 12;
      $('.scheduleGrid table').append("<tr><td style='width:20px'>"+time+"</td><td style='width:280px'></td></tr>");
    }
  }
  $('.scheduleGrid td').height(blockHeight*4);
}