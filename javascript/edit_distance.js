
/* 	Cases not handled:

		1.) When the activity needing to be moved goes off the end of the day (we 
				assert fail on this case)

*/

// -----------------------------------------------------------------------------
// Parameters
// -----------------------------------------------------------------------------

var DEBUG = false
var DEBUG_INSERT = false
var DEBUG_COST_FUNC = false

var DISTANCE_COST = 		1000
var DISPLACEMENT_COST = 1
var MOVEMENT_COST = 		1
var MOVEMENT_POLY = 		4
var ELIMINATION_COST = 	10000000

// -----------------------------------------------------------------------------
// Low-level Helpers
// -----------------------------------------------------------------------------

// Debugging

function AssertException(message) { this.message = message; }
AssertException.prototype.toString = function () {
  return 'AssertException: ' + this.message;
}

function assert(exp, message) {
  if (!exp) {
    throw new AssertException(message);
  }
}

function pprint(string) { 
	return "[" + string + "]"
}

// Arrays

function count_array_occurances(array, id) {
	var count = 0
	for (var i = 0; i < array.length; i++) {
		if (array[i] == id) count++
	}
	return count
}

function array_replace(array, from, to) {
	array = array.slice()
	for (var i = 0; i < array.length; i++) {
		if (array[i] == from) array.splice(i, 1, to)
	}
	return array
}

function array_average(array) {
	if (array.length == 0) return 0
	var sum = 0
	for (var i = 0; i < array.length; i++) {
		sum += array[i]
	}
	return sum / array.length
}

// returns a set representation of the array (no duplicate elements)
//
function array_unique_elements(array) {
	return array.filter(function(itm,i,a) {
    										return i==a.indexOf(itm);
											})
}

// remove an element from an array by value
//
function remove_element(arr) {
	var what, a= arguments, L= a.length, ax;
	while(L> 1 && arr.length){
		  what= a[--L];
		  while((ax= arr.indexOf(what))!= -1){
		      arr.splice(ax, 1);
		  }
	}
	return arr;
}

function translate_do_between_times(id) {
	var global_start_time = dateToNumber(startTime)
	var earliest_offset = (dateToNumber(new Date(Date.parse(O.activities.get(id).range[0]))) - global_start_time) * 4
	var latest_offset = (dateToNumber(new Date(Date.parse(O.activities.get(id).range[1]))) - global_start_time) * 4
	
	return [earliest_offset, latest_offset]
}

// given the id for two locations, return the travel time (in 15 minute 
// increments) between the two locations (that is, the number of space that 
// should be left between from and to)
//
var ATOMIC_DISTANCE = 0.0030 // TODO a hack while we work out walking distance
function distance(from, to) {
	
	// Euclidean distance
	var from_coords = O.activities.get(from).coords
	var to_coords = O.activities.get(to).coords
	
	var from_x = from_coords[0]
	var from_y = from_coords[1]

	var to_x = to_coords[0]
	var to_y = to_coords[1]

	var euc_distance = Math.sqrt(Math.pow(from_x - to_x, 2) + Math.pow(from_y - to_y, 2))

	var walking_distance_scaled = Math.ceil(euc_distance / ATOMIC_DISTANCE)

	return walking_distance_scaled
}

// -----------------------------------------------------------------------------
// Edit distance helpers
// -----------------------------------------------------------------------------

function activity(id, start_pos, len) {
	this.id = id;
	this.start_pos = start_pos;
	this.len = len;
}

// useful for calculating edit distances
function model_from_string(input) {
	var last_char = null
	var last_start = null
	var last_len = 0
	var activities = new Array()
	for (var i = 0; i < input.length; i++) {
		if (input[i] != last_char) {
			if (last_char != null) {
				activities.push(new activity(last_char, last_start, last_len))
			}
			last_char = input[i]
			last_start = i
			last_len = 1
		} else {
			last_len++;
		}
	}
	activities.push(new activity(last_char, last_start, last_len))
	return activities
}

// -----------------------------------------------------------------------------
// Movement Primitives (act on arrays of strings)
// -----------------------------------------------------------------------------

// removes 'id' from the state (assumes that ID only appears once) and replaces 
// it with white space
function remove(state, id) {
	state = state.slice()
	var start = state.indexOf(id)
	while (state[start] == id) {
		state.splice(start, 1, " ")
		start++
	}
	return state
}

