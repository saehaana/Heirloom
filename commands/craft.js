const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { apexToken } = require('../config.json');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('craft')
		.setDescription('Gets the current replicator items'),
	async execute(interaction) {
        let response = await axios.get(`https://api.mozambiquehe.re/crafting?auth=${apexToken}`);

		//Images for each item that holds name and cost data for both daily and weekly crafts
        //Uses same url to add more images to single embed
        let dailyEmbed1 = new EmbedBuilder()
        .setTitle('Daily Craft Rotation')
        .setDescription(`
        ${ response.data[0].bundleContent[0].itemType.name }
        Cost: ${ response.data[0].bundleContent[0].cost }
        ${ response.data[0].bundleContent[1].itemType.name }
        Cost: ${ response.data[0].bundleContent[1].cost }`)
        .setURL(`${ response.data[0].bundleContent[0].itemType.asset }`)
        .setImage(`${ response.data[0].bundleContent[0].itemType.asset }`);

        let dailyEmbed2 = new EmbedBuilder()
        .setURL(`${ response.data[0].bundleContent[0].itemType.asset }`)
        .setImage(`${ response.data[0].bundleContent[1].itemType.asset }`);

        let weeklyEmbed1 = new EmbedBuilder()
        .setTitle('Weekly Craft Rotation')
        .setDescription(`
        ${ response.data[1].bundleContent[0].itemType.name }
        Cost: ${ response.data[1].bundleContent[0].cost }
        ${ response.data[1].bundleContent[1].itemType.name }
        Cost: ${ response.data[1].bundleContent[1].cost }`)
        .setURL(`${ response.data[1].bundleContent[0].itemType.asset }`)
        .setImage(`${ response.data[1].bundleContent[0].itemType.asset }`);

        let weeklyEmbed2 = new EmbedBuilder()
        .setURL(`${ response.data[1].bundleContent[0].itemType.asset }`)
        .setImage(`${ response.data[1].bundleContent[1].itemType.asset }`);
        
        //Returns discord embeds of all EmbedBuilder objects
        await interaction.reply({ embeds: [dailyEmbed1,dailyEmbed2,weeklyEmbed1,weeklyEmbed2] });
	},
};