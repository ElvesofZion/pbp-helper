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

// setup libs
const Discord = require('discord.js');
const fs = require('fs');


let strings = {};

// load and parse the string file
try{
	strings = JSON.parse(fs.readFileSync(__dirname + '/../resources/resources.json', 'utf8'));
} catch (err) {
	console.log(err);
}

function messageBuilder (system, content) {
	let embed = new Discord.MessageEmbed();

	embed.setAuthor(system);
	embed.setDescription(content);

    // look into using fields instead of description

	console.log('Sent to Discord - ' + system + ': ' + content);

	return embed;
}

exports.message = messageBuilder;
