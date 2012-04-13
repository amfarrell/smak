

activities = []
class Activity
  this.id = 0
  constructor: (@name, @location, @start, @end, @duration, @range, @user_createdP, @scheduledP) ->
    @id = JSON.stringify(Activity.id)
    Activity.id += 1
    $.jStorage.set(@id,this)



[new Activity("lunch with Robert", "42.3656, -71.0215", "13:00", "14:00", 60, "12:00-14:30", true, false),
new Activity("Walking the freedom trail", "42.2656, -71.0235", "14:15", "15:30", 75, "13:00-17:30", true, false),
new Activity("Having a Pint", "42.3621, -71.0570", "15:45", "16:30", 45, "13:00-22:30", true, false),
new Activity("Sailing", "42.3607, -71.0733", "09:45", "11:00", 75, "08:00-15:30", true, false),
new Activity("Gawking at students in course III lab", "42.3603, -71.0958", "11:15", "12:00", 45, "11:00-16:30", true, false),
];

window.O = {'Activity':Activity}
