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

// global variables

let annotation = '';

// function

function sanitizeAnnotions(message) {
//TODO: sanitize channel names since they start with '#' too

	if(message.annotation != '[0-9]*>') {
		
		let re_channel = new RegExp();

		//TODO handle the Regex below for no annotaions

		let channelName = message.guild.channels.resolve(message.annotation.match(re_channel)).name;

		message.annotation.replace(re_channel, channelName);

		annotation = ", for your '" + message.annotation + "' roll";
	}

	return annotation;
}

// export
exports.sanitize = sanitizeAnnotions;