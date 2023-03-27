const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { apexToken } = require('../config.json');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('latest')
		.setDescription('Get official Apex news articles')
        .addSubcommand(subcommand =>
            subcommand.setName('patch')
            .setDescription('View the latest patch notes'))
        .addSubcommand(subcommand =>
            subcommand.setName('collection-event')
            .setDescription('View the latest collection event')),
	async execute(interaction) {
        let response = await axios.get(`https://api.mozambiquehe.re/news?auth=${apexToken}`);
        let allEmbeds = [];
        const subcommand = interaction.options.getSubcommand();
        
        // Iterate through Apex news articles
        for(const article in response.data){
            // Convert article title to lower case to help detect keyword 'patch'
            const titleToLowerCase = `${response.data[article].title}`.toLowerCase();

            // Check which subcommand was inputted by the user
            if(subcommand === 'patch'){
                // Find latest article that contains keyword 'patch' in the title
                if(titleToLowerCase.includes('patch')){
                    // Create embed for latest patch release
                    const patchEmbed = new EmbedBuilder()
                    .setTitle(`${response.data[article].title}`)
                    .setDescription(`${response.data[article].short_desc}`)
                    .setImage(`${response.data[article].img}`)
                    .setURL(`${response.data[article].link}`);

                    allEmbeds.push(patchEmbed);

                    break;
                }
            }else if(subcommand === 'collection-event'){
                if(titleToLowerCase.includes('collection event')){
                    // Create embed for latest collection event
                    const collectionEmbed = new EmbedBuilder()
                    .setTitle(`${response.data[article].title}`)
                    .setDescription(`${response.data[article].short_desc}`)
                    .setImage(`${response.data[article].img}`)
                    .setURL(`${response.data[article].link}`);

                    allEmbeds.push(collectionEmbed);

                    break;
                }
            }
        }
        await interaction.reply({ embeds : allEmbeds });  
	},
}; 