// adds 'id' at the specified position for the specified length.  If any 
// activities are collided with, returns those items and remove them entirely 
// from the string.
function add(state, id, pos_final, len) {
	assert(state.length >= pos_final + len, "add: length violation")

	var original_state = state
	state = state.slice()
	var displaced = new Array()
	for (var i = pos_final; i < pos_final + len; i++) {
		if (state[i] != " " && displaced.indexOf(state[i]) == -1)
			displaced.push(state[i])
		state.splice(i, 1, id)
	}

	// check travel time for the next activity after pos_final + len TTV
	/*for (var i = pos_final + len; i < state.length; i++) {
		if (state[i] != " ") {
			var travel_time_end = pos_final + len + distance(id, state[i]);
			if (displaced.indexOf(state[i]) == -1 &&
					travel_time_end >= state.indexOf(state[i])) {
				// we found the next activity... check travel time
				displaced.push(state[i])
				console.log("TT VIOLATION: Initial add")
			}
		}
	}*/

	// pull out items that we pushed into displaced from the state vector 
	// (resolves partial collisions)
	var displaced_expanded = new Array()
	for (var i = 0; i < displaced.length; i++) {
		var count = count_array_occurances(original_state, displaced[i])
		state = array_replace(state, displaced[i], " ")
		displaced_expanded.push(Array(count+1).join(displaced[i]))
	}

	return [state, displaced_expanded]
}

// given the state and a current index, return the two "currently selected" elements
function find_next_id(state, index) {
	for (var i = index; i < state.length; i++) {
		if (state[i] != " ") return state[i]
	}
	return " "
}

function slack(state, start_id, end_id) {
	if (end_id == " ") return 1000 // makes things easier
	return additional_gap = state.lastIndexOf(start_id) - state.indexOf(end_id) - distance(start_id, end_id)
}

// insert a new character of some length between two activities.  Activities 
// after the given activity are pushed forward.  If the activity is pushed on 
// top of an existing activity, that activity is pushed backwards.
function insert(state, id, pos, len, locked) {
	if (DEBUG_INSERT) console.log("Calling insert()  ~ PC:     [" + state + "], Insert at: " + pos + ", ID: " + id)

	state = state.slice()
	var original_len = state.length
	if (locked > -1) {
		var locked_char = state[locked]
		var locked_char_first = locked
		var locked_char_last = state.lastIndexOf(state[locked])
	}

	// are we inserting in the middle of an activity?
	// if so, push that activity backwards
	if (pos > 0 && state[pos] != " " && state[pos] == state[pos-1]) {
    var b_id = state[pos]
		var b_len = count_array_occurances(state, b_id)
		state = array_replace(state, b_id, " ")
		var b_state = state.slice(0, pos)
		var b_state_len = b_state.length
		b_state.reverse()
		state = state.slice(pos)
		b_state = insert(b_state, b_id, 0, b_len, "")[1]
		b_state.reverse()
		assert(b_state_len == b_state.length, "b_state length mismatch")
		state = b_state.concat(state)
	}

	// insert the new item
	for (var i = 0; i < len; i++) state.splice(pos, 0, id)

	// travel time on initial insert TTV
	/*var next_id = find_next_id(state, pos + len)
	var additional_slack = slack(state, id, next_id)
	if (additional_slack < 0)
		console.log("TT VIOLATION: Insert, first")
	for (var i = additional_slack; i < 0; i++) {
		state.splice(pos + len, 0, " ")
	}*/

	// remove whitespace to make blocks align better
	var num_inserted = 0
	for (var i = pos + len; i < state.length; i++) {

		var additional_slack = 1 // TODO replace with travel time TTV
		/*if (state[i] != next_id && state[i] != " ") {
			additional_slack = slack(state, next_id, state[i])
			next_id = state[i]
		}

		if (state[i] == " " && additional_slack == 0) {
			console.log("TT VIOLATION: Insert, second")
		}*/

		if (state[i] == " " && additional_slack > 0) {
			state.splice(i, 1)
			num_inserted++
			additional_slack--
			i--;
			if (num_inserted == len) break;
		}
	}

	// check 1: did we move the locked item?
	if (locked != -1 && (state[locked_char_first] != locked_char) ||
											(state[locked_char_last] != locked_char) )
		return [false, null]

	// check 2: do we need to cut off anything?
	//assert(original_len <= state.length, "insert: length violation")
	if (original_len < state.length) {
		var last_character = state[original_len-1]
		var prefix = state.slice(0, original_len)
		var suffix = state.slice(original_len, state.length)
		if (suffix.indexOf(last_character) != -1) {
			// eliminate partial cutoffs, too
			prefix = array_replace(prefix, last_character, " ")
		}
		state = prefix
	}
	
	return [true, state]
}

