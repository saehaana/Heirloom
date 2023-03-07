const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const {apexToken} = require('../config.json');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('test command'),
	async execute(interaction) {
        let response = await axios.get(`https://api.mozambiquehe.re/crafting?auth=${apexToken}`);

        console.log(`${response.data[0].bundleContent[0].itemType.asset}`);

        //Images for each item that holds name and cost data for both daily and weekly crafts
        //Use same url to add more images to single embed
        let dailyEmbed1 = new EmbedBuilder()
        .setTitle('Daily Craft Rotation')
        .setDescription(`
        ${response.data[0].bundleContent[0].itemType.name}
        Cost: ${response.data[0].bundleContent[0].cost}
        ${response.data[0].bundleContent[1].itemType.name}
        Cost: ${response.data[0].bundleContent[1].cost}`)
        .setURL(`${response.data[0].bundleContent[0].itemType.asset}`)
        .setImage(`${response.data[0].bundleContent[0].itemType.asset}`);

        let dailyEmbed2 = new EmbedBuilder()
        .setURL(`${response.data[0].bundleContent[0].itemType.asset}`)
        .setImage(`${response.data[0].bundleContent[1].itemType.asset}`);

        let weeklyEmbed1 = new EmbedBuilder()
        .setTitle('Weekly Craft Rotation')
        .setDescription(`
        ${response.data[1].bundleContent[0].itemType.name}
        Cost: ${response.data[1].bundleContent[0].cost}
        ${response.data[1].bundleContent[1].itemType.name}
        Cost: ${response.data[1].bundleContent[1].cost}`)
        .setURL(`${response.data[1].bundleContent[0].itemType.asset}`)
        .setImage(`${response.data[1].bundleContent[0].itemType.asset}`);

        let weeklyEmbed2 = new EmbedBuilder()
        .setURL(`${response.data[1].bundleContent[0].itemType.asset}`)
        .setImage(`${response.data[1].bundleContent[1].itemType.asset}`);
    
        // //change daily embed colors based on craft item rarity
        // if(`${response.data[0].bundleContent[0].itemType.rarity}` == 'Epic'){
        //     dailyEmbed1.setColor('Purple');
        // }else{
        //     dailyEmbed1.setColor('Blue');
        // }

        // if(`${response.data[0].bundleContent[1].itemType.rarity}` == 'Epic'){
        //     dailyEmbed2.setColor('Purple');
        // }else{
        //     dailyEmbed2.setColor('Blue');
        // }

        // //change weekly embed colors based on craft item rarity
        // if(`${response.data[1].bundleContent[0].itemType.rarity}` == 'Epic'){
        //     weeklyEmbed1.setColor('Purple');
        // }else{
        //     weeklyEmbed1.setColor('Blue');
        // }

        // if(`${response.data[1].bundleContent[1].itemType.rarity}` == 'Epic'){
        //     weeklyEmbed2.setColor('Purple');
        // }else{
        //     weeklyEmbed2.setColor('Blue');
        // }

		await interaction.reply({ embeds: [dailyEmbed1,dailyEmbed2,weeklyEmbed1,weeklyEmbed2]});
	},
};