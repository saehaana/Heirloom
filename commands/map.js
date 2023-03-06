const {SlashCommandBuilder} = require('discord.js');
const {apexToken} = require('../config.json');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('map')
		.setDescription('Gets the current map rotation'),
	async execute(interaction) {
		await interaction.reply('Pong!');
        let response = await axios.get(`https://api.mozambiquehe.re/maprotation?auth=${apexToken}`);
        console.log(response.data);
    },
};