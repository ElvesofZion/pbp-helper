/*
//  Copyright 2020 Shawn Gates
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//  http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.
//
//  @author Shawn Gates
*/
"use strict";

// setup libs
const Discord = require('discord.js');
const fs = require('fs');
const secret_token = require('../secret_token.js');
const init = require('./init.js');
const help = require('./help.js');
const commandList = require('./utils/psuedo-switch.js');
const splitter = require('./utils/command-splitter.js');
require('./utils/js-extensions.js');

// global constants
const client = new Discord.Client();

// global variables
let message = {};
let systemAliases = new Map();
let systems = new Map();

_loadModules();

// list connected servers and channels when we connect to the Discord service
client.on('ready', () => {

    console.log("Connected as " + client.user.tag);
    // List servers the bot is connected to
    console.log("Servers:");
    client.guilds.cache.forEach((guild) => {
        console.log(" - " + guild.name);

        // List all channels
        guild.channels.cache.forEach((channel) => {
            console.log(` -- ${channel.name} (${channel.type}) - ${channel.id}`);
        });
    });
});


// listen for messages from the bot
client.on('message', (receivedMessage) => {
    // Prevent bot from responding to its own messages
    if (receivedMessage.author == client.user) {
        return;
    }
    
if (receivedMessage.guild.name != 'pbp-helper-test') {
    return;
}

    let cmd = splitter.parse(receivedMessage);

    console.log('Command Received: ' + cmd.cmd);

    message = cmd;
    commandList.pseudoSwitch(cmd.cmd);
});

/**
 * [_loadModules description]
 * @return {[type]} [description]
 */
function _loadModules() {

    // check the module folder for modules and add them to the switch for loading
    let files = fs.readdirSync(__dirname + '/modules');
    console.log('Loading System Modules: ' + files);
    for (let i = files.length - 1; i >= 0; i--) {
        _registerModule(files[i]);
    }
}

/**
 * [_registerModule description]
 * @param  {[type]} file [description]
 * @return {[type]}      [description]
 */
function _registerModule(file) {
    let sysModule = require(__dirname + '/modules/' + file.split('.')[0] + '/' + file);
    commandList.add(sysModule.call, function() {
        sysModule.responseBuilder(message);
    });
    systemAliases = systemAliases.merge(new Map(sysModule.systems));
    systems.set(sysModule.system, '');
}

/**
 * Function to set up the server as a PbP server
 */
function _init() {
    init.start(message, systemAliases);
}

/**
 * [_help description]
 * @return {[type]} [description]
 */
function _help() {
    help.help(message.channel, systems);
}

/**
 * [_reset description]
 * @return {[type]} [description]
 */
function _reset() {

    console.log('Clearing out all of our created content');

    // remove channels
    message.channel.guild.channels.deleteAll()
        .catch(console.error);

    // remove all roles
    message.channel.guild.roles.forEach(function (value, key) {
        value.delete()
        .catch(console.error);
    });

    // create a new general channel
    message.channel.guild.createChannel('general', { type: 'text'})
        .catch(console.error);
}

// Expose commands to Discord

commandList.add('/init', function() {
    _init();
});

commandList.add('/help', function() {
    _help();
});

commandList.add('/reset', function() {
    _reset();
});

commandList.add('/reload_modules', function() {
    _loadModules();
});

// log in to the bot with the secret token
let bot_secret_token = secret_token.bot_secret_token;
client.login(bot_secret_token);
