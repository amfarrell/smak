(function() {
  var Activity, activities;

  activities = [];

  Activity = (function() {

    Activity.id = 0;

    function Activity(name, location, start, end, duration, range, user_createdP, scheduledP) {
      this.name = name;
      this.location = location;
      this.start = start;
      this.end = end;
      this.duration = duration;
      this.range = range;
      this.user_createdP = user_createdP;
      this.scheduledP = scheduledP;
      this.id = JSON.stringify(Activity.id);
      Activity.id += 1;
      $.jStorage.set(this.id, this);
    }

    return Activity;

  })();
  $.jStorage.flush();
  [new Activity("Breakfast", "42.3656, -71.0215", "13:00", "14:00", 60, "12:00-14:30", true, false), 
  new Activity("Dome", "42.2656, -71.0235", "14:15", "15:30", 180, "13:00-17:30", true, false), 
  new Activity("Uffizi Gallery", "42.3621, -71.0570", "15:45", "16:30",120, "13:00-22:30", true, false), 
  new Activity("Accademia Gallery", "42.3607, -71.0733", "09:45", "11:00", 75, "08:00-15:30", true, false), 
  new Activity("Piazzale Michelangelo", "42.3603, -71.0958", "11:15", "12:00", 75, "11:00-16:30", true, false),
  new Activity("Giotto's Tower", "42.3607, -71.0733", "09:45", "11:00", 60, "08:00-15:30", true, false),
  new Activity("Dinner", "42.3607, -71.0733", "09:45", "11:00", 60, "08:00-15:30", true, false)];

  window.O = {
    'Activity': Activity
  };

}).call(this);
