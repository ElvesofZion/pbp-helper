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
// 
//	@author Shawn Gates
*/

/**
 * Reads through the sent message and splits up the components
 * @param  {Object} message Message object from Discord
 * @return {Object} command Object containing the parsed command
 * @return {String} command.cmd Command denote with a slash
 * @return {String} command.author Author string of the message
 * @return {String} command.gameName Quoted name of the new game (only applicable for /init calls)
 * @return {Object} command.channel Channel object from Discord
 * @return {String} command.help Help string, null if help wasn't called
 * @return {String} command.annotion user specificed text to go with the roll
 * @return {Array} command.dice Any numbers passed are treated as dice
 * @return {Array} command.options Anything else is treated as an option
 */
function parse(message) {
	if (typeof message.content !== 'string') {
		console.log('Error: parse requires a Message object with a content string.');
		return;
	}

	console.log('Parsing the message from ' + message.channel.guild);

	let command = {
		cmd: '',
		author: '',
		gameName: '',
		channel: {},
		guild: {},
		dice: [],
		options: [],
		message: {},
		help: '',
		annotaion: ''
	}

	command.author = message.author.toString();
	command.guild = message.guild;
	command.channel = message.channel;

	// Extract game name
	let re_gameName = new RegExp(/[\"|\'].*[\"|\']/);
	gameName = message.content.match(re_gameName);
	if (gameName === null) gameName = [''];
	let newName = message.content.replace(gameName[0], '');

	let commandList = newName.split(' ');

	console.log(commandList);

	// Extract command
	command.cmd = commandList[0];
	if (command.cmd.charAt(0) !== '/') {
		console.log('Not a command for PbP-Helper');
		return command;
	}
	commandList.shift();

	// Extract Help command; null if it isn't called
	command.help = commandList.find(element => element === 'help');

	let list = commandList.values();

	for (const value of list) {
		if (isNaN(value)) {
	  		command.options.push(value);
		} else {
	  		command.dice.push(parseInt(value));
		}
	}

	// Extract annotation
	let re_annotation = new RegExp(/\#(.*)/);
	let annotation = message.content.match(re_annotation);
	console.log(annotation);
	command.annotation = annotation[1];
	
	return command;
}

exports.parse = parse;