// NOTE: this function was changed to do the naive thing---the filtering was giving bad solutions
//
// returns the index of the first occurance of each different character.  
// each whitespace character is considered a different character
function find_breaks(state) {
	var breaks = new Array()
	breaks.push(0)
	//last_char = state[0]
	for (var i = 1; i < state.length; i++) {
		//if (state[i] != last_char || state[i] == " ") just enumerate all of them... find better solns?
		breaks.push(i)
	}
	return breaks
}

// -----------------------------------------------------------------------------
// Generate and manage candidate schedules
// -----------------------------------------------------------------------------

// the "brute force" enumeration
//
// given a starting point and a list of displacements, enumerate all state 
// configurations after the displacements are added back.
function get_configurations(displacements, partial_configurations, locked) {
	if (displacements.length == 0) {
		return partial_configurations
	}
	var new_configurations = new Array()
	var next = displacements.pop()
	var id = next.charAt(0)
	var len = next.length
	for (var i = 0; i < partial_configurations.length; i++) {
		var start_points = find_breaks(partial_configurations[i])
		//console.log("Start points for " + id + ": " + start_points)
		for (var j = 0; j < start_points.length; j++) {
			var new_configuration = insert(	partial_configurations[i], id, 
																			start_points[j], len, locked)
			if (DEBUG_INSERT) console.log("Finished insert() ~ Result: [" + new_configuration[1] + "]")
			if (DEBUG_INSERT) console.log("")
			if (new_configuration[0])
				new_configurations.push(new_configuration[1])
		}
	}
	return get_configurations(displacements, new_configurations, locked)
}

// given a list of configurations, remove the ones that violate start at/do between/etc constraints
//
function filter_configurations(configurations) {
	var final_configurations = new Array()
	for (var i = 0; i < configurations.length; i++) {
		var current_config = configurations[i].slice()
		var unique_elements = array_unique_elements(current_config)
		unique_elements = remove_element(unique_elements, " ")

		// TODO filter travel time violations TTV
		/*for (var j = 0; j < unique_elements.length - 1; j++) {
			var from = unique_elements[j]
			var from_end = current_config.lastIndexOf(from)
			var to = unique_elements[j+1]
			var to_start = current_config.indexOf(to)
			var dist = distance(from, to)
			if (from_end > -1 && to_start > -1 && (from_end + dist >= to_start)) {
				console.log("Travel time violation between " + O.activities.get(from).name + " and " + O.activities.get(to).name)
				current_config = array_replace(current_config, from, " ")
			} else {
				console.log("NO Travel time violation between " + O.activities.get(from).name + " and " + O.activities.get(to).name)
			}
		}*/

		// TODO we need the backend to handle the "locked" flag properly in order to enable this
		// filter start_at violations
		/*for (var j = 0; j < start_at.length; j++) {
			var fid = start_at[i][0]
			var sap = start_at[i][1]
			var start_index = current_config.indexOf(fid)
			if (start_index > -1 && sap != start_index) {
				current_config = array_replace(current_config, fid, " ")
			}
		}*/

		// filter do_between violations
		for (var j = 0; j < unique_elements.length; j++) {
			var fid = unique_elements[j]
			var do_between_thresholds = translate_do_between_times(fid)
			var start_threshold = do_between_thresholds[0]
			var end_threshold = do_between_thresholds[1]
			var start_index = current_config.indexOf(fid)
			var end_index = current_config.lastIndexOf(fid)
			if (start_index > -1 && (	start_index < start_threshold || 
																end_index >= end_threshold)) {
				current_config = array_replace(current_config, fid, " ")				
			}
		}

		final_configurations.push(current_config)
	}
	return final_configurations
}

// -----------------------------------------------------------------------------
// Cost Functions
// -----------------------------------------------------------------------------

function diff_state(initial_state, additional_elements, state) {
	var eliminations = new Array()
	var initial_state_set = array_unique_elements(initial_state)
	for (var i = 0; i < initial_state_set.length; i++) {
		if (state.indexOf(initial_state_set[i]) == -1 && initial_state_set[i] != " ") {
			eliminations.push([initial_state_set[i], count_array_occurances(initial_state, initial_state_set[i])])
		}
	}
	for (var i = 0; i < additional_elements.length; i++) {
		if (state.indexOf(additional_elements[i][0]) == -1) {
			eliminations.push([additional_elements[i][0], additional_elements[i].length])
		}		
	}
	return eliminations
}

