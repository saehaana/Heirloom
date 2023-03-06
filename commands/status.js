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
            .setDescription('Data from apexlegendsstatus.com')
            .addFields(
                { name: 'Lobby/Matchmaking Servers', value: `${response.data.EA_novafusion['US-East'].Status}`},
                { name: 'Origin Logins', value: `${response.data.Origin_login['US-East'].Status}`, inline: true },
                { name: 'EA Accounts', value: `${response.data.EA_accounts['US-East'].Status}`, inline: true },
                { name: 'Apex website', value: `${response.data.selfCoreTest['Status-website'].Status}`, inline: true },
            )
	        .setTimestamp();

        if(response.data.EA_novafusion['US-East'].Status == 'SLOW'
            || response.data.Origin_login['US-East'].Status == 'SLOW'
            || response.data.EA_accounts['US-East'].Status == 'SLOW'
            || response.data.selfCoreTest['Status-website'].Status == 'SLOW')
        {
            embed.setColor('Yellow');
        }
        if(response.data.EA_novafusion['US-East'].Status == 'DOWN' 
            || response.data.Origin_login['US-East'].Status == 'DOWN' 
            || response.data.EA_accounts['US-East'].Status == 'DOWN'
            || response.data.selfCoreTest['Status-website'].Status == 'DOWN')
        {
            embed.setColor('Red');
        }

        await interaction.reply({ embeds: [embed] });
	},
};