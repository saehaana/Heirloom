const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('heirloom')
		.setDescription('Keeps track of how close you are to your heirloom')
		.addBooleanOption(option => 
			option.setName('setup')
			.setDescription('Guides you through the process for tracking your Apex packs')
			.setRequired(false))
		.addStringOption(option => 
			option.setName('edit')
			.setDescription('Change an answer to a question')
			.setRequired(false))
		.addIntegerOption(option => 
			option.setName('count')
			.setDescription('Show your total Apex packs collected')
			.setRequired(false)),
	async execute(interaction) {
		const embed = new EmbedBuilder()
		.setColor('Red')
		.setTitle('Apex Pack Tracker')
		.setDescription('There is currently no automatic way to track Apex packs. ' + 
		'To track your total packs collected you will be asked a series of questions.\n\n ' + 
		`To change the answer to a question use the 'edit' option. \n\n` +
		`To check your total use the 'count' option. `)

		// Row of buttons that lets users view each question
        const buttons = new ActionRowBuilder()
        .addComponents( 
            // Create button to go back to previous question
            new ButtonBuilder()
                .setCustomId('previous')
                .setLabel(`Previous`)
                .setStyle(ButtonStyle.Primary),
            // Create button to go to next question
            new ButtonBuilder()
                .setCustomId('next')
                .setLabel(`Next`)
                .setStyle(ButtonStyle.Primary)
        );


        interaction.reply({ embeds: [embed], components: [buttons] });
	},
}; 