function cost_function(initial_state, configuration, excludes, includes, use_distance_cost) {
	var old_model = model_from_string(initial_state)
	var new_model = model_from_string(configuration)

	var eliminations = new Array()

	// total distance cost
	var total_distance_cost = 0
	if (use_distance_cost) {
		var distances = new Array()
		var unique_elements = array_unique_elements(configuration)
		//console.log(unique_elements)
		unique_elements = remove_element(unique_elements, " ")
		for (var j = 0; j < unique_elements.length - 1; j++) {
			var from = unique_elements[j]
			var from_end = configuration.lastIndexOf(from)
			var to = unique_elements[j+1]
			var to_start = configuration.indexOf(to)
			distances.push(distance(from, to))
		}
		total_distance_cost = array_average(distances) * DISTANCE_COST
	}

	// calculate displacement and movement costs
	var displacement_cost = 0
	var movement_cost = 0
	for (var i = 0; i < old_model.length; i++) {
		var current_old = old_model[i]
		if (current_old.id != " " && excludes.indexOf(current_old.id) == -1) {
			for (var j = 0; j < new_model.length; j++) {
				var current_new = new_model[j]
				if (current_new.id == current_old.id) {
					// displacement
					if (current_new.start_pos != current_old.start_pos) {
						displacement_cost += DISPLACEMENT_COST
					}
					movement_cost += MOVEMENT_COST * Math.pow(Math.abs(current_new.start_pos - current_old.start_pos), MOVEMENT_POLY)
					break;
				}
			}
		}
	}

	// elimination cost
	var elimination_cost = 0
	var initial_state_set = array_unique_elements(initial_state)
	for (var i = 0; i < initial_state_set.length; i++) {
		if (configuration.indexOf(initial_state_set[i]) == -1 && initial_state_set[i] != " ") {
			eliminations.push([initial_state_set[i], count_array_occurances(initial_state, initial_state_set[i])])
			elimination_cost += ELIMINATION_COST
		}
	}
	var configuration_set = array_unique_elements(configuration)
	for (var i = 0; i < includes.length; i++) {
		if (configuration_set.indexOf(includes[i]) == -1) {
			elimination_cost += ELIMINATION_COST
		}
	}
	
	var total_cost = displacement_cost + movement_cost + elimination_cost + total_distance_cost
	if (DEBUG_COST_FUNC) console.log("Cost: from [" + initial_state + "] -> [" + configuration + "] = " + total_cost + "\t(" + displacement_cost + ", " + movement_cost + ", " + elimination_cost + ", " + total_distance_cost + ")")
	return [total_cost, eliminations]
}

function pick_configuration(initial_state, configurations, excludes, includes, use_distance_cost) {
	var min_cost = Number.MAX_VALUE
	var min_configuration = null
	var min_eliminations = null
	for (var i = 0; i < configurations.length; i++) {
		if (DEBUG) console.log("Testing config: [" + configurations[i] + "]")
		var cost_bundle = cost_function(initial_state, configurations[i], excludes, includes, use_distance_cost)
		var cost = cost_bundle[0]
		var eliminations = cost_bundle[1]
		if (cost < min_cost) {
			if (DEBUG) console.log("Keeping configuration!")
			min_cost = cost
			min_eliminations = eliminations
			min_configuration = configurations[i]
		}
	}
	assert(min_configuration != null, "main: no final config?")
	return [min_configuration, min_eliminations]
}

// -----------------------------------------------------------------------------
// Main Algorithms
// -----------------------------------------------------------------------------

// Moving items around in the schedule
//
function edit_distance(string, id, pos_final, len) {
	translate_do_between_times(id)

	console.log("edit_distance(\"" + string + "\", \"" + id + "\", " + pos_final + ", " + len + ")")
	var state = string.split("")
	var initial_state = state

	// Assertions
	// check that pos_init and pos_final are legal starts-of-activities
	assert(state.length >= pos_final + len, "main: length violation")

	// do the initial remove action
	state = remove(state, id)
	add_attempt = add(state, id, pos_final, len)
	state = add_attempt[0]
	displaced = add_attempt[1]

	// find a set of decent configurations, given the blocks we displaced
	configurations = get_configurations(displaced, [state.slice()], pos_final)
	configurations = filter_configurations(configurations)
	
	// pick the best configuration
	var state_bundle = pick_configuration(initial_state, configurations, [id], [], false)
	var state = state_bundle[0]
	var eliminations = state_bundle[1]

	// re-layout things that got eliminated
	var eliminatedTarget = false
	if (state.indexOf(id) == -1) { // corner case (hack)
		eliminatedTarget = true
		setupActivity(id, len, ".activitiesList", 0)
	}
	for (var i = 0; i < eliminations.length; i++) {
		var e_id = eliminations[i][0]
		if (!(e_id == id && eliminatedTarget)) {
			var e_len = eliminations[i][1]
			//console.log("Eliminated: " + e_id)
			setupActivity(e_id, e_len, ".activitiesList", 0)
		}
	}

	var ret = state.join("").replace(/,/g, "")
	console.log("edit_distance() returning: \"" + ret + "\"")

	return ret
}

