const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('heirloom')
		.setDescription('Keeps track of how close you are to your heirloom')
		.addBooleanOption(option => 
			option.setName('setup')
			.setDescription('Guides you through the process for tracking your Apex packs')
			.setRequired(false))
		.addStringOption(option => 
			option.setName('edit')
			.setDescription('Change a previously submitted value')
			.setRequired(false))
		.addIntegerOption(option => 
			option.setName('count')
			.setDescription('Show your total Apex packs collected')
			.setRequired(false)),
	async execute(interaction) {
		const initialEmbed = new EmbedBuilder()
		.setColor('Blue')
		.setTitle('Apex Pack Tracker')
		.setDescription('There is currently no automatic way to track Apex packs. ' + 
		'To track your total packs collected click next and input values for each event.')

		// Row of buttons that lets users view each question
        const buttons = new ActionRowBuilder()
        .addComponents( 
            // Create button to go back to previous question
            new ButtonBuilder()
                .setCustomId('previous')
                .setLabel(`Previous`)
                .setStyle(ButtonStyle.Primary),
            // Create button to go to next question
            new ButtonBuilder()
                .setCustomId('next')
                .setLabel(`Next`)
                .setStyle(ButtonStyle.Primary)
        );

        const initialResponse = await interaction.reply({ embeds: [initialEmbed], components: [buttons] });

        const setupOption = interaction.options.getBoolean('setup');
        const editOption = interaction.options.getString('edit');
        const countOption = interaction.options.getString('count');

        // Questions the user on their Apex packs collected during certain events
        const allQuestions = [];
        allQuestions.push(initialEmbed);

        const eventQuestions = ['Season 1 Battlepass', 'Season 2 Battlepass', 'Season 2 Iron Crown'];
        const answers = [];

        for(const question in eventQuestions){
            const questionEmbed = new EmbedBuilder()
            .setColor('Blue')
            .setTitle(`${eventQuestions[question]}`)

            allQuestions.push(questionEmbed);
        }

        // Create a message component collector to listen for button clicks
        const filterClicks = (i) => i.customId === 'next' || i.customId === 'previous';
        const collectClicks = initialResponse.createMessageComponentCollector({ filterClicks, time: 60000 });

        // Listen for messages sent by the user of the command 
        const filterAnswers = (m) => m.author.id === interaction.author.id; 
        const collectAnswers = initialResponse.createMessageComponentCollector({ filterAnswers, time: 60000 });

        let embedIndex = 0;
        collectClicks.on('collect', async interaction => {  
            // Update embed index based off which button was clicked
            if(interaction.customId === 'next'){
                // Do nothing when next is clicked if the last embed is in view
                if(embedIndex + 1 >= allQuestions.length){
                    await interaction.deferUpdate();
                }else{
                    embedIndex++;
                    // Update the message with the previous embed
                    await interaction.update({ embeds: [allQuestions[embedIndex]], components: [buttons] });
                }
            }
            else if(interaction.customId === 'previous'){
                // Do nothing when previous is clicked if the first embed is in view
                if(embedIndex - 1 < 0){
                    await interaction.deferUpdate();
                }else if(!(embedIndex - 1 < 0)){
                    embedIndex--;
                    // Update the message with the next embed
                    await interaction.update({ embeds: [allQuestions[embedIndex]], components: [buttons] });
                }
            }
        });
	},
}; 
