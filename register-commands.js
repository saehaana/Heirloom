const {REST, Routes} = require('discord.js');
const {token, clientID, testGuildID, realGuildID} = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');

const commands = [];

// Grab all the command files from the commands directory 
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}

const rest = new REST({version : '10'}).setToken(token);

//deploy commands
(async () => {
    try{
        console.log('Registering slash commands..');
        
        await rest.put(
            Routes.applicationGuildCommands(clientID, (realGuildID && testGuildID)),
            {body : commands}
        );

        console.log('Slash commands registered');
    }catch(error){
        console.log(`error occurred: ${error}`);
    }
})(); 