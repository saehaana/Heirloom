const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('create')
		.setDescription('Let your friends know what game you want to play')
        .addIntegerOption(option => 
            option.setName('team-size')
            .setDescription('The max number of players allowed')
            .setRequired(true))
        .addStringOption(option => 
            option.setName('title')
            .setDescription('Set a message you want others to see')
            .setRequired(false))
        .addRoleOption(option =>
            option.setName('role')
            .setDescription('Notify users of the role selected')
            .setRequired(false)),
	async execute(interaction) {
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

        let usernames = [];
        const titleOption = interaction.options.getString('title');
        const teamSizeOption = interaction.options.getInteger('team-size');

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

        await interaction.deferReply();
        // Send the initial response with the embed and buttons
        const initialResponse = await interaction.followUp({ embeds: [embed], components: [buttons] }); 

        // Get the guild object
        const guild = interaction.guild;
        // Get the list of roles in a guild
        const roles = guild.roles.cache;
        // Get the command option
        const roleOption = interaction.options.getRole('role');

        // Check if 'role' option provided, check if role exists in the guild
        if(roleOption && roles.has(roleOption.id)){
            // Send message to users based on command options provided
            if(titleOption){
                await initialResponse.channel.send(`LFG ${roleOption} : ${titleOption}`);
            }else{
                await initialResponse.channel.send(`LFG ${roleOption}`);
            }
            
        }
        
        // Create a message component collector to listen for button clicks
        const filter = (i) => i.customId === 'join' || i.customId === 'leave';
        const collector = initialResponse.createMessageComponentCollector({ filter, time: 3600000 });

        collector.on('collect', async i => {  
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

            // Check if the queue player count has been satisfied
            if(teamSizeOption){
                let message = "";
                if(usernames.length === teamSizeOption){
                    // Get collection of all members in channel
                    const mentions = initialResponse.channel.members
                    // Filter collection to users that stayed in queue
                    .filter(member => usernames.includes(member.user.username))
                    // Tag each member with the '@' symbol to mention them by converting member objects to a string
                    .map(member => member.toString());

                    message = `${mentions.join(', ')}, join voice to start`;
                    await initialResponse.channel.send(message);
                    
                    // Close the queue when filled
                    collector.stop();
                }
            }

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