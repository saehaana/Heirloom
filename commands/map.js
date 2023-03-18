const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { apexToken } = require('../config.json');
const axios = require('axios');
const moment = require("moment-timezone");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('map')
		.setDescription('Gets the current map'),
	async execute(interaction) {
        let response = await axios.get(`https://api.mozambiquehe.re/maprotation?version=2&auth=${apexToken}`);

        // Get the user's timezone and format it for readability

        // guess() - guesses user's timezone based on user settings
        let timeZone = moment.tz(`${response.data.ranked.next.readableDate_start}`, moment.tz.guess());
        console.log(timeZone);

        // e.g. timeZone = 18:00, offset = -4hrs from 18:00
        let offsetInMinutes = timeZone.utcOffset();
        console.log(offsetInMinutes);

        // Adds or subtracts offset if it is negative or positive to avoid setting wrong times
        // e.g. 18:00 - UTC(-4) = 18:00 + 4:00 = 22:00 | wrong
        //      18:00 - UTC(-4) = 18:00 - 4:00 = 14:00 | correct
        if(offsetInMinutes < 0){
            formattedTime = timeZone.add(offsetInMinutes, 'minutes').format('MM/DD hh:mm A');
            console.log(formattedTime);
        }
        if(offsetInMinutes >= 0){
            formattedTime = timeZone.subtract(offsetInMinutes, 'minutes').format('MM/DD hh:mm A');
            console.log(formattedTime);
        }
        
		//EmbedBuilder object that holds maps in rotation for specified game modes
        let currentMapEmbed = new EmbedBuilder()
        .setTitle('Ranked Map Rotation')
        .setColor('Blue')
        .addFields
        ({ name: 'Current', value: `${response.data.ranked.current.map}`, inline: true },
        { name: 'Duration', value: `${response.data.ranked.current.remainingTimer}`, inline: true })
	    .setImage(`${response.data.ranked.current.asset}`);

        let nextMapEmbed = new EmbedBuilder()
        .setColor('Blue')
        .addFields
        ({ name: 'Next', value: `${response.data.ranked.next.map}`, inline: true },
        { name: 'Start', value: `${formattedTime}`, inline: true })
	    .setImage(`${response.data.ranked.next.asset}`);

        await interaction.reply({ embeds: [currentMapEmbed, nextMapEmbed]});
	},
};