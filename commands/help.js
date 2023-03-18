const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Use if you need help navigating the bot'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle('Help')
        .setDescription(
        '**Documentation**\n'+
        'To view more commands type `/` and click on my icon to the left. Check out the full documentation [here](https://github.com/saehaana/Apex-Bot).\n\n'+
        '**Support**\n'+
        'Donations accepted by [Paypal](https://www.paypal.com/donate/?business=LDJMPJV8ER25G&no_recurring=0&item_name=By+donating+you+help+support+the+bot%27s+uptime%21&currency_code=USD)\n\n'+
        '**Report a Bug**\n'+
        'Send me a DM at osutin#5152 or use /reportbug')

        interaction.reply({ embeds: [embed] });
    },
}; 