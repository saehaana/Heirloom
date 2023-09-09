const { SlashCommandBuilder, MessageActionRow, MessageButton } = require('discord.js');

const userTimes = {};
const globalUsernames = {};

const yesButton = new MessageButton()
    .setCustomId('yes')
    .setLabel('Yes')
    .setStyle('SUCCESS');

const noButton = new MessageButton()
    .setCustomId('no')
    .setLabel('No')
    .setStyle('DANGER');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create')
        .setDescription('Let your friends know what game you want to play')
        .addIntegerOption(option => option.setName('team-size').setDescription('The max number of players allowed').setRequired(true))
        .addRoleOption(option => option.setName('role').setDescription('Notify users of the role selected').setRequired(false))
        .addStringOption(option => option.setName('time').setDescription('Time you are available (HH:MM AM/PM)').setRequired(false)),

    async execute(interaction) {
        const embed = {
            color: 'GREEN',
            description: '**Queue**:',
        };

        const buttons = new MessageActionRow()
            .addComponents(new MessageButton().setCustomId('join').setLabel('Join').setStyle('SUCCESS'), new MessageButton().setCustomId('leave').setLabel('Leave').setStyle('DANGER'));

        const usernames = [];
        globalUsernames[interaction.id] = usernames;

        const titleOption = interaction.options.getString('title');
        const teamSizeOption = interaction.options.getInteger('team-size');

        if (titleOption) {
            embed.title = titleOption;
        }

        embed.description += `**Queue (${usernames.length} / ${teamSizeOption})**: \n ${usernames.join('\n')}`;

        await interaction.deferReply();
        const initialResponse = await interaction.editReply({ embeds: [embed], components: [buttons] });

        const guild = interaction.guild;
        const roleOption = interaction.options.getRole('role');
        if (roleOption) {
            if (titleOption) {
                await interaction.channel.send(`LFG ${roleOption} : ${titleOption}`);
            } else {
                await interaction.channel.send(`LFG ${roleOption}`);
            }
        }

        const filter = i => ['join', 'leave'].includes(i.customId);
        const collector = initialResponse.createMessageComponentCollector({ filter, time: 14400000 });

        collector.on('collect', async i => {
            if (i.customId === 'join') {
                if (!usernames.includes(i.user.username)) {
                    usernames.push(i.user.username);
                    await i.user.send("What time will you be ready? (HH:MM AM/PM)").then(dmMessage => {
                        const msgCollector = dmMessage.channel.createMessageCollector({ time: 60000 });
                        msgCollector.on('collect', msg => {
                            userTimes[i.user.id] = msg.content;
                            usernames[usernames.indexOf(i.user.username)] = `${i.user.username} (${msg.content})`;
                            msgCollector.stop();
                        });
                    });
                }
            } else if (i.customId === 'leave') {
                const index = usernames.indexOf(i.user.username);
                if (index !== -1) {
                    usernames.splice(index, 1);
                }
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

        collector.on('end', collected => {
            embed.title = '(Closed)';
            embed.color = 'RED';
            initialResponse.edit({ embeds: [embed], components: [] });

            globalUsernames[interaction.id].forEach(username => {
                const user = interaction.channel.members.find(member => member.user.username === username);
                if (user) {
                    delete userTimes[user.id];
                }
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
