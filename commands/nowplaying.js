const { EmbedBuilder } = require('discord.js');
const db = require("../mongoDB");

module.exports = {
  name: "nowplaying",
  description: "Lấy thông tin bài hát đang phát.",
  permissions: "0x0000000000000800",
  options: [],
  run: async (client, interaction) => {
    try {
      const queue = client.player.getQueue(interaction.guild.id);
      if (!queue || !queue.playing) return interaction.reply({ content: `⚠️ Không có bài hát nào đang phát !!`, ephemeral: true }).catch(e => {});

      const track = queue.songs[0];
      if (!track) return interaction.reply({ content: `⚠️ Không có bài hát nào đang phát !!`, ephemeral: true }).catch(e => {});

      const embed = new EmbedBuilder();
      embed.setColor(client.config.embedColor);
      embed.setThumbnail(track.thumbnail);
      embed.setTitle(track.name);
      embed.setFooter({ text: 'Made By Cherry' });
      embed.setTimestamp();
      embed.setDescription(`> **Âm thanh** \`%${queue.volume}\`
> **Độ dài :** \`${track.formattedDuration}\`
> **URL :** **${track.url}**
> **Lặp lại :** \`${queue.repeatMode ? (queue.repeatMode === 2 ? 'Tất cả hàng đợi' : 'Bài hát này') : 'Off'}\`
> **Bộ lọc**: \`${queue.filters.names.join(', ') || 'Off'}\`
> **Request bởi :** <@${track.user.id}>
> **Made By Cherry - Do Not Copy**`);

      interaction.reply({ embeds: [embed] }).catch(e => {});
    } catch (e) {
      console.error(e); 
    }
  },
};
