const {REST, Routes} = require('discord.js');
const {token, clientID, testGuildID} = require('./config.json');

const commands = [
    {
        name: 'hey',
        description: 'replies with greeting',
    },
];

const rest = new REST({version : '10'}).setToken(token);

(async () => {
    try{
        console.log('Registering slash commands..');
        
        await rest.put(
            Routes.applicationGuildCommands(clientID, testGuildID),
            {body : commands}
        );

        console.log('Slash commands registered');
    }catch(error){
        console.log(`error occurred: ${error}`);
    }
})();