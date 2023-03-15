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
        let usernames = [];
        const titleOption = interaction.options.getString('title');
        const teamSizeOption = interaction.options.getInteger('team-size');

        const embed = new EmbedBuilder()
            .setColor('Green')
            .setDescription('**Queue**:')

        // Check if 'title' option was provided and add to embed
        if(titleOption !== null){
            embed.setTitle(titleOption);
        }

        // 'team-size' optional flag to be used as max size of team for embed 
        if(teamSizeOption !== null){
            embed.setDescription(`**Queue (${usernames.length} / ${teamSizeOption})**: \n ${usernames.join('\n')}`); 
        }else {
            embed.setDescription(`**Queue (${usernames.length})**: \n ${usernames.join('\n')}`);
        }

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

        await interaction.deferReply();
        // Send the initial response with the embed and buttons
        const initialResponse = await interaction.followUp({ embeds: [embed], components: [buttons] }); 

        // Create a message component collector to listen for button clicks
        const filter = (i) => i.customId === 'join' || i.customId === 'leave';
        const collector = initialResponse.createMessageComponentCollector({ filter, time: 3600000 });

        collector.on('collect', async i => {  
            // Update the embed based on which button was clicked
            if(i.customId === 'join'){
                // Ensures only unique names are added to the embed
                if(!usernames.includes(i.user.username)){
                    usernames.push(i.user.username);
                } 
                if(teamSizeOption !== null){
                    embed.setDescription(`**Queue (${usernames.length} / ${teamSizeOption})**: \n ${usernames.join('\n')}`);                
                }else{
                    embed.setDescription(`**Queue (${usernames.length})**: \n ${usernames.join('\n')}`);
                }
            }else if(i.customId === 'leave'){
                // Remove the user's username from the list of joined users
				const index = usernames.indexOf(i.user.username);
				if(index !== -1) {
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

            collector.stop();
        });
	},
};  