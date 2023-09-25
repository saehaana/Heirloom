const {REST, Routes} = require('discord.js');
const {token, clientID, testGuildID} = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
const testCommands = [];

// Grab all the command files from the commands directory 
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Grab all test commands from test-commands directory
const testCommandsPath = path.join(__dirname, 'test-commands');
const testCommandFiles = fs.readdirSync(testCommandsPath).filter(file => file.endsWith('.js'));

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}

for (const file of testCommandFiles) { 
    const testCommand = require(`./test-commands/${file}`);
    testCommands.push(testCommand.data.toJSON());
}

const rest = new REST({version : '10'}).setToken(token);

//deploy commands
(async () => {
    try{
        console.log('Registering slash commands..');
        
        await rest.put(
            Routes.applicationCommands(clientID),
            {body : commands}
        );
        console.log('Global commands registered...');

        await rest.put(
            Routes.applicationGuildCommands(clientID, testGuildID),
            {body : testCommands}
        );
        console.log('Test commands registered...');
        
        console.log('All slash commands registered');
    }catch(error){
        console.log(`error occurred: ${error}`);
    }
})(); 