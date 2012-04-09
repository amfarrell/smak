function drawSchedule(schedule){
  console.log(schedule);
  var prevItem="";
  var blockHeight = 20;  // vertical pixels per 15 minute chunk
  
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
