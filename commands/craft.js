const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { apexToken } = require('../config.json');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('craft')
		.setDescription('Gets the current replicator items')
        .addStringOption(option =>
			option.setName('type')
            .setDescription('View craft rotations ')
            .addChoices(
                { name: 'Daily', value: 'daily' },
                { name: 'Weekly', value: 'weekly' },
            )),
	async execute(interaction) {
        let response = await axios.get(`https://api.mozambiquehe.re/crafting?auth=${apexToken}`);

        const choice = interaction.options.getString('type');
        let allEmbeds = [];

        if(choice == 'daily'){
            //Images for each item that holds name and cost data for both daily and weekly crafts
            //Uses same url to add more images to single embed
            let dailyEmbed1 = new EmbedBuilder()
            .setTitle('Daily Craft Rotation')
            .setColor('Blue')
            .setURL(`${ response.data[0].bundleContent[0].itemType.asset }`)
            .setImage(`${ response.data[0].bundleContent[0].itemType.asset }`)
            .addFields
            ({ name: `${response.data[0].bundleContent[0].itemType.name}`, value: `Cost: ${response.data[0].bundleContent[0].cost}`, inline: true },
            { name: `${response.data[0].bundleContent[1].itemType.name}`, value: `Cost: ${ response.data[0].bundleContent[1].cost }`, inline: true })
            
            allEmbeds.push(dailyEmbed1);

            let dailyEmbed2 = new EmbedBuilder()
            .setURL(`${ response.data[0].bundleContent[0].itemType.asset }`)
            .setImage(`${ response.data[0].bundleContent[1].itemType.asset }`);

            allEmbeds.push(dailyEmbed2);
        }

        if(choice == 'weekly'){
            let weeklyEmbed1 = new EmbedBuilder()
            .setTitle('Weekly Craft Rotation')
            .setColor('Blue')
            .setURL(`${ response.data[1].bundleContent[0].itemType.asset }`)
            .setImage(`${ response.data[1].bundleContent[0].itemType.asset }`)
            .addFields
            ({ name: `${response.data[1].bundleContent[0].itemType.name}`, value: `Cost: ${response.data[1].bundleContent[0].cost}`, inline: true },
            { name: `${ response.data[1].bundleContent[1].itemType.name}`, value: `Cost: ${ response.data[1].bundleContent[1].cost}`, inline: true })

            allEmbeds.push(weeklyEmbed1);
    
            let weeklyEmbed2 = new EmbedBuilder()
            .setURL(`${ response.data[1].bundleContent[0].itemType.asset }`)
            .setImage(`${ response.data[1].bundleContent[1].itemType.asset }`);

            allEmbeds.push(weeklyEmbed2);
        }

        //Returns discord embeds of all EmbedBuilder objects
        await interaction.reply({ embeds: allEmbeds });
	},
};