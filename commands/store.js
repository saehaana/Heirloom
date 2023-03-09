const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { apexToken } = require('../config.json');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('store')
		.setDescription('Gets current in game shop bundles'),
	async execute(interaction) {
        let response = await axios.get(`https://api.mozambiquehe.re/store?auth=${apexToken}`);

        for(const bundle in response.data){
            //Create embed for each store bundle
            var storeEmbed = new EmbedBuilder()
            .setTitle(`${response.data[bundle].title}`)
            .setDescription(`${response.data[bundle].pricing[0].quantity} Apex Coins`)
            .setImage(`${response.data[bundle].asset}`);

            //Get each item in bundle
            for(const item in response.data[bundle].content){
                console.log(response.data[bundle].content[item].name);
                storeEmbed.addFields({ name: `Item ${item}`, value: `${response.data[bundle].content[item].name}`, inline: true })
            }

            //Return list of all items
            await interaction.channel.send({ embeds : [storeEmbed] });
        }
	},
};