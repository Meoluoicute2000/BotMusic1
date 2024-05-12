const db = require("../mongoDB");
const { MessageEmbed } = require('discord.js');

module.exports = {
  name: "previous",
  description: "Phát lại bài hát trước đó.",
  permissions: "0x0000000000000800",
  options: [],
  voiceChannel: true,
  run: async (client, interaction) => {
    try {
      // Lấy hàng đợi phát nhạc của máy chủ từ client
      const queue = client.player.getQueue(interaction.guild.id);
      
      // Kiểm tra nếu không có hàng đợi hoặc không có bài hát nào đang phát
      if (!queue || !queue.playing) {
        return interaction.reply({ content: `⚠️ Không có bài hát nào đang phát !!`, ephemeral: true });
      }
      
      // Thử lấy bài hát trước đó từ hàng đợi
      try {
        const song = await queue.previous();
        
        // Tạo embed để hiển thị thông tin về bài hát trước đó
        const previousEmbed = new MessageEmbed()
          .setColor('#3498db')
          .setAuthor({
            name: 'Phát lại bài hát trước đó',
            iconURL: 'https://cdn.discordapp.com/attachments/1238866275363721226/1238866773873262722/previous.png?ex=6640d817&is=663f8697&hm=1ecd52c4e83b8faa67f05d0079530908133742c7e68d094d0659f0de362c7089&',
            url: 'https://discord.gg/Na6FFYMPW6'
          })
          .setDescription(`**Phát lại bài hát trước đó của bạn!**`)
          .setFooter('Made By Cherry')
          .setTimestamp();

        // Phản hồi với embed chứa thông tin về bài hát trước đó
        interaction.reply({ embeds: [previousEmbed] }).catch(console.error);
      } catch (e) {
        // Xử lý lỗi nếu không có bài hát trước đó
        return interaction.reply({ content: `❌ Không có bài hát trước đó!!`, ephemeral: true }).catch(console.error);
      }
    } catch (e) {
      // Xử lý lỗi nếu có và ghi log
      console.error('Có lỗi xảy ra khi thực hiện lệnh Previous:', e);
      // Phản hồi cho người dùng với thông báo lỗi
      interaction.reply({ content: '⚠️ Đã xảy ra lỗi khi thực hiện lệnh này!', ephemeral: true }).catch(console.error);
    }
  },
};
