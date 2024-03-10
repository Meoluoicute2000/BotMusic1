const { ApplicationCommandOptionType } = require('discord.js');
const db = require("../mongoDB");

module.exports = {
    name: "owner",
    description: "Hiển thị thông tin về chủ sở hữu bot.",
    permissions: "0x0000000000000800",
    options: [],

    run: async (client, interaction) => {
        try {
            const discordServerLink = 'https://discord.gg/Na6FFYMPW6/';
            const blogspotLink = ' https://kidtomboy.blogspot.com/';
            const githubLink = 'https://github.com/@Meoluoicute2000';
            const githubbotLink = 'https://github.com/@Meoluoicute2000';
            const ownerDiscordLink = '@Kidtomboy Or Kidtomboy#1992';
            const idDiscordLink = '827533541113069609';

            const embed = {
                color: 0xda2a41,
                author: {
                    name: 'Thông tin chủ sở hữu.',
                    iconURL: 'https://media.discordapp.net/attachments/1122191086501249034/1144865884901486612/7054-neon-info-icon.gif',
                    url: 'https://discord.gg/Na6FFYMPW6/'
                },
                description:
                    `🍒 **Bot được tạo bởi Cherry^^!**\n\n` +
                    `🎀 [Vào Server của Cherry ngay](${discordServerLink})\n` +
                    `💦 [Đường link dẫn đến Blogspot](${blogspotLink})\n` +
                    `🚀 [Github chủ sở hữu bot](${githubLink})\n` +
                    `🐰 [Mã nguồn của bot ở đây^^](${githubbotLink})\n` +
                    `👤 **Chủ sở hữu:** [${ownerDiscordLink}]\n` +
                    `📧 **Liên hệ qua Discord bằng ID:** [${idDiscordLink}]`,
                footer: {
                    text: 'Made By Cherry'
                },
                timestamp: new Date(),
                thumbnail: {
                    url: interaction.user.displayAvatarURL({ dynamic: true, size: 64 })
                }
            };

            interaction.reply({ embeds: [embed] }).catch(e => console.error(e));

        } catch (error) {
            console.error(error);
        }
    },
};
