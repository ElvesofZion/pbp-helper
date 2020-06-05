/*	
//	Copyright 2020 Shawn Gates
//
//	Licensed under the Apache License, Version 2.0 (the "License");
//	you may not use this file except in compliance with the License.
//	You may obtain a copy of the License at
//
//  http://www.apache.org/licenses/LICENSE-2.0
//
//	Unless required by applicable law or agreed to in writing, software
// 	distributed under the License is distributed on an "AS IS" BASIS,
//	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// 	See the License for the specific language governing permissions and
// 	limitations under the License.
*/

const Die = require('../../utils/die.js');
const fs = require('fs');

let cod_die = 10;
let cod_tn = 8;
let cod_ES = 5;

let results = [];
let results_explosion = [];
let success = [];
let results_reroll = [];
let strings;

// load and parse the string file
try{
	strings = JSON.parse(fs.readFileSync(__dirname + '/resources.json', 'utf8'));
} catch (err) {
	console.log(err);
}

let gm = 'Storyteller';
let call = '/cod';
let systems = new Map([
			[ 'CofD', gm ],
			[ 'CoD', gm ],
			[ 'Chronicles of Darkness', gm ],
			[ 'nWoD', gm ],
			[ 'New World of Darkness', gm ],
		]);

/**
 * Calls die rolling for Chronicles of Darkness
 * @param  Object options Parameter object
 * @param Boolean options.chance_die Sets whether the roll being made is a chance die
 * @param Number options.again Value to use for rolling again
 * @param Number options.explosion Flag if the current roll is a re-roll from an exploding die
 * @param Number options.rote Flag thats shows whether a roll shoudld be rote
 * @return {[type]}         [description]
 */
function roll(options) {
	if (!options) {
		console.log('Options is required!');
		return;
	}

	let result = Die.die.roll(cod_die);
	console.log('Roll Result: ' + result);
	if(!options.explosion) {
		results.push(result);
	} else {
		results_explosion.push(result);
	}
	if(result >= cod_tn) {success.push(result);}

	if(result < cod_tn && options.rote && !options.chance_die) {
		console.log('Rerolling failures once with Rote.');
		roll({
			again: options.again,
		});	
	}

	if(result >= options.again && !options.chance_die) {
		console.log('Roll was ' + result + ', which meets or beats the "again" threshold of ' + options.again);
		roll({
			explosion: true,
			again: options.again,
			rote: options.rote
		});		
	}

}

/**
 * [responseBuilder description]
 * @param  {Object} receivedMessage [description]
 * @return {[type]}                 [description]
 */
function responseBuilder(receivedMessage) {
	let author = receivedMessage.author.toString();
	let rote = false;
	let chance_die = false;
	let again = 10;
	let re_die = /[0-9]+(\s|$)/;
	let re_again = /8-again|9-again|no-again/;
	let re_rote = /rote/;

	let die_match = receivedMessage.content.match(re_die);
	if (die_match === null) {
		receivedMessage.channel.send(author + strings.no_dice);
		return;
	}
	console.log('Number of dice to be rolled: ' + die_match);
	let again_match = receivedMessage.content.match(re_again);
	if (again_match === null) {again_match = '';}
	console.log(again_match);
	let rote_match = receivedMessage.content.match(re_rote);
	if (rote_match === null) {rote_match = '';}
	console.log(rote_match);
	rote = rote_match[0] ? true : false;
	console.log(rote);
	
	switch (again_match[0]) {
		case '9-again':
			again = 9;
			break;
		case '8-again':
			again = 8;
			break;
		case 'no-again':
			again = 11;
			break;
		default:
	}
	console.log('Again type: ' + again);

	// Reject die pools over 100, large die pools cause server slow down and 100 is plenty of buffer space
	if (die_match > 100) {
		receivedMessage.channel.send(author + strings.large_roll);
		return;
	}
	let die_count = die_match[0];

	if(die_count == 0) {
		die_count = 1;
		chance_die = true;
	}

	for (var i = die_count-1; i >= 0; i--) {
		roll({
			chance_die: chance_die,
			again: again,
			rote:rote,
		});
	}

	let response = author + strings.roll;

	for (let i = results.length-1; i >= 0; i--) {
		let result_print = '';
		if (results[i] >= cod_tn) {
			if (chance_die) {
				if (results[i] != 10) {
					result_print = results[i];
				} else {
					result_print = '**' + results[i] + '**';
				}
			} else {
				result_print = '**' + results[i] + '**';
			}
		} else {
			result_print = results[i];
		}
		//add a comma between results
		if(i > 0) { 
			response += result_print + ', ';
		} else if(i === 0 && results_explosion.length != 0) {
			response += result_print + ', ';
		} else {
			response += result_print;
		}
	}
	for (let i = results_explosion.length-1; i >= 0; i--) {
		let result_print = '';
		if (results_explosion[i] >= cod_tn) {
			if (chance_die) {
				if (results_explosion[i] != 10) {
					result_print = results_explosion[i];
				} else {
					result_print = '**' + results_explosion[i] + '**';
				}
			} else {
				result_print = '**' + results_explosion[i] + '**';
			}
		} else {
			result_print = results_explosion[i];
		}
		//add a comma between results
		if(i > 0) { 
			response += result_print + ', ';
		} else {
			response += result_print;
		}
	}
	console.log('Success response to server: ' + response);
	receivedMessage.channel.send(response);

	let success_response = '';
	if (chance_die) {
		if(results[0] == 10) {
			success_response = strings.chance.success;
		} else if(results[0] == 1) {
			success_response = strings.chance.dramatic_failure;
		} else {
			success_response = strings.chance.failure;
		}
	} else {
		// success counting
		if(success.length == 0) {
			// failure
			success_response = strings.results.failure;
		} else if (success.length >= cod_ES) {
			//exceptional success
			success_response = strings.results.exceptional_success_1 + success.length + strings.results.exceptional_success_2;
		} else {
			//regular success
			success_response = strings.results.success_1 + success.length + strings.results.success_2;
		}
	}
	console.log('Results response to server: ' + success_response);
	receivedMessage.channel.send(success_response);

	results = [];
	success = [];
	results_explosion = [];
}

// Set the attributes
exports.call = call;
exports.system = systems;
exports.responseBuilder = responseBuilder;