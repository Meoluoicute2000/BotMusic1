const db = require("../mongoDB");
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: "stop",
  description: "Dừng phát bài hát ngay lập tức.",
  permissions: "0x0000000000000800",
  options: [],
  voiceChannel: true,
  run: async (client, interaction) => {
    try {
      // Lấy hàng đợi phát nhạc của máy chủ từ client
      const queue = client.player.getQueue(interaction.guild.id);

      // Kiểm tra nếu không có hàng đợi hoặc không có bài hát nào đang phát
      if (!queue || !queue.playing) {
        return interaction.reply({ content: '⚠️ Không có bài hát nào đang phát !!', ephemeral: true });
      }

      // Dừng phát nhạc
      queue.stop(interaction.guild.id);

      // Tạo Embed để thông báo đã dừng nhạc
      const embed = new EmbedBuilder()
        .setColor('#f1002c')
        .setAuthor({
          name: 'Đã dừng nhạc',
          iconURL: 'https://cdn.discordapp.com/attachments/1238866275363721226/1238866713861423175/pause-button.png?ex=6640d809&is=663f8689&hm=1e5ba71dab1922b2417e3c42ea69b2b9abf2e0a93be31907f678fcf292407519&',
          url: 'https://discord.gg/Na6FFYMPW6'
        })
        .setDescription('**Đã dừng nhạc.**')
        .setFooter({ text: 'Made By Cherry' })
        .setTimestamp();

      // Phản hồi với Embed
      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      // Xử lý lỗi nếu có và ghi log
      console.error('Có lỗi xảy ra khi thực hiện lệnh Stop:', error);
      // Phản hồi cho người dùng với thông báo lỗi
      interaction.reply({ content: '⚠️ Đã xảy ra lỗi khi thực hiện lệnh này!', ephemeral: true }).catch(console.error);
    }
  },
};
