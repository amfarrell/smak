(function() {
  var Activity, activities;

  Activity = (function() {

    function Activity(name, location, start, end, duration, range, user_createdP) {
      this.name = name;
      this.location = location;
      this.start = start;
      this.end = end;
      this.duration = duration;
      this.range = range;
      this.user_createdP = user_createdP;
    }

    return Activity;

  })();

  activities = [new Activity("lunch with Robert", "42.3656, -71.0215", "13:00", "14:00", 60, "12:00-14:30", true), new Activity("Walking the freedom trail", "42.2656, -71.0235", "14:15", "15:30", 75, "13:00-17:30", true), new Activity("Having a Pint", "42.3621, -71.0570", "15:45", "16:30", 45, "13:00-22:30", true), new Activity("Sailing", "42.3607, -71.0733", "09:45", "11:00", 75, "08:00-15:30", true), new Activity("Gawking at students in course III lab", "42.3603, -71.0958", "11:15", "12:00", 45, "11:00-16:30", true)];

  window.Activity = Activity;

  window.activities = activities;

}).call(this);
