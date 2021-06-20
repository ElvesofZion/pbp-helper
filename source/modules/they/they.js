/*
//	Copyright 2021 Shawn Gates
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
//
//	@author Shawn Gates
*/
"use strict";

// includes
const Die = require('../../utils/die.js');
const messageBuilder = require('../../utils/message-builder.js');
const help = require('../../utils/help-system.js');
const fs = require('fs');

// load external data
let strings;
// load and parse the string file
try {
	strings = JSON.parse(fs.readFileSync(__dirname + '/resources.json', 'utf8'));
} catch (err) {
	console.log(err);
}

let config;
// load and parse the config file
try {
	config = JSON.parse(fs.readFileSync(__dirname + '/config.json', 'utf8'));
} catch (err) {
	console.log(err);
}
let target_number = config.target_number;
let systems;
try {
	systems = new Map(config.systems);
} catch (err) {
	console.log(err);
}

// might be able to make this one Map (key: [value, success or not])
let results = [];
let success = [];

/**
 * Calls die rolling for They Came From...
 * @param  Object options Parameter object
 * @param Boolean options.chance_die Sets whether the roll being made is a chance die
 * @param Number options.double value to use for double successes
 * @return {[type]}         [description]
 */
function roll(options) {
	if (!options) {
		console.log('Options is required!');
		return;
	}

	let result = Die.die.roll(10);
	results.push(result);
	if(result >= target_number) success.push(result);

	// double success on 10
	if(result >= options.double) {
		success.push('Double');
		results.push('Extra');
	}
}

/**
 * [responseBuilder description]
 * @param  {[type]} receivedMessage [description]
 * @return {[type]}                 [description]
 */
function responseBuilder(receivedMessage) {
	let author = receivedMessage.author.toString();
	let double = 10;
	let re_die = /[0-9]+/;
	let re_double = /(8|9)-double /;
	let die_match = receivedMessage.dice[0];
	let difficulty = 0;
	let botch_potential = false;

	//check for help command and rout to that instead
	if(receivedMessage.help) {
		helpBuilder(receivedMessage);
		return;
	}

	if (die_match === undefined) {
		receivedMessage.channel.send('', new messageBuilder.message(config.system, author + strings.no_dice))
			.catch(console.error);
		receivedMessage.channel.stopTyping(true);
		return;
	}

	// Reject die pools over 100, large die pools cause server slow down and 100 is plenty of buffer space
	if (die_match > 100) {
		receivedMessage.channel.send('', new messageBuilder.message(config.system, author + strings.too_large))
			.catch(console.error);
		receivedMessage.channel.stopTyping(true);
		return;
	}

	console.log('Number of dice to be rolled: ' + die_match);

	// check for a changed explosion value
	let double_match = receivedMessage.options.find(element => element.slice(-5) === 'double');
	if (double_match === null) {double_match = '';}

	switch (double_match) {
		case '9-double':
			double = 9;
			break;
		case '8-double':
			double = 8;
			break;
		case 'no-double':
			double = 11;
			break;
		default:
	}
	console.log('Double type: ' + double);

	// skill tricks let Talents adjust target numbers
	let target_number_match = receivedMessage.options.find(element => element.slice(0,6) === 'target');
	let target_number_match_alternate = receivedMessage.options.find(element => element.slice(0,1) === 't');
	if (target_number_match !== undefined) {
		target_number = target_number_match.slice(-1);
	}
	if (target_number_match_alternate !== undefined) {
		target_number = target_number_match_alternate.slice(-1);
	}
	console.log('target number: ' + target_number);

	// check for the difficulty
	let difficulty_match = receivedMessage.options.find(element => element.slice(0,4) === 'diff');
	let difficulty_match_alternate = receivedMessage.options.find(element => element.slice(0,1) === 'd');
	if (difficulty_match !== undefined) {
		difficulty = difficulty_match.slice(-1);
	}
	if (difficulty_match_alternate !== undefined) {
		difficulty = difficulty_match_alternate.slice(-1);
	}
	console.log('difficulty: ' + difficulty);

	// Roll the pool
	for (var i = die_match-1; i >= 0; i--) {
		roll({
			double: double,
		});
	}

	// start building the response
	let response = author + strings.roll;

	for (let i = results.length - 1; i >= 0; i--) {
		let result_print = ''
		if (results[i] >= target_number) {
			result_print = '**' + results[i] + '**';
		} else {
			result_print = results[i];
			if (results[i] === 1) {
				botch_potential = true;
			}
		}
		//add a comma between results
		if(i > 0) {
			response += result_print + ', ';
		} else {
			response += result_print;
		}
	}

	response += strings.response_1 + success.length + strings.response_2;

	// if an init call capture the results and re-direct
	let init_match = receivedMessage.options.find(element => element === 'init');
	if (init_match !== undefined) {
		initiative();
	}

	if(success.length < difficulty) {
		//check for botch
		if (botch_potential) {
			response += strings.response_botch_1;
		} else {
			response += strings.response_consolation_1 + difficulty + strings.response_consolation_2;
		}
	}

	console.log('Results response to server: ' + response);
	receivedMessage.channel.send('', new messageBuilder.message(config.system, response))
		.catch(console.error);

	receivedMessage.channel.stopTyping(true);

	results = [];
	success = [];
}

function initiative() {
// 2. gives ticks
// 3. Director or players choose who goes on a given tick, that uses their focus
// 4. New round, same ticks, but focuses can be different
}

/**
 * [helpBuilder description]
 * @param {Message} message
 * @return
 */
function helpBuilder(message) {
	let response = strings.help;
	// add automatic listing of supported game systems
	message.channel.send('', new messageBuilder.message(config.system, response))
		.catch(console.error);
	message.channel.stopTyping(true);
}

exports.call = config.call;
exports.system = config.system;
exports.systems = config.systems;
exports.responseBuilder = responseBuilder;