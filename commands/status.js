const { SlashCommandBuilder } = require('discord.js');
const {apexToken} = require('../config.json');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('status')
		.setDescription('Checks server status'),
	async execute(interaction) {
		await interaction.reply('Pong!');
        let response = await axios.get(`https://api.mozambiquehe.re/servers?auth=${apexToken}`);
        console.log(response.data);
	},
};