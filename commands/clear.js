const db = require("../mongoDB");
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: "clear",
  description: "Xóa hàng đợi âm nhạc.",
  permissions: "0x0000000000000800",
  options: [],
  voiceChannel: true,
  run: async (client, interaction) => {
    try {
      const queue = client.player.getQueue(interaction.guild.id);

      // Kiểm tra xem có hàng đợi và có bài hát nào đang phát không
      if (!queue || !queue.playing) {
        // Nếu không có bài hát đang phát, phản hồi với thông báo và kết thúc
        return interaction.reply({ content: '⚠️ Không có bài hát nào đang phát !!', ephemeral: true });
      }

      // Kiểm tra xem hàng đợi có bài hát không
      if (!queue.songs[0]) {
        // Nếu hàng đợi trống, phản hồi với thông báo và kết thúc
        return interaction.reply({ content: '❌ Hàng đợi đang trống!', ephemeral: true });
      }

      // Dừng phát nhạc và xóa hàng đợi
      await queue.stop(interaction.guild.id);

      // Tạo Embed để thông báo đã xóa hàng đợi
      const embed = new EmbedBuilder()
        .setColor('#3498db')
        .setAuthor({
          name: 'Danh sách đã xóa',
          iconURL: 'https://cdn.discordapp.com/attachments/1238866275363721226/1238867438695743508/clear.png?ex=6640d8b6&is=663f8736&hm=13cab8a09cf8bcf74edb97bc703b65a2c8575144c1633dece228d9c0187a8a4f&',
          url: 'https://discord.gg/Na6FFYMPW6'
        })
        .setDescription('**Đã xóa hàng đợi!**')
        .setFooter({ text: 'Made By Cherry' })
        .setTimestamp();

      // Phản hồi với Embed thông báo đã xóa hàng đợi
      interaction.reply({ embeds: [embed] });
    } catch (error) {
      // Xử lý lỗi nếu có và ghi log
      console.error('Có lỗi xảy ra khi thực hiện lệnh Clear:', error);
      // Phản hồi cho người dùng với thông báo lỗi
      interaction.reply({ content: '⚠️ Đã có lỗi xảy ra khi thực hiện lệnh này!', ephemeral: true }).catch(console.error);
    }
  },
};
