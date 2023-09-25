const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    // test2 - 
    // Option : team-size - 
	data: new SlashCommandBuilder()
		.setName('test').setDescription('Let your friends know what game you want to play')
        .addIntegerOption(option => option.setName('team-size').setDescription('The max number of players allowed').setRequired(true))
        .addStringOption(option => option.setName('title').setDescription('Set a message you want others to see').setRequired(false))
        .addRoleOption(option => option.setName('role').setDescription('Notify users of the role selected').setRequired(false)),

    // interaction - The object that will be manipulated and outputted from the slash command
	async execute(interaction) {
        await interaction.deferReply();
        /**
         * *********** Initial Setup : Display ************ 
         * 
         * Summary : 
         * Displayed embed will add/remove users from the queue based on whether they click join or leave. 
         * 
         * @param embed        - Shows a boxed display within the message sent by the slash command. Contains user data such as names, icons, and buttons. 
         * @param buttons      - Object that holds a row of buttons for users to click. Buttons are named 'Join' or 'Leave'.
         * @param readyButtons - Object that holds a row of buttons for users to click. Buttons are named 'Ready' or 'Not Ready'.
         * 
         * @param usernames    - object that will be represented as an input for the embed 
         * @param message      - listener for users who click join or leave buttons
         * 
         * @returns            - message containing inputted embed and buttons
         * 
         * *********************************/
         
        // Get the guild object
        const guild = interaction.guild;
        // Get the list of roles in a guild 
        const roles = guild.roles.cache;
        // Get the slash command option
        const roleOption = interaction.options.getRole('role');
        const titleOption = interaction.options.getString('title');
        const teamSizeOption = interaction.options.getInteger('team-size');
        
        let usernames;
        let message;
        let readyCount;
        let cancel = false;

        let embed = new EmbedBuilder().setDescription('hi');
        let buttons = new ActionRowBuilder();
        let readyButtons = new ActionRowBuilder();
        let join = new ButtonBuilder();
        let leave = new ButtonBuilder();
        let ready = new ButtonBuilder();
        let notReady = new ButtonBuilder();

        let cancelEmbed = new EmbedBuilder().setColor('Red').setTitle('Canceled');

        const channelId = interaction.channelId;
        const messageId = interaction.channel.lastMessage;
        const channel = interaction.guild.channels.cache.get(channelId);

        //let initialResponse = await channel.messages.fetch(messageId);
 
        async function initializeVars(){
            usernames = [];
            message = "";
            readyCount = 0;
 
            embed.setColor('Green').setDescription('**Queue**:').setTimestamp().setFooter({ text: ' ', iconURL: 'https://i.imgur.com/AfFp7pu.png' })
            .setAuthor({ name: `Host: ${interaction.user.username}`, iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://discord.js.org' });

            join.setCustomId('join').setLabel(`Join`).setStyle(ButtonStyle.Success)
		    leave.setCustomId('leave').setLabel(`Leave`).setStyle(ButtonStyle.Danger)
            ready.setCustomId('ready').setLabel(`Ready`).setStyle(ButtonStyle.Primary)
		    notReady.setCustomId('notReady').setLabel(`Not Ready`).setStyle(ButtonStyle.Primary)
 
            // Row of buttons that lets users decide if they want to play
            buttons.addComponents(join,leave);
            readyButtons.addComponents(ready,notReady); 

            /**
             * *********** Initial Setup : Optional Commands ************ 
             * 
             * Summary : 
             * Displayed embed will add/remove users from the queue based on whether they click join or leave. 
             * 
             * @param guild          - The Discord server 
             * @param roles          - The Discord server's groups users are assigned to
             * 
             * @param roleOption     - Optional subcommand, 
             *                         e.g.,  
             * @param titleOption    - Optional subcommand,
             *                         e.g., 
             * @param teamSizeOption - Required subcommand, sets the number of players required to fill the queue
             *                         e.g.,
             * 
             * @returns              - message containing inputted embed and buttons
             * 
             * *********************************/

            // Add a title to the embed if the user provided one 
            if(titleOption !== null){
                embed.setTitle(titleOption);
            }

            // teamSizeOption - optional flag to be used as max size of team for embed 
            if(teamSizeOption !== null){
                embed.setDescription(`**Queue (${usernames.length} / ${teamSizeOption})**: \n ${usernames.join('\n')}`); 
            }else {
                embed.setDescription(`**Queue (${usernames.length})**: \n ${usernames.join('\n')}`);
            }

            // Check if 'role' option provided, check if role exists in the guild
            if(roleOption && roles.has(roleOption.id)){
                // Send message to users based on command options provided
                if(titleOption){
                    await interaction.channel.send(`LFG ${roleOption} : ${titleOption}`);
                }else{
                    await interaction.channel.send(`LFG ${roleOption}`);
                }
                
            }

            // Send the initial response with the embed and buttons
            
            await interaction.editReply({ embeds: [embed], components: [buttons] });
            phase1();
        } 

        /**
         * *********** Phase 1 ************  
         * 
         * Summary : 
         * Displayed embed will add/remove users from the queue based on whether they click join or leave. 
         * 
         * Case - Queue filled : 
         * Once the queue is filled with the required number of players the embed will move onto Phase 2.
         * 
         * @param i                - object that will be represented as an input for the embed 
         * @param initialCollector - listener for users who click join or leave buttons
         * @returns                - message containing inputted embed and buttons
         * 
         * *********************************/
        function phase1() {
            // Create a message component collector to listen for button clicks
            const filter = (i) => i.customId === 'join' || i.customId === 'leave';
            const initialCollector = interaction.channel.createMessageComponentCollector({ filter, time: 14400000 });
            
            // Update the embed based on which button was clicked
            initialCollector.on('collect', async i => {  
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
                    if(usernames.length == 0 && interaction.user.id === i.user.id){
                        initialCollector.stop();
                    }
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

                // Initiate Phase 2 when queue satisfied
                if(usernames.length === teamSizeOption){
                    initialCollector.stop(); 

                    embed
                    .setColor('Yellow')
                    .setTitle('Ready Check')
                    .setAuthor({ name: `Host: ${interaction.user.username}`, iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://discord.js.org' })
                    .setTimestamp();

                    let mentionUserMessage = ""
                    for(const user in usernames){
                        targetUser = usernames[user];
                        const mentionedUser = interaction.guild.members.cache.find((member) => member.user.username === targetUser);
                        mentionUserMessage += `${mentionedUser}`;
                    }
                    embed.setDescription(`You have 1 minute to join or be kicked out of queue \n\n Waiting On: ${mentionUserMessage}`);
                    
                    await interaction.editReply({ embeds: [embed], components: [readyButtons] }); 
                    phase2();
                }
                if(usernames.length != teamSizeOption && initialCollector.ended == true){
                    cancel = true;
                    await interaction.editReply({ embeds: [cancelEmbed], components: [] });
                    phase2();
                }
            });

            // // Embed setup for Phase 2
            // initialCollector.on('end', async collected => {
            //     embed.setColor('Yellow');
            //     embed.setTitle('Ready Check');
            //     embed.setDescription(`Waiting On: ${usernames.join()}`);

            //     await interaction.editReply({ embeds: [embed], components: [readyButtons] }); 

            //     // @ Mention all users in queue to ready up
            //     let readyMessage = "";
            //     for(const user in usernames){
            //         targetUser = usernames[user];
            //         const mentionedUser = interaction.guild.members.cache.find((member) => member.user.username === targetUser);
            //         readyMessage += `${mentionedUser.user} `;
            //     }
                
            //     await interaction.channel.send(readyMessage);
            // });
        }

        /**
         * *********** Phase 2 ************ 
         * 
         * Summary : 
         * The bot will check if all queued players are ready. New buttons will appear for players to set their status and will update the embed accordingly. 
         * 
         * Case - Not ready :
         * If a player clicks not ready, or not all players have set their status prior to the time limit, then the embed will be sent back to phase 1 and remove the player(s) not ready.
         * The queue must be filled again in order to proceed back to Phase 2.
         * 
         * Case - Ready : 
         * Once all queued players click the ready button within the time limit, the bot will send a final notice for all players to join a voice channel.
         * The embed will then stop listening and close. 
         * 
         * @param i              - object that will be represented as an input for the embed 
         * @param readyCollector - listener for users who click ready or unready buttons
         * @returns              - message containing inputted embed and buttons
         * 
         * *********************************/
        function phase2(){
            // Listen if queued players are ready or not ready and update embed accordingly
            const readyFilter = (i) => i.customId === 'ready' || i.customId === 'notReady';
            const readyCollector = interaction.channel.createMessageComponentCollector({ readyFilter, time: 60000 });

            if(cancel == true){
                readyCollector.stop();
            }

            // Users who click ready or not ready will receive status icons next to their names
            readyCollector.on('collect', async i => {
                if (i.customId === 'ready' && usernames.includes(i.user.username)) {
                    embed.addFields({ name: `${i.user.username}`, value: ':white_check_mark:', inline: true })
                    readyCount++;
                } else if (i.customId === 'notReady' && usernames.includes(i.user.username)) {
                    embed.addFields({ name: `${i.user.username}`, value: ':x:', inline: true })

                    // Remove the player who is not ready and stop collector to requeue ready players
                    readyCollector.stop();
                }

                await interaction.editReply({ embeds: [embed], components: [readyButtons] });

                // Close the queue when filled and all ready
                if (readyCount == teamSizeOption) {
                    readyCollector.stop();
                } 
            });   

            readyCollector.on('end', async collected => {
                // Notify players if all are ready
                if (readyCount == teamSizeOption) {
                    // Get collection of all members in channel
                    const mentions = interaction.channel.members
                    // Filter collection to users that stayed in queue
                    .filter(member => usernames.includes(member.user.username))
                    // Tag each member with the '@' symbol to mention them by converting member objects to a string
                    .map(member => member.toString());

                    if(readyCount != 0){
                        message = `${mentions.join(', ')}, join voice to start`;
                        await interaction.channel.send(message);
                    }
                    
                    if(titleOption !== null){
                        embed.setTitle(`${titleOption} (Closed)`);
                    }else{
                        embed.setTitle('(Closed)');
                    }
                    embed.setColor('Red')

                    let finalPlayers = ""
                    for(let i = 0; i < teamSizeOption; i++){
                        if(i == (teamSizeOption-1)){
                            finalPlayers += `${usernames[i]}`
                        }else if(i != teamSizeOption){
                            finalPlayers += `${usernames[i]},` 
                        } 
                        
                    }
                    embed.setDescription(`Players: ${finalPlayers}`);

                    await interaction.editReply({ embeds: [embed], components: [] });

                } else if (readyCount != teamSizeOption || collected === 'time'){
                    if(cancel == true){
                        await interaction.editReply({ embeds: [cancelEmbed], components: [] });
                    }
                    
                    await interaction.deleteReply().then(initializeVars());
                    
                }
            });
 
        } 

        initializeVars(); 
	},
};  