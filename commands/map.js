const {SlashCommandBuilder} = require('discord.js');
const {apexToken} = require('../config.json');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('map')
		.setDescription('Gets the current map rotation'),
	async execute(interaction) {
        const response = await axios.get(`https://api.mozambiquehe.re/maprotation?version=2&auth=${apexToken}`);
        await interaction.reply(`Current: ${response.data.ranked.current.map}
Duration: ${response.data.ranked.current.remainingTimer}  

Next: ${response.data.ranked.next.map}

Current LTM: ${response.data.ltm.current.map}
Duration: ${response.data.ltm.current.remainingTimer}

Next LTM: ${response.data.ltm.next.map}`);
    },
};