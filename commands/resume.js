const db = require("../mongoDB");
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: "resume",
  description: "Bắt đầu âm nhạc bị tạm dừng.",
  permissions: "0x0000000000000800",
  options: [],
  voiceChannel: true,
  run: async (client, interaction) => {
    const queue = client.player.getQueue(interaction.guild.id);

    try {
      if (!queue) {
        return interaction.reply({ content: '⚠️ Hàng đợi đang trống!!', ephemeral: true });
      }

      if (!queue.paused) {
        return interaction.reply({ content: '⚠️ Bài hát không thể tạm dừng!!', ephemeral: true });
      }

      const success = queue.resume();

      const embed = new EmbedBuilder()
        .setColor('#7645fe')
        .setAuthor({
          name: 'Bài hát đã được tiếp tục',
          iconURL: 'https://cdn.discordapp.com/attachments/1156866389819281418/1157296313549983846/8929-purple-play-icon.png',
          url: 'https://discord.gg/Na6FFYMPW6'
        })
        .setDescription(success ? '**Đã tiếp tục phát nhạc !!**' : '❌ Lỗi: Không thể tiếp tục bài hát')
        .setFooter({ text: 'Made By Cherry' })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    } catch (e) {
      console.error(e);
    }
  },
};
