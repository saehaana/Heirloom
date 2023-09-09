const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const userTimes = {}; 
const userStatus = {}; 
const globalUsernames = {}; 

const yesButton = new ButtonBuilder()
    .setCustomId('yes')
    .setLabel('Yes')
    .setStyle(ButtonStyle.Success);

const noButton = new ButtonBuilder()
    .setCustomId('no')
    .setLabel('No')
    .setStyle(ButtonStyle.Danger);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create')
        .setDescription('Let your friends know what game you want to play')
        .addIntegerOption(option => 
            option.setName('team-size')
            .setDescription('The max number of players allowed')
            .setRequired(true))
        .addRoleOption(option =>
            option.setName('role')
            .setDescription('Notify users of the role selected')
            .setRequired(false))
        .addStringOption(option =>
            option.setName('time')
            .setDescription('Time you are available (HH:MM AM/PM)')
            .setRequired(true)),

    async execute(interaction) {
        // ... [rest of the code remains unchanged]

        collector.on('end', async collected => {
            embed.setTitle('(Closed)').setColor('Red');
            await initialResponse.edit({ embeds: [embed], components: [] });
            globalUsernames[interaction.id].forEach(username => {
                const pureName = username.split(' ')[0];
                const user = interaction.channel.members.find(member => member.user.username === pureName);
                if (user) {
                    delete userTimes[user.id];
                    delete userStatus[user.id];
                }
            });
            delete globalUsernames[interaction.id];
        });
    }
};

setInterval(async () => {
    const currentTime = new Date();
    for (const [userId, userTime] of Object.entries(userTimes)) {
        const chosenTime = new Date(`1970-01-01 ${userTime}`);
        const timeDifference = Math.abs(currentTime - chosenTime);
        if (timeDifference <= 60000) {
            const user = await interaction.client.users.fetch(userId);
            user.send("Are you ready to play?", { components: [new ActionRowBuilder().addComponents(yesButton, noButton)] })
            .then(dmMessage => {
                const buttonFilter = (i) => i.user.id === userId;
                const buttonCollector = dmMessage.createMessageComponentCollector({ filter: buttonFilter, time: 90000 });
                buttonCollector.on('collect', async i => {
                    if (i.customId === 'yes') {
                        userStatus[userId] = 'Ready';
                        const index = usernames.indexOf(user.username + ` (${timeOption})`);
                        if (index !== -1) {
                            usernames[index] = user.username + ' (Ready)';
                        }
                        await i.update({ content: "You're marked as ready!" });
                    } else if (i.customId === 'no') {
                        const index = usernames.indexOf(user.username + ` (${timeOption})`);
                        if (index !== -1) {
                            usernames.splice(index, 1);
                        }
                        delete userTimes[userId];
                        await i.update({ content: "You've been removed from the queue." });
                    }
                });

                buttonCollector.on('end', collected => {
                    if (!collected.size) {
                        const index = usernames.indexOf(user.username + ` (${timeOption})`);
                        if (index !== -1) {
                            usernames.splice(index, 1);
                        }
                        delete userTimes[userId];
                        user.send("You've been automatically removed from the queue due to inactivity.");
                    }
                });
            }).catch(error => {
                console.error('Could not send DM to user:', error);
            });
        }
    }
}, 60000);
