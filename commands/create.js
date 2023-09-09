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
        const embed = new EmbedBuilder().setColor('Green').setDescription('**Queue**:');
        const buttons = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('join').setLabel('Join').setStyle(ButtonStyle.Success), new ButtonBuilder().setCustomId('leave').setLabel('Leave').setStyle(ButtonStyle.Danger));
        const usernames = [];
        globalUsernames[interaction.id] = usernames;
        const titleOption = interaction.options.getString('title');
        const teamSizeOption = interaction.options.getInteger('team-size');
        const timeOption = interaction.options.getString('time');
        await interaction.deferReply();
        const initialResponse = await interaction.editReply({ embeds: [embed], components: [buttons] });
        const roleOption = interaction.options.getRole('role');
        if(roleOption) {
            const roleId = roleOption.id;
            if(titleOption) {
                await interaction.channel.send(`<@&${roleId}> LFG: ${titleOption}`);
            } else {
                await interaction.channel.send(`<@&${roleId}> LFG`);
            }
        }
        const filter = (i) => i.customId === 'join' || i.customId === 'leave';
        const collector = initialResponse.createMessageComponentCollector({ filter, time: 14400000 });
        collector.on('collect', async i => {  
            const hasJoined = usernames.some(u => u.startsWith(i.user.username));
            if (i.customId === 'join' && !hasJoined) {
                usernames.push(i.user.username + ` (${timeOption})`);
                userTimes[i.user.id] = timeOption;
                userStatus[i.user.id] = 'Pending';
                embed.setDescription(`**Queue (${usernames.length} / ${teamSizeOption})**: \n ${usernames.join('\n')}`);
            } else if (i.customId === 'leave' && hasJoined) {
                const index = usernames.indexOf(i.user.username + ` (${timeOption})`);
                if (index !== -1) {
                    usernames.splice(index, 1);
                }
                embed.setDescription(`**Queue (${usernames.length} / ${teamSizeOption})**: \n ${usernames.join('\n')}`);
            }
            await i.update({ embeds: [embed], components: [buttons] });
            if(usernames.length === teamSizeOption) {
                const mentions = interaction.channel.members
                    .filter(member => usernames.includes(member.user.username))
                    .map(member => member.toString());
                const message = `${mentions.join(', ')}, join voice to start`;
                await interaction.channel.send(message);
                collector.stop();
            }
        });
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
                const buttonCollector = dmMessage.createMessageComponentCollector({ filter: buttonFilter, time: 60000 });
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
            }).catch(error => {
                console.error('Could not send DM to user:', error);
            });
        }
    }
}, 60000);
