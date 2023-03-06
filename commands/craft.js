const { SlashCommandBuilder } = require('discord.js');
const {apexToken} = require('../config.json');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('craft')
		.setDescription('Gets the current replicator items'),
	async execute(interaction) {
        let response = await axios.get(`https://api.mozambiquehe.re/crafting?auth=${apexToken}`);
        
        await interaction.reply(`Daily: ${response.data[0].bundleContent[0].itemType.name}
        \nWeekly: ${response.data[1].bundleContent[0].itemType.name}, ${response.data[1].bundleContent[1].itemType.name}
        \nDuration: ${response.data[1].endDate}`);
	},
};