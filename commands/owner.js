const { EmbedBuilder } = require('discord.js');
const db = require("../mongoDB");

module.exports = {
    name: "owner", 
    description: "Hiển thị thông tin về chủ sở hữu bot.", 
    permissions: "0x0000000000000800", 
    options: [], 

    run: async (client, interaction) => {
        try {
            // Khai báo các đường link liên quan
            const discordServerLink = 'https://discord.gg/Na6FFYMPW6/';
            const blogspotLink = 'https://kidtomboy.blogspot.com/';
            const githubLink = 'https://github.com/@Meoluoicute2000';
            const githubbotLink = 'https://github.com/@Meoluoicute2000';

            // Tạo Embed để hiển thị thông tin chủ sở hữu
            const embed = new EmbedBuilder()
                .setColor(0xda2a41)
                .setAuthor({
                    name: 'Thông tin chủ sở hữu.', 
                    iconURL: 'https://cdn.discordapp.com/attachments/1238871099027230782/1238871439214641172/owner.png?ex=6640dc70&is=663f8af0&hm=cf1c4751a1e65087c5d2df07417d72554a7cb4a967e05c48fd731b91c5fbbea0&', 
                    url: 'https://discord.gg/Na6FFYMPW6/' 
                })
                .setDescription(
                    `🍒 **Bot được tạo bởi Cherry^^!**\n\n` + 
                    `## 🎀 [Vào Server của Cherry ngay](${discordServerLink})\n` + 
                    `## 💦 [Đường link dẫn đến Blogspot](${blogspotLink})\n` + 
                    `## 🚀 [Github chủ sở hữu bot](${githubLink})\n` + 
                    `## 🐰 [Mã nguồn của bot ở đây^^](${githubbotLink})\n` + 
                    `## 👑 *Chủ sở hữu: @Kidtomboy#1992*\n` 
                )
                .setFooter({ text: 'Made By Cherry' }) 
                .setTimestamp() // Thời điểm tạo Embed
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true, size: 64 })); 

            // Phản hồi với Embed chứa thông tin chủ sở hữu
            interaction.reply({ embeds: [embed] }).catch(e => console.error(e));

        } catch (error) {
            // Xử lý lỗi nếu có và ghi log
            console.error('Có lỗi xảy ra khi thực hiện lệnh Owner:', error);
            // Phản hồi cho người dùng với thông báo lỗi
            interaction.reply({ content: '⚠️ Đã xảy ra lỗi khi thực hiện lệnh!', ephemeral: true }).catch(console.error);
        }
    },
};
