const { ApplicationCommandOptionType } = require('discord.js');
const db = require("../mongoDB");

module.exports = {
  name: "seek",
  description: "Chuyển thời gian phát đến.",
  permissions: "0x0000000000000800",
  options: [{
    name: "time",
    description: "Nhập timestamp. Ví dụ : 05:10.",
    type: ApplicationCommandOptionType.String,
    required: true
  }],
  voiceChannel: true,
  run: async (client, interaction) => {
    try {
      const queue = client.player.getQueue(interaction.guild.id);

      if (!queue || !queue.playing) {
        return interaction.reply({ content: `⚠️ Không có bài hát nào đang phát !!` }).catch(console.error);
      }

      const timeString = interaction.options.getString("time");
      const position = getSeconds(timeString);

      if (isNaN(position) || position < 0) {
        return interaction.reply({ content: `Thời gian không hợp lệ!` }).catch(console.error);
      }

      queue.seek(position);
      const timeEmbed = `▶️ *Đã tua bài hát đến* **${timeString}**. *Nghe nhạc vui vẻ^^🍒*\n \n**● Made By Cherry**`;
      interaction.reply({ content: timeEmbed, footer: 'Made By Cherry', timestamp: true }).catch(console.error);
    } catch (e) {
      console.error(e);
    }
  },
};

function getSeconds(str) {
  if (!str) {
    return 0;
  }

  const parts = str.split(':');
  let seconds = 0;
  let multiplier = 1;

  while (parts.length > 0) {
    seconds += multiplier * parseInt(parts.pop(), 10);
    multiplier *= 60;
  }

  return seconds;
}
