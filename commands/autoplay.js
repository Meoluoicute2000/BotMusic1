const db = require("../mongoDB");
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: "autoplay",
  description: "Chuyển đổi tự động phát của hàng đợi.",
  options: [],
  permissions: "0x0000000000000800",
  run: async (client, interaction) => {
    try {
      const queue = client?.player?.getQueue(interaction?.guild?.id);
      if (!queue || !queue?.playing) {
        return interaction?.reply({ content: '⚠️ Không có bài hát nào đang phát !!', ephemeral: true });
      }

      queue?.toggleAutoplay();

      const embed = new EmbedBuilder()
        .setColor('#2f58fe')
        .setTitle('Tự động phát nhạc dựa theo đề xuất!')
        .setDescription(queue?.autoplay ? '**✅ Autoplay Bật**' : '**❌ Autoplay Tắt**')
        .setFooter({ text: 'Made By Cherry' })
        .setTimestamp();

      interaction?.reply({ embeds: [embed] });
    } catch (e) {
      console.error(e);
    }
  },
};
