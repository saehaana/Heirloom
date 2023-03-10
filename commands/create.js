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
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

        // Define an array to store the usernames of users who have joined
        const usernames = new Set([]); 

        // Handle button clicks
        collector.on('collect', async interaction => {
            const username = interaction.member.user.username;
            
            if(interaction.customId == 'join'){
                usernames.add(username);
            }else if(interaction.customId == 'leave'){
                const index = usernames.indexOf(username);
                if(index !== -1){
                    // At position index, remove 1 item
                    usernames.splice(index,1);
                }
            }

            // Convert set to array
            const usernamesArray = Array.from(usernames);

            // Create a new embed with the updated list of usernames
            const updatedEmbed = new EmbedBuilder()
                .setColor('Blue')
                .setTitle('Lobby')
                .setDescription(`Team 1`)
                .addFields({ name: 'Players', value: usernamesArray.join('\n') });

            // Update the original response with the new embed and buttons
            await interaction.update({ embeds: [updatedEmbed], components: [buttons] });
        });
	},
};