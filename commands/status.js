const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const {apexToken} = require('../config.json');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('status')
		.setDescription('Checks server status'),
	async execute(interaction) {
        const response = await axios.get(`https://api.mozambiquehe.re/servers?auth=${apexToken}`);
    
        const embed = new EmbedBuilder()
            .setColor('Green')
            .addFields(
                { name: 'Lobby/Matchmaking Servers', value: `${response.data.EA_novafusion['US-East'].Status}`},
                { name: 'Origin Logins', value: `${response.data.Origin_login['US-East'].Status}`, inline: true },
                { name: 'EA Accounts', value: `${response.data.EA_accounts['US-East'].Status}`, inline: true },
                { name: 'Apex website', value: `${response.data.selfCoreTest['Status-website'].Status}`, inline: true },
            )
	        .setTimestamp();

        console.log(response.data);
        await interaction.reply({ embeds: [embed] });
	},
};