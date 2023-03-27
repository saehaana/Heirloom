const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { apexToken } = require('../config.json');
const axios = require('axios');
const moment = require("moment-timezone");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('map')
		.setDescription('Gets the current and next maps')
		.addStringOption(option =>
			option.setName('ranked')
            .setDescription('Selects the ranked game mode')
            .addChoices(
                { name: 'Battle Royale', value: 'ranked_br' },
                { name: 'Arenas', value: 'ranked_arena' },
            ))
        .addStringOption(option =>
            option.setName('unranked')
            .setDescription('Selects the unranked game mode')
            .addChoices(
                { name: 'Battle Royale', value: 'unranked_br' },
                { name: 'Arenas', value: 'unranked_arena' },
            ))
        .addStringOption(option =>
            option.setName('ltm')
            .setDescription('Selects the ltm game mode')),
	async execute(interaction) {
        let response = await axios.get(`https://api.mozambiquehe.re/maprotation?version=2&auth=${apexToken}`);

        const rankedOption = interaction.options.getString('ranked');
        const unrankedOption = interaction.options.getString('unranked');
        const ltmOption = interaction.options.getString('ltm');

        let allEmbeds = [];

        // Check if the ranked option was selected
        if(rankedOption){

            //                                                      //
            // Get the user's timezone and format it for readability//
            //                                                      //

            // Time formatting for ranked battle royale

            // guess() - guesses user's timezone based on user system settings
            let rankedTime = moment.tz(`${response.data.ranked.next.readableDate_start}`, moment.tz.guess());

            // e.g. timeZone = 18:00, offset = -4hrs from 18:00
            let rankedOffset = rankedTime.utcOffset();

            // Adds or subtracts offset if it is negative or positive to avoid setting wrong times
            // e.g. 18:00 - UTC(-4) = 18:00 + 4:00 = 22:00 | wrong
            //      18:00 - UTC(-4) = 18:00 - 4:00 = 14:00 | correct
            if(rankedOffset < 0){
                rankedFormatted = rankedTime.add(rankedOffset, 'minutes').format('MM/DD hh:mm A');
            }
            if(rankedOffset >= 0){
                rankedFormatted = rankedTime.subtract(rankedOffset, 'minutes').format('MM/DD hh:mm A');
            }

            // Creates and displays embeds of current and next maps for the specified game mode

            const currentRankedBrEmbed = new EmbedBuilder()
            .setTitle('Ranked Map Rotation')
            .setColor('Blue')
            .addFields
            ({ name: 'Current', value: `${response.data.ranked.current.map}`, inline: true },
            { name: 'Duration', value: `${response.data.ranked.current.remainingTimer}`, inline: true })
            .setImage(`${response.data.ranked.current.asset}`);

            allEmbeds.push(currentRankedBrEmbed);

            const nextRankedBrEmbed = new EmbedBuilder()
            .setColor('Blue')
            .addFields
            ({ name: 'Next', value: `${response.data.ranked.next.map}`, inline: true },
            { name: 'Start', value: `${rankedFormatted}`, inline: true })
            .setImage(`${response.data.ranked.next.asset}`);

            allEmbeds.push(nextRankedBrEmbed);
        } 

        // Check if the unranked option was selected
        if(unrankedOption){
            // Time formatting for unranked battle royale

            let unrankedTime = moment.tz(`${response.data.battle_royale.next.readableDate_start}`, moment.tz.guess());
            console.log(unrankedTime);

            let unrankedOffset = unrankedTime.utcOffset();
            console.log(unrankedOffset);

            if(unrankedOffset < 0){
                unrankedFormatted = unrankedTime.add(unrankedOffset, 'minutes').format('hh:mm A');
                console.log(unrankedFormatted);
            }
            if(unrankedOffset >= 0){
                unrankedFormatted = unrankedTime.subtract(unrankedOffset, 'minutes').format('hh:mm A');
                console.log(unrankedFormatted);
            }

            // Creates and displays embeds of current and next maps for the specified game mode

            const currentUnrankedBrEmbed = new EmbedBuilder()
            .setTitle('Unranked Map Rotation')
            .setColor('Blue')
            .addFields
            ({ name: 'Current', value: `${response.data.battle_royale.current.map}`, inline: true },
            { name: 'Duration', value: `${response.data.battle_royale.current.remainingMins} minute(s)`, inline: true })
            .setImage(`${response.data.battle_royale.current.asset}`);

            allEmbeds.push(currentUnrankedBrEmbed);
            
            const nextUnrankedBrEmbed = new EmbedBuilder()
            .setColor('Blue')
            .addFields
            ({ name: 'Next', value: `${response.data.battle_royale.next.map}`, inline: true },
            { name: 'Start', value: `${unrankedFormatted}`, inline: true })
            .setImage(`${response.data.battle_royale.next.asset}`);

            allEmbeds.push(nextUnrankedBrEmbed);
        } 

        await interaction.reply({ embeds: allEmbeds });
	},
};