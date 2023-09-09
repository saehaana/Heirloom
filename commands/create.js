const { Client, Intents, SlashCommandBuilder, MessageActionRow, MessageButton } = require('discord.js');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_CONTENT] });

const userTimes = {};
const globalUsernames = {};

const yesButton = new MessageButton().setCustomId('yes').setLabel('Yes').setStyle('SUCCESS');
const noButton = new MessageButton().setCustomId('no').setLabel('No').setStyle('DANGER');
const readyButton = new MessageButton().setCustomId('ready').setLabel('Ready').setStyle('PRIMARY');
const notReadyButton = new MessageButton().setCustomId('notReady').setLabel('Not Ready').setStyle('SECONDARY');

module.exports = {
    data: new SlashCommandBuilder().setName('create').setDescription('Let your friends know what game you want to play').addIntegerOption(option => option.setName('team-size').setDescription('The max number of players allowed').setRequired(true)).addRoleOption(option => option.setName('role').setDescription('Notify users of the role selected').setRequired(false)),

    async execute(interaction) {
        const embed = { color: 'GREEN', description: '**Queue**:' };
        const buttons = new MessageActionRow().addComponents(
            new MessageButton().setCustomId('join').setLabel('Join').setStyle('SUCCESS'), 
            new MessageButton().setCustomId('leave').setLabel('Leave').setStyle('DANGER'),
            readyButton,
            notReadyButton
        );

        const usernames = [];
        globalUsernames[interaction.id] = usernames;
        const teamSizeOption = interaction.options.getInteger('team-size');

        embed.description += `**Queue (${usernames.length} / ${teamSizeOption})**: \n ${usernames.join('\n')}`;
        await interaction.deferReply();
        const initialResponse = await interaction.editReply({ embeds: [embed], components: [buttons] });

        const roleOption = interaction.options.getRole('role');
        if (roleOption) await interaction.channel.send(`LFG ${roleOption}`);

        const filter = i => ['join', 'leave', 'ready', 'notReady'].includes(i.customId);
        const collector = initialResponse.createMessageComponentCollector({ filter, time: 14400000 });

        collector.on('collect', async i => {
            const userIndex = usernames.indexOf(i.user.username);
            switch (i.customId) {
                case 'join':
                    if (userIndex === -1) {
                        usernames.push(i.user.username);
                    }
                    break;
                case 'leave':
                    if (userIndex !== -1) {
                        usernames.splice(userIndex, 1);
                    }
                    break;
                case 'ready':
                    if (userIndex !== -1) {
                        usernames[userIndex] = `${i.user.username} ✅`;
                    }
                    break;
                case 'notReady':
                    if (userIndex !== -1) {
                        usernames[userIndex] = `${i.user.username} ❌`;
                    }
                    break;
            }

            embed.description = `**Queue (${usernames.length} / ${teamSizeOption})**: \n ${usernames.join('\n')}`;
            await i.update({ embeds: [embed], components: [buttons] });
            if (usernames.length === teamSizeOption) {
                const mentions = interaction.channel.members.filter(member => usernames.includes(member.user.username)).map(member => member.toString());
                const message = `${mentions.join(', ')}, join voice to start`;
                await interaction.channel.send(message);
                collector.stop();
            }
        });

        collector.on('end', () => {
            embed.title = '(Closed)';
            embed.color = 'RED';
            initialResponse.edit({ embeds: [embed], components: [] });

            globalUsernames[interaction.id].forEach(username => {
                const user = interaction.channel.members.find(member => member.user.username === username.split(' ')[0]);  // split to remove emoji
                if (user) delete userTimes[user.id];
            });

            delete globalUsernames[interaction.id];
        });
    }
};


setInterval(async () => {
    const currentTime = new Date();
    for (const [userId, userTime] of Object.entries(userTimes)) {
        const [hour, minute, period] = userTime.split(/[:\s]/);
        const chosenTime = new Date();
        chosenTime.setHours(period === "PM" ? parseInt(hour) + 12 : hour);
        chosenTime.setMinutes(minute);
        const timeDifference = Math.abs(currentTime - chosenTime);

        if (timeDifference <= 60000) {
            const user = await client.users.fetch(userId);
            user.send("Are you ready to play?", { components: [new MessageActionRow().addComponents(yesButton, noButton)] }).then(dmMessage => {
                const buttonCollector = dmMessage.createMessageComponentCollector({ time: 90000 });

                buttonCollector.on('collect', async i => {
                    if (i.customId === 'yes') {
                        usernames[usernames.indexOf(user.username)] = `${user.username} (Ready)`;
                    } else if (i.customId === 'no') {
                        const index = usernames.indexOf(user.username);
                        if (index !== -1) {
                            usernames.splice(index, 1);
                        }
                        delete userTimes[userId];
                    }
                    buttonCollector.stop();
                });

                buttonCollector.on('end', collected => {
                    if (!collected.size) {
                        const index = usernames.indexOf(user.username);
                        if (index !== -1) {
                            usernames.splice(index, 1);
                        }
                        delete userTimes[userId];
                    }
                });
            });
        }
    }
}, 60000);
