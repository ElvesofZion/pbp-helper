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

const fs = require('fs');
const messageBuilder = require('./utils/message-builder.js');

// load and parse the string file
let strings = JSON.parse(fs.readFileSync('./resources/resources.json', 'utf8'));

function help(channel, systems) {

	let helpMessage = strings.help;

	channel.send('', new messageBuilder.message(helpMessage))
		.catch(console.error);
	channel.stopTyping(true);
}

exports.help = help;