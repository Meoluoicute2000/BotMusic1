const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const maxVol = require("../config.js").opt.maxVol;
const db = require("../mongoDB");

module.exports = {
  name: "volume",
  description: "Cho phép bạn điều chỉnh âm lượng nhạc - Mặc định: 50.",
  permissions: "0x0000000000000800",
  options: [{
    name: 'volume',
    description: 'Nhập số để điều chỉnh âm lượng.',
    type: ApplicationCommandOptionType.Integer,
    required: true
  }],
  voiceChannel: true,
  run: async (client, interaction) => {
    try {
      const queue = client.player.getQueue(interaction.guild.id);
      if (!queue || !queue.playing) {
        return interaction.reply({ content: '⚠️ Không có bài hát nào đang phát!!', ephemeral: true });
      }

      const vol = parseInt(interaction.options.getInteger('volume'));

      if (!vol) {
        return interaction.reply({
          content: `Âm lượng hiện tại : **${queue.volume}** 🔊\nĐể thay đổi âm lượng, hãy nhập một số ở giữa \`1\` và \`${maxVol}\`.`,
          ephemeral: true
        });
      }

      if (queue.volume === vol) {
        return interaction.reply({ content: 'Âm lượng hiện tại đã được đặt thành **' + vol + '**!', ephemeral: true });
      }

      if (vol < 1 || vol > maxVol) {
        return interaction.reply({
          content: `Vui lòng nhập một số giữa \`1\` và \`${maxVol}\`.`,
          ephemeral: true
        });
      }

      const success = queue.setVolume(vol);

      if (success) {
        const embed = new EmbedBuilder()
          .setColor('#d291fe')
          .setAuthor({
        name: 'Âm nhạc của bạn',
        iconURL: 'https://cdn.discordapp.com/attachments/1156866389819281418/1157528025739563088/5657-volume-icon.png', 
        url: 'https://discord.gg/Na6FFYMPW6'
    })
          .setDescription(`**Điều chỉnh âm lượng : ** **${vol}/${maxVol}**`)
          .setFooter({ text: 'Made By Cherry' })
          .setTimestamp();

        return interaction.reply({ embeds: [embed] });
      } else {
        return interaction.reply({ content: '❌ Đã xảy ra lỗi khi thay đổi âm lượng.', ephemeral: true });
      }
    } catch (e) {
      console.error(e);
    }
  },
};
