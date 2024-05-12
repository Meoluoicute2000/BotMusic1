const db = require("../mongoDB");
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: "resume",
  description: "Bắt đầu âm nhạc đang bị tạm dừng.",
  permissions: "0x0000000000000800",
  options: [],
  voiceChannel: true,
  run: async (client, interaction) => {
    
    // Lấy hàng đợi phát nhạc của máy chủ từ client
    const queue = client.player.getQueue(interaction.guild.id);

    try {
      // Kiểm tra nếu hàng đợi trống
      if (!queue) {
        return interaction.reply({ content: '⚠️ Hàng đợi đang trống!!', ephemeral: true });
      }

      // Kiểm tra nếu bài hát không được tạm dừng
      if (!queue.paused) {
        return interaction.reply({ content: '⚠️ Bài hát không thể tạm dừng!!', ephemeral: true });
      }

      // Tiếp tục phát nhạc
      const success = queue.resume();

      // Tạo embed thông báo kết quả
      const embed = new EmbedBuilder()
        .setColor('#7645fe')
        .setAuthor({
          name: 'Bài hát đã được tiếp tục phát',
          iconURL: 'https://cdn.discordapp.com/attachments/1238866275363721226/1238866505786200074/play-button.png?ex=6640d7d8&is=663f8658&hm=e5ffdd081024c0cac99ab17b9fc36479a6b0e7d5a44912dc557930ac78f6e7bd&',
          url: 'https://discord.gg/Na6FFYMPW6'
        })
        .setDescription(success ? '**Đã tiếp tục phát nhạc !!**' : '❌ Lỗi: Không thể tiếp tục bài hát')
        .setFooter({ text: 'Made By Cherry' })
        .setTimestamp();

      // Phản hồi với embed
      return interaction.reply({ embeds: [embed] });
    } catch (e) {
      // Xử lý lỗi nếu có và ghi log
      console.error('Có lỗi xảy ra khi thực hiện lệnh Resume:', error);
      // Phản hồi cho người dùng với thông báo lỗi
      interaction.reply({ content: '⚠️ Đã xảy ra lỗi khi thực hiện lệnh này!', ephemeral: true }).catch(console.error);
    }
  },
};
