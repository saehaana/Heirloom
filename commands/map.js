const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { apexToken } = require('../config.json');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('map')
		.setDescription('Gets the current map'),
	async execute(interaction) {
        let response = await axios.get(`https://api.mozambiquehe.re/maprotation?version=2&auth=${apexToken}`);

		//EmbedBuilder object that holds maps in rotation for specified game modes
        let currentMapEmbed = new EmbedBuilder()
        .setTitle('Ranked Map Rotation')
        .addFields
        ({ name: 'Current', value: `${response.data.ranked.current.map}`, inline: true },
        { name: 'Duration', value: `${response.data.ranked.current.remainingTimer}`, inline: true })
	    .setImage(`${response.data.ranked.current.asset}`);

        let nextMapEmbed = new EmbedBuilder()
        .addFields
        ({ name: 'Next', value: `${response.data.ranked.next.map}`, inline: true },
        { name: 'Start', value: `${response.data.ranked.next.readableDate_start}`, inline: true })
	    .setImage(`${response.data.ranked.next.asset}`);

		// let currentDeathmatchEmbed = new EmbedBuilder()
        // .setTitle('LTM Map Rotation')
        // .addFields
        // ({ name: 'Current', value: `${response.data.ltm.current.map}`, inline: true },
        // { name: 'Duration', value: `${response.data.ltm.current.remainingTimer}`, inline: true })
	    // .setImage(`${response.data.ltm.current.asset}`);

		// let nextDeathmatchEmbed = new EmbedBuilder()
        // .addFields
        // ({ name: 'Next', value: `${response.data.ltm.next.map}`, inline: true },
        // { name: 'Start', value: `${response.data.ltm.next.readableDate_start}`, inline: true })
	    // .setImage(`${response.data.ltm.next.asset}`);

        //Returns discord embeds of all EmbedBuilder objects
        await interaction.reply({ embeds: [currentMapEmbed, nextMapEmbed]});
	},
};