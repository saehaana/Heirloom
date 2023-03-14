const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('create')
		.setDescription('Let your friends know what game you want to play')
        .addStringOption(option => 
            option.setName('title')
            .setDescription('Set a message you want others to see')
            .setRequired(false))
        .addIntegerOption(option => 
            option.setName('team-size')
            .setDescription('The max number of players allowed')
            .setRequired(false)),
	async execute(interaction) {
        // Holds queue of users who join and leave the lobby
        const usernames = [];

        // Embed that contains current users playing and users wanting to play
        const embed = new EmbedBuilder()
        .setColor('Green')
        .setDescription('**Queue**:')

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
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 3600000 });

        collector.on('collect', async i => {   
            // Check if 'title' option was provided and add to embed
            const titleOption = interaction.options.getString('title');
            if(titleOption !== null){
                embed.setTitle(titleOption);
            }

            // 'team-size' optional flag to be used as max size of team
            const teamSizeOption = interaction.options.getInteger('team-size');
            if(teamSizeOption !== null){
                embed.setDescription(`**Queue (${usernames.length} / ${teamSizeOption})**: \n ${usernames.join('\n')}`);
            }
            
            // Update the embed based on which button was clicked
            if (i.customId === 'join') {
                // Ensures only unique names are added to the embed
                if(!usernames.includes(i.user.username)){
                    usernames.push(i.user.username);
                }
                if(teamSizeOption !== null){
                    embed.setDescription(`**Queue (${usernames.length} / ${teamSizeOption})**: \n ${usernames.join('\n')}`);
                }else{
                    embed.setDescription(`**Queue (${usernames.length})**: \n ${usernames.join('\n')}`);
                }
            } else if (i.customId === 'leave') {
                // Remove the user's username from the list of joined users
				const index = usernames.indexOf(i.user.username);
				if (index !== -1) {
					usernames.splice(index, 1);
				}
                if(teamSizeOption !== null){
                    embed.setDescription(`**Queue (${usernames.length} / ${teamSizeOption})**: \n ${usernames.join('\n')}`);
                }else{
                    embed.setDescription(`**Queue (${usernames.length})**: \n ${usernames.join('\n')}`);
                }
            } 
    
            // Edit the original message with the updated embed
            await i.update({ embeds: [embed], components: [buttons] });
        });
    
        collector.on('end', async collected => {
            if(titleOption !== null){
                embed.setTitle(`${titleOption} (Closed)`);
            }else{
                embed.setTitle('(Closed)');
            }

            embed.setColor('Red');
            // Remove the buttons from the original message when the collector ends
            await interaction.editReply({ embeds: [embed], components: [] });
        });
	},
}; 