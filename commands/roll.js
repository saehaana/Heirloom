const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('roll')
		.setDescription('Roll the dice')
        .addIntegerOption(option => 
            option.setName('max')
            .setDescription('Highest possible number')
            .setRequired(false)),
	async execute(interaction) {
        // Get user who typed command
        const user = interaction.member.nickname;
        // Get input from optional command
        const flagMax = interaction.options.getInteger('max');

        // Generate random number for dice roll
        // Default roll range will be between 0 and 100 unless specified by optional command
        if(flagMax !== null){ 
            roll = Math.floor(Math.random() * flagMax) + 1; // +1 to include highest number
        }else{
            roll = Math.floor(Math.random() * 100) + 1; 
        }
        
        // Print user and generated number
        interaction.reply(user + " rolled " + roll);
	},
};  