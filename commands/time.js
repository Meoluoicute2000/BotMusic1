const { EmbedBuilder } = require('discord.js');
const db = require("../mongoDB");

module.exports = {
  name: "time",
  description: "Hiển thị thời gian đang phát của bài hát.",
  permissions: "0x0000000000000800",
  options: [],
  run: async (client, interaction) => {
    try {
      // Lấy hàng đợi phát nhạc của máy chủ từ client
      const queue = client.player.getQueue(interaction.guild.id);

      // Kiểm tra nếu không có hàng đợi hoặc không có bài hát nào đang phát hoặc hàng đợi trống
      if (!queue || !queue.playing || !queue.songs.length) {
        return interaction.reply({ content: '⚠️ Không có bài hát nào đang phát !!', ephemeral: true }).catch(console.error);
      }

      // Lấy thông tin của bài hát đang phát
      const currentSong = queue.songs[0];

      // Độ dài của thanh tiến trình
      const progressBarLength = 15;

      // Gửi tin nhắn và lưu lại để cập nhật
      let message = await interaction.reply({ content: 'Đang tải thời gian thực của bài hát...', ephemeral: false });

      // Cập nhật thanh tiến trình
      const updateInterval = 1000;
      const progressBarUpdate = setInterval(async () => {
        // Kiểm tra nếu không có bài hát nào trong hàng đợi
        if (!currentSong) {
          clearInterval(progressBarUpdate);
          return message.edit({ content: '⚠️ Không có bài hát nào đang phát !!', embeds: [] }).catch(console.error);
        }

        // Tính toán phần trăm tiến trình của bài hát
        const music_percent = currentSong.duration / 100;
        const music_percent2 = queue.currentTime / music_percent;
        const music_percent3 = Math.round(music_percent2);

        // Kiểm tra nếu đã phát hết bài hát
        if (queue.currentTime > currentSong.duration) {
          clearInterval(progressBarUpdate);
          return;
        }

        // Tạo thanh tiến trình
        const progressBar = createProgressBar(music_percent3, progressBarLength);

        // Tạo Embed mới để hiển thị thông tin thời gian phát
        const embed = new EmbedBuilder()
          .setColor(client.config.embedColor)
          .setTitle(currentSong.name)
          .setThumbnail(currentSong.thumbnail || 'URL_MẶC_ĐỊNH')
          .setDescription(`**${queue.playing ? '🎵' : '⏸️'} 「${formatTime(queue.currentTime)} | ${formatTime(currentSong.duration)}」**\n${progressBar}`)
          .setFooter({ text: 'Made By Cherry' })
          .setTimestamp();

        // Nếu có tin nhắn trước đó, cập nhật nó với Embed mới
        if (message) {
          message = await message.edit({ embeds: [embed] }).catch(console.error);
        }

      }, updateInterval);

    } catch (error) {
      // Xử lý lỗi nếu có và ghi log
      console.error('Có lỗi xảy ra khi thực hiện lệnh Time:', error);
      // Phản hồi cho người dùng với thông báo lỗi
      interaction.reply({ content: '⚠️ Đã có lỗi xảy ra khi thực hiện lệnh này!', ephemeral: true }).catch(console.error);
    }
  },
};

// Hàm tạo thanh tiến trình
function createProgressBar(percent, length) {
  if (!percent || isNaN(percent)) {
    percent = 0;
  }

  const progressChars = '▬';
  const emptyChars = '·';
  const progressLength = Math.round((percent / 100) * length);

  const progressBar = progressChars.repeat(progressLength) + emptyChars.repeat(length - progressLength);
  return `[${progressBar}] ${percent}%`;
}

// Hàm định dạng thời gian
function formatTime(time) {
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = Math.floor(time % 60);

  const formattedHours = hours.toString().padStart(2, '0');
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = seconds.toString().padStart(2, '0');

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}