const { EmbedBuilder } = require('discord.js');
const db = require("../mongoDB");

module.exports = {
  name: "nowplaying", 
  description: "Lấy thông tin bài hát đang phát.", 
  permissions: "0x0000000000000800", 
  options: [], 


  run: async (client, interaction) => {
    try {
      // Lấy thông tin hàng đợi phát nhạc của máy chủ từ client
      const queue = client.player.getQueue(interaction.guild.id);

      // Kiểm tra xem có hàng đợi và có bài hát nào đang phát không
      if (!queue || !queue.playing) {
        // Nếu không có bài hát đang phát, phản hồi với thông báo và kết thúc
        return interaction.reply({ content: `⚠️ Không có bài hát nào đang phát !!`, ephemeral: true }).catch(console.error);
      }

      // Lấy thông tin bài hát đang phát
      const track = queue.songs[0];

      // Kiểm tra xem bài hát có tồn tại không
      if (!track) {
        // Nếu không có bài hát nào đang phát, phản hồi với thông báo và kết thúc
        return interaction.reply({ content: `⚠️ Không có bài hát nào đang phát !!`, ephemeral: true }).catch(console.error);
      }

      // Tạo Embed để hiển thị thông tin bài hát
      const embed = new EmbedBuilder();
      embed.setColor(client.config.embedColor);
      embed.setThumbnail(track.thumbnail);
      embed.setTitle(track.name);
      embed.setFooter({ text: 'Made By Cherry' });
      embed.setTimestamp();
      embed.setDescription(`> **Âm thanh** \`%${queue.volume}\`
> **Độ dài :** \`${track.formattedDuration}\`
> **URL bài hát :** **${track.url}**
> **Lặp lại :** \`${queue.repeatMode ? (queue.repeatMode === 2 ? 'Tất cả hàng đợi' : 'Bài hát này') : 'Off'}\`
> **Bộ lọc bài hát**: \`${queue.filters.names.join(', ') || 'Off'}\`
> **Bài hát Request bởi :** <@${track.user.id}>`);

      // Phản hồi với Embed chứa thông tin bài hát đang phát
      interaction.reply({ embeds: [embed] }).catch(console.error);
    } catch (error) {
      // Xử lý lỗi nếu có và ghi log
      console.error('Có lỗi xảy ra khi thực hiện lệnh Nowplaying:', error); 
      // Phản hồi cho người dùng với thông báo lỗi
      interaction.reply({ content: '⚠️ Đã xảy ra lỗi khi thực hiện lệnh này!', ephemeral: true }).catch(console.error);
    }
  },
};
