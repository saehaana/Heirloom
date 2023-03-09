const { SlashCommandBuilder } = require('discord.js');
const { apexToken } = require('../config.json');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('store')
		.setDescription('Gets current in game shop bundles'),
	async execute(interaction) {
        let response = await axios.get(`https://api.mozambiquehe.re/store?auth=${apexToken}`);
        console.log(response.data[0].asset);

        await interaction.reply(`Nothing yet`);
	},
};