// Growing and squishing the schedule
//
function constrain_bounds(string, start, stop) {
	
	var state = string.split("")
	var orig_len = state.length
	var orig_state = state.slice()
	var end_delta = -1

	console.log("constrain_bounds(\"" + string + "\", \"" + start + "\", \"" + stop + "\") ~ original length: " + orig_len)

	if (start < 0) {
		state = Array(-1 * start + 1).join(" ").split("").concat(state)
	}
	if (stop > orig_len) {
		state = state.concat(Array((stop - orig_len) + 1).join(" ").split(""))
	}

	// push forward
	for (var i = 0; i < start; i++) {
		var id = state[i]
		if (id != " ") {
			var len = count_array_occurances(state, id)
			state = array_replace(state, id, " ")
			state = insert(state, id, i+1, len, -1)[1]
		}
	}

	if (start >= 0) {
		state = state.slice(start)
	}

	// push backwards
	if (stop <= orig_len) {
		state = state.reverse()

		end_delta = orig_len - stop
		for (var i = 0; i < end_delta; i++) {
			var id = state[i]
			if (id != " ") {
				var len = count_array_occurances(state, id)
				state = array_replace(state, id, " ")
				state = insert(state, id, i+1, len, -1)[1]
			}
		}

		state = state.slice(end_delta).reverse()
	}

	// do the start_at, do_between filtering
	var states = filter_configurations([state])
	state = states[0]

	// redraw eliminated activities
	var eliminations = diff_state(orig_state, [], state)
	for (var i = 0; i < eliminations.length; i++) {
		var e_id = eliminations[i][0]
		var e_len = eliminations[i][1]
		//console.log("Eliminated: " + e_id)
		setupActivity(e_id, e_len, ".activitiesList", 0)
	}

	ret = state.join("").replace(/,/g, "")

	// @DEPRECATED
	// this code makes sure that the squished list is still the original length
	//if (start >= 0) {
	//	ret = Array(start+1).join(" ") + ret
	//}
	//if (stop <= orig_len) {
	//	ret = ret + Array(end_delta+1).join(" ")
	//}

	console.log("constrain_bounds() returning: \"" + ret + "\" ~ final length: " + ret.length)

	return ret
}

// The auto schedule button
//
function partially_schedule(string, los) {
	var state = string.split("")
	var initial_state = string.split("")

	// some preprocessing
	var excludes = Array()
	for (var i = 0; i < los.length; i++) { excludes.push(los[i].charAt(0)) }

	for (var j = 0; j < los.length; j++) {
		var current_element = los[j]

		//console.log("Round of auto-complete starting ~ adding: " + current_element)

		var state_this_iteration = state.slice()

		// find a set of decent configurations, given the blocks we displaced
		configurations = get_configurations([current_element], [state.slice()], -1)
		configurations = filter_configurations(configurations)

		// pick the best configuration
		state = pick_configuration(state_this_iteration, configurations, excludes, [current_element[0]], true)[0]

		//console.log("Round of auto-complete finished ~ [" + state + "]")
	}

	var eliminations = diff_state(initial_state, los, state)
	for (var i = 0; i < eliminations.length; i++) {
		var e_id = eliminations[i][0]
		var e_len = eliminations[i][1]
		setupActivity(e_id, e_len, ".activitiesList", 0)
	}

	//
	// Post-schedule wrap-up
	//

	var ret = state.join("").replace(/,/g, "")
	console.log("partially_schedule() returning: \"" + ret + "\"")
	return ret
}

// -----------------------------------------------------------------------------
// Space to put test code
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// Calls
// -----------------------------------------------------------------------------


var init = "AA  BBCCC  "
//var test = edit_distance(init, "C", 5, 3)
var test2 = constrain_bounds(init, 1, init.length - 5)

console.log("[" + init + "]")
console.log("[" + test2 + "]")
console.log("Orig len: " + init.length + ", new len: " + test2.length)

//var init = "AA                    BB"
//var test = edit_distance(init, "C", 5, 3)
//test = constrain_bounds(init, 2, init.length)
//test = partially_schedule(init, ["C", "DD", "EEE", "FFFF"])


//console.log("FINAL RESULT: " + pprint(init) + " -> " + pprint(test))

