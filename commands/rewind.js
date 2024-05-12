const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const db = require("../mongoDB");

module.exports = {
  name: "rewind",
  description: "Tua đoạn nhạc đến thời gian cụ thể.",
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
      // Lấy hàng đợi phát nhạc của máy chủ từ client
      const queue = client.player.getQueue(interaction.guild.id);

      // Kiểm tra nếu không có hàng đợi hoặc không có bài hát nào đang phát
      if (!queue || !queue.playing) {
        return interaction.reply({ content: `⚠️ Không có bài hát nào đang phát !!` }).catch(console.error);
      }

      // Lấy thời gian từ input của người dùng
      const timeString = interaction.options.getString("time");
      const position = getSeconds(timeString);

      // Kiểm tra tính hợp lệ của thời gian
      if (isNaN(position) || position < 0) {
        return interaction.reply({ content: `Thời gian không hợp lệ!` }).catch(console.error);
      }

      // Tua nhạc đến thời gian cụ thể
      queue.seek(position);

      // Tạo embed thông báo cho người dùng
      const rewindEmbed = new EmbedBuilder()
        .setColor('#3498db')
        .setAuthor({
          name: 'Đã tua nhạc đến thời gian cụ thể',
          iconURL: 'https://cdn.discordapp.com/attachments/1238866275363721226/1238866505786200074/play-button.png?ex=6640d7d8&is=663f8658&hm=e5ffdd081024c0cac99ab17b9fc36479a6b0e7d5a44912dc557930ac78f6e7bd&',
          url: 'https://discord.gg/Na6FFYMPW6'
        })
        .setDescription(`⏪ *Đã tua bài hát về thời gian* **${timeString}**. *Nghe nhạc vui vẻ^^🍒*`)
        .setFooter({text: 'Made By Cherry' })
        .setTimestamp();

      // Gửi embed về cho người dùng
      interaction.reply({ embeds: [rewindEmbed] }).catch(console.error);
    } catch (e) {
      // Xử lý lỗi nếu có và ghi log
      console.error('Có lỗi xảy ra khi thực hiện lệnh Rewind:', error);
      // Phản hồi cho người dùng với thông báo lỗi
      interaction.reply({ content: '⚠️ Đã xảy ra lỗi khi thực hiện lệnh này!', ephemeral: true }).catch(console.error);
    }
  },
};

// Hàm chuyển đổi thời gian từ chuỗi thành giây
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
