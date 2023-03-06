const { SlashCommandBuilder } = require('discord.js');
const {apexToken} = require('../config.json');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('craft')
		.setDescription('Gets the current replicator items'),
	async execute(interaction) {
		await interaction.reply('Pong!');
        let response = await axios.get(`https://api.mozambiquehe.re/crafting?auth=${apexToken}`);
        console.log(response.data);
	},
};