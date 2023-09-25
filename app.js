// Require the necessary discord.js classes
//read commands directory and identify command files
const fs = require('node:fs'); 
//contruct paths to access files and directories
const path = require('node:path');
const {Client, Collection, GatewayIntentBits} = require('discord.js');
const {token} = require('./config.json');

// Create a new client instance
const client = new Client({
	intents:
	[
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.MessageContent
	] 
});

//store and get commands for execution
client.commands = new Collection();

//get command files
//constructs path to commands directory
const commandsPath = path.join(__dirname, 'commands');
//reads path to directory and returns array of all javascript files  
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

const testCommandsPath = path.join(__dirname, 'test-commands');  
const testCommandFiles = fs.readdirSync(testCommandsPath).filter(file => file.endsWith('.js'));

//get event files
//constructs path to events directory
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

for (const file of testCommandFiles) {
	const filePath = path.join(testCommandsPath, file);
	const command = require(filePath);
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

// Log in to Discord with your client's token
client.login(token);