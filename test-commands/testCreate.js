const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('testCreate')
		.setDescription('Description'),
	async execute(interaction) {
        interaction.reply('placeholder');
	},
}; 