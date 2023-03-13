const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { apexToken } = require('../config.json');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('patch')
		.setDescription('Get the latest patch notes'),
	async execute(interaction) {
        let response = await axios.get(`https://api.mozambiquehe.re/news?auth=${apexToken}`);

        // Iterate through Apex news articles
        for(const article in response.data){
            // Convert article title to lower case to help detect keyword 'patch'
            const titleToLowerCase = `${response.data[article].title}`.toLowerCase();

            // Find latest article that contains keyword 'patch' in the title
            if(titleToLowerCase.includes('patch')){
                // Create embed for patch release
                var patchEmbed = new EmbedBuilder()
                .setTitle(`${response.data[article].title}`)
                .setDescription(`${response.data[article].short_desc}`)
                .setImage(`${response.data[article].img}`)
                .setURL(`${response.data[article].link}`);

                break;
            }
        }
        // If there are no patch notes, send a message letting the user know
        if(patchEmbed.length === 0){
            await interaction.reply("There are no patch notes available at this time.");
        }
        else{
            // Send a single response with all the patch notes embedded
            await interaction.reply({ embeds : [patchEmbed] });
        }
	},
}; 