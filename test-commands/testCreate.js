const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('testcreate')
		.setDescription('Description'),
	async execute(interaction) {
        interaction.reply('placeholder');
	},
}; 