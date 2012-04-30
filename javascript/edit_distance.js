
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

var DISPLACEMENT_COST = 1
var MOVEMENT_COST = 1
var MOVEMENT_POLY = 4
var ELIMINATION_COST = 10000

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

function array_unique_elements(array) {
	return array.filter(function(itm,i,a) {
    										return i==a.indexOf(itm);
											})
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

function is_ok() {
		// check 1: make sure the activity blocks are contiguous
	// TODO
}

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

// insert a new character of some length between two activities.  Activities 
// after the given activity are pushed forward.  If the activity is pushed on 
// top of an existing activity, that activity is pushed backwards.
function insert(state, id, pos, len, locked) {
	if (DEBUG_INSERT) console.log("Calling insert() ~ PC: [" + state + "], Insert at: " + pos + ", ID: " + id)

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

	// remove whitespace to make blocks align better
	var num_inserted = 0
	for (var i = pos + len; i < state.length; i++) {
		if (state[i] == " ") {
			state.splice(i, 1)
			num_inserted++
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

// NOTE: this function was changed to do the naiive thing---the filtering was giving bad solutions
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

// the "brute force" enumeration
//
// given a starting point and a list of displacements, enumerate all state 
// configurations after the displacements are added back.
function get_configurations(displacements, partial_configurations, locked, start, end) {
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

// -----------------------------------------------------------------------------
// Cost Functions
// -----------------------------------------------------------------------------

function cost_function(initial_state, configuration, exclude) {
	var old_model = model_from_string(initial_state)
	var new_model = model_from_string(configuration)

	// calculate displacement and movement costs
	var displacement_cost = 0
	var movement_cost = 0
	for (var i = 0; i < old_model.length; i++) {
		var current_old = old_model[i]
		if (current_old.id != " " && current_old.id != exclude) {
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
		if (configuration.indexOf(initial_state_set[i]) == -1) {
			elimination_cost += ELIMINATION_COST
		}
	}
	
	var total_cost = displacement_cost + movement_cost + elimination_cost
	if (DEBUG_COST_FUNC) console.log("Cost: from [" + initial_state + "] -> [" + configuration + "] = " + total_cost + "\t(" + displacement_cost + ", " + movement_cost + ", " + elimination_cost + ")")
	return total_cost
}

// -----------------------------------------------------------------------------
// Main Algorithms
// -----------------------------------------------------------------------------

function edit_distance(string, id, pos_final, len) {
	console.log("edit_distance(\"" + string + "\", \"" + id + "\", " + pos_final + ", " + len + ")")
	var state = string.split("")
	var initial_state = state

	// Assertions
	// check that pos_init and pos_final are legal starts-of-activities
	assert(state.length >= pos_final + len, "main: length violation")

	state = remove(state, id)
	add_attempt = add(state, id, pos_final, len)
	state = add_attempt[0]
	displaced = add_attempt[1]

	configurations = get_configurations(displaced, [state.slice()], pos_final)

	var min_cost = Number.MAX_VALUE
	var min_configuration = null
	for (var i = 0; i < configurations.length; i++) {
		if (DEBUG) console.log("Testing config: [" + configurations[i] + "]")
		var cost = cost_function(initial_state, configurations[i], id)
		if (cost < min_cost) {
			if (DEBUG) console.log("Keeping configuration!")
			min_cost = cost
			min_configuration = configurations[i]
		}
	}
	assert(min_configuration != null, "main: no final config?")
	state = min_configuration

	var ret = state.join("").replace(/,/g, "")
	console.log("edit_distance() returning: \"" + ret + "\"")

	return ret
}

function constrain_bounds(string, start, stop) {
	console.log("constrain_bounds(\"" + string + "\", \"" + start + "\", \"" + stop + "\")")
	var state = string.split("")
	var orig_len = state.length
	var end_delta = -1

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

	ret = state.join("").replace(/,/g, "")
	if (start >= 0) {
		ret = Array(start+1).join(" ") + ret
	}
	if (stop <= orig_len) {
		ret = ret + Array(end_delta+1).join(" ")
	}

	console.log("constrain_bounds() returning: \"" + ret + "\"")

	return ret
}

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------



// -----------------------------------------------------------------------------
// Calls
// -----------------------------------------------------------------------------

var init = "AA  BBCCC  "
//var test = edit_distance(init, "C", 5, 3)
var test2 = constrain_bounds(init, -2, init.length + 6)

console.log("[" + init + "]")
console.log("[" + test2 + "]")
console.log("Orig len: " + init.length + ", new len: " + test2.length)

//console.log("FINAL RESULT: " + pprint(init) + " -> " + pprint(test))

