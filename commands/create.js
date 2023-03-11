const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('create')
		.setDescription('Let your friends know if you have room to join their game'),
	async execute(interaction) {
        // Embed that contains current users playing and users wanting to play
        const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle('Lobby')
        .setDescription(`Team 1:`);

        // Row of buttons that lets users decide if they want to play
        const buttons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('join')
                .setLabel(`Join`)
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('leave')
                .setLabel(`Leave`)
                .setStyle(ButtonStyle.Danger)
        );

        // Send the initial response with the embed and buttons
		await interaction.reply({ embeds: [embed], components: [buttons] });

        // Create a message component collector to listen for button clicks
        const filter = i => i.customId === 'join' || i.customId === 'leave';
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 300000 });

        collector.on('collect', async i => {
            // Update the embed based on which button was clicked
            if (i.customId === 'join') {
                embed.setDescription(`Team 1: \n ${i.user.username}`);
            } else if (i.customId === 'leave') {
                embed.setDescription(`Team 1:`);
            }
    
            // Edit the original message with the updated embed
            await i.update({ embeds: [embed], components: [buttons] });
        });
    
        collector.on('end', async collected => {
            embed.setTitle('Lobby (Closed)');
            // Remove the buttons from the original message when the collector ends
            await interaction.editReply({ embeds: [embed], components: [] });
        });
	},
}; 