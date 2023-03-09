const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('create')
		.setDescription('Let your friends know if you have room to join their game'),
	async execute(interaction) {
        //Embed that contains current users playing and users wanting to play
        const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle('Lobby')
        .setURL('https://discord.js.org')
        .setDescription(`Players in Lobby: `);

        //Row of buttons that lets users decide if they want to play
        const buttons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('success')
                .setLabel(`Join`)
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('danger')
                .setLabel(`Leave`)
                .setStyle(ButtonStyle.Danger)
        );

		await interaction.reply({ embeds: [embed], components: [buttons] });
	},
};