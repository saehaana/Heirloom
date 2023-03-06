const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const {apexToken} = require('../config.json');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('status')
		.setDescription('Checks server status'),
	async execute(interaction) {
        let response = await axios.get(`https://api.mozambiquehe.re/servers?auth=${apexToken}`);

        const embed = new EmbedBuilder()
            .setColor('Green')
            .setURL('https://apexlegendsstatus.com/')
            .addFields(
                { name: 'Lobby/Matchmaking Servers', value: 'status'},
                { name: 'Origin Logins', value: 'status', inline: true },
                { name: 'EA Accounts', value: 'status', inline: true },
                { name: 'Apex website', value: 'status', inline: true },
            )
	        .setTimestamp();

        console.log(response.data);
        //await interaction.reply(`Data from [apexlegendsstatus.com](https://apexlegendsstatus.com/)`);
        await interaction.reply({ embeds: [embed] });
	},
};