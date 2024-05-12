const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const maxVol = require("../config.js").opt.maxVol; // Import maxVol từ config.js
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
      // Lấy hàng đợi phát nhạc của máy chủ từ client
      const queue = client.player.getQueue(interaction.guild.id);

      // Kiểm tra nếu không có hàng đợi hoặc không có bài hát nào đang phát
      if (!queue || !queue.playing) {
        return interaction.reply({ content: '⚠️ Không có bài hát nào đang phát!!', ephemeral: true });
      }

      // Lấy giá trị âm lượng từ lựa chọn
      const vol = parseInt(interaction.options.getInteger('volume'));

      // Nếu không có giá trị âm lượng, hiển thị âm lượng hiện tại và hướng dẫn
      if (!vol) {
        return interaction.reply({
          content: `Âm lượng hiện tại : **${queue.volume}** 🔊\nĐể thay đổi âm lượng, hãy nhập một số từ \`1\` đến \`${maxVol}\`.`,
          ephemeral: true
        });
      }

      // Kiểm tra xem âm lượng đã được đặt chưa
      if (queue.volume === vol) {
        return interaction.reply({ content: 'Âm lượng hiện tại đã được đặt thành **' + vol + '**!', ephemeral: true });
      }

      // Kiểm tra giá trị âm lượng có hợp lệ không
      if (vol < 1 || vol > maxVol) {
        return interaction.reply({
          content: `Vui lòng nhập một số từ \`1\` đến \`${maxVol}\`.`,
          ephemeral: true
        });
      }

      // Đặt giá trị âm lượng và kiểm tra kết quả
      const success = queue.setVolume(vol);

      // Nếu đặt thành công
      if (success) {
        const embed = new EmbedBuilder()
          .setColor('#d291fe')
          .setAuthor({
            name: 'Âm nhạc của bạn',
            iconURL: 'https://cdn.discordapp.com/attachments/1238866275363721226/1238866855175913594/volume.png?ex=6640d82b&is=663f86ab&hm=900bacc45436f7640a2896b48949635d4f64b0777a7ce2a0a12e80a3d493c12a&', 
            url: 'https://discord.gg/Na6FFYMPW6'
          })
          .setDescription(`**Điều chỉnh âm lượng : ** **${vol}/${maxVol}**`)
          .setFooter({ text: 'Made By Cherry' })
          .setTimestamp();

        return interaction.reply({ embeds: [embed] });
      } else {
        // Nếu có lỗi khi đặt âm lượng
        return interaction.reply({ content: '❌ Đã xảy ra lỗi khi thay đổi âm lượng.', ephemeral: true });
      }
    } catch (e) {
      // Xử lý lỗi nếu có và ghi log
      console.error('Có lỗi xảy ra khi thực hiện lệnh Volume:', e);
      // Phản hồi cho người dùng với thông báo lỗi
      interaction.reply({ content: '⚠️ Đã xảy ra lỗi khi thực hiện lệnh này!', ephemeral: true }).catch(console.error);
    }
  },
};
