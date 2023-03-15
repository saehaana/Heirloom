const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { apexToken } = require('../config.json');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('store')
		.setDescription('Gets current in game shop bundles'),
	async execute(interaction) {
        let response = await axios.get(`https://api.mozambiquehe.re/store?auth=${apexToken}`);

        let allStoreEmbeds = [];
        
        // Iterate through each bundle and create a separate embed containing their data
        for(const bundle in response.data){
            const storeEmbed = new EmbedBuilder()
            .setTitle(`${response.data[bundle].title}`)
            .setImage(`${response.data[bundle].asset}`)
            .setColor('Purple');

            // Check if bundle is available for purchase with both Apex coins and Legend tokens and set description accordingly
            if(`${response.data[bundle].pricing[0].ref}` === 'Legend Tokens'){
                storeEmbed.setDescription(`${response.data[bundle].pricing[0].quantity} Legend Tokens | ${response.data[bundle].pricing[1].quantity} Apex Coins`);
            }else{
                storeEmbed.setDescription(`${response.data[bundle].pricing[0].quantity} Apex Coins`);
            }

            allStoreEmbeds.push(storeEmbed);
        }
        
        // Row of buttons that lets users view each bundle
        const buttons = new ActionRowBuilder()
        .addComponents( 
            // Create button to go back to previous embed
            new ButtonBuilder()
                .setCustomId('previous')
                .setLabel(`Previous`)
                .setStyle(ButtonStyle.Primary),
            // Create button to go to next embed
            new ButtonBuilder()
                .setCustomId('next')
                .setLabel(`Next`)
                .setStyle(ButtonStyle.Primary)
        );

        // Send initial message with the first embed and action row
        await interaction.deferReply();
        const initialResponse = await interaction.followUp({ embeds: [allStoreEmbeds[0]], components: [buttons] });

        // Listens for button clicks for 20 minutes
        const filter = (i) => i.customId === 'previous' || i.customId === 'next';
        const collector = initialResponse.createMessageComponentCollector({ filter, time: 1200000 });

        let embedIndex = 0;
        collector.on('collect', async (interaction) => {
            // Update embed index based off which button was clicked
            if(interaction.customId === 'next'){
                // Do nothing when next is clicked if the last embed is in view
                if(embedIndex + 1 >= allStoreEmbeds.length){
                    await interaction.deferUpdate();
                }else{
                    embedIndex++;
                    // Update the message with the previous embed
                    await interaction.update({ embeds: [allStoreEmbeds[embedIndex]], components: [buttons] });
                }
            }
            else if(interaction.customId === 'previous'){
                // Do nothing when previous is clicked if the first embed is in view
                if(embedIndex - 1 < 0){
                    await interaction.deferUpdate();
                }else if(!(embedIndex - 1 < 0)){
                    embedIndex--;
                    // Update the message with the next embed
                    await interaction.update({ embeds: [allStoreEmbeds[embedIndex]], components: [buttons] });
                }
            }
        });

        // Close the collector and remove buttons from the last viewed embed 
        collector.on('end', async (interaction) => {
            await initialResponse.editReply({ embeds: [allStoreEmbeds[embedIndex]], components: [] });
            collector.stop();
        })

	},
}; 