(function() {
  var Activity;

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

}).call(this);
