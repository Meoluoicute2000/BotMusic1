const { EmbedBuilder } = require('discord.js');
const db = require("../mongoDB");

module.exports = {
  name: "time",
  description: "Hiển thị thời gian đang phát của bài hát.",
  permissions: "0x0000000000000800",
  options: [],
  run: async (client, interaction) => {
    try {
      const queue = client.player.getQueue(interaction.guild.id);

      if (!queue || !queue.playing || !queue.songs.length) {
        return interaction.reply({ content: '⚠️ Không có bài hát nào đang phát !!', ephemeral: true }).catch(console.error);
      }

      const progressBarLength = 15;

      const message = await interaction.reply({ content: 'Đang tải thời gian thực của bài hát...', ephemeral: false });

      const updateInterval = 1000;
      const progressBarUpdate = setInterval(async () => {
        if (!queue.duration || isNaN(queue.duration) || !queue.currentTime || isNaN(queue.currentTime)) {
          clearInterval(progressBarUpdate);
          return;
        }

        const music_percent = queue.duration / 100;
        const music_percent2 = queue.currentTime / music_percent;
        const music_percent3 = Math.round(music_percent2);

        if (queue.currentTime > queue.duration) {
          await message.delete().catch(console.error);
          clearInterval(progressBarUpdate);
        }

        const progressBar = createProgressBar(music_percent3, progressBarLength);

        const embed = new EmbedBuilder()
          .setColor(client.config.embedColor)
          .setTitle(queue.playing ? queue.songs[0].name : 'Không có bài hát đang phát')
          .setThumbnail(queue.songs[0].thumbnail)
          .setFooter({ text: 'Made By Cherry' })
          .setDescription(`**「${queue.formattedCurrentTime} | 🍒 | ${queue.formattedDuration}」**\n${progressBar}`)
          .setTimestamp();

          await message.edit({ embeds: [embed] }).catch(error => {
          });
      }, updateInterval);

      if (!queue.playing) {
        await message.delete().catch(console.error);
        clearInterval(progressBarUpdate);
      }
    } catch (e) {
      console.error(e);
    }
  },
};

function createProgressBar(percent, length) {
  if (!percent || isNaN(percent)) {
    percent = 0;
  }

  const progressChars = '▬';
  const emptyChars = '─';
  const progressLength = Math.round((percent / 100) * length);

  const progressBar = progressChars.repeat(progressLength) + emptyChars.repeat(length - progressLength);
  return `[${progressBar}] ${percent}%`;
}
