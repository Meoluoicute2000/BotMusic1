const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const db = require("../mongoDB");

module.exports = {
  name: "skip",
  description: "Chuyển đổi nhạc đang được phát.",
  permissions: "0x0000000000000800",
  options: [{
    name: "number",
    description: "Đề cập đến số lượng bài hát bạn muốn bỏ qua",
    type: ApplicationCommandOptionType.Number,
    required: false
  }],
  voiceChannel: true,
  run: async (client, interaction) => {
    try {
      // Lấy hàng đợi phát nhạc của máy chủ từ client
      const queue = client.player.getQueue(interaction.guild.id);

      // Kiểm tra nếu không có hàng đợi hoặc không có bài hát nào đang phát
      if (!queue || !queue.playing) {
        return interaction.reply({ content: '⚠️ Không có bài hát nào đang phát !!', ephemeral: true });
      }

      let number = interaction.options.getNumber('number');

      // Nếu có số lượng được chỉ định
      if (number) {
        // Kiểm tra số lượng bài hát trong hàng đợi
        if (!queue.songs.length >= number || isNaN(number) || number <= 0) {
          return interaction.reply({ content: '⚠️ Số lượng bài hát được chỉ định không hợp lệ hoặc vượt quá số lượng bài hát trong hàng đợi!', ephemeral: true });
        }

        try {
          // Lấy thông tin của bài hát hiện tại
          let old = queue.songs[0];
          // Bỏ qua số lượng bài hát được chỉ định
          await client.player.jump(interaction, number).then(song => {
            return interaction.reply({ content: `⏯️ Skipped : **${old.name}**` });
          });
        } catch (e) {
          return interaction.reply({ content: '❌ Hàng đợi trống!!', ephemeral: true });
        }
      } else {
        // Nếu không có số lượng được chỉ định, chỉ bỏ qua bài hát hiện tại
        try {
          let old = queue.songs[0];
          const success = await queue.skip();

          const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setAuthor({
              name: 'Bài hát bị bỏ qua',
              iconURL: 'https://cdn.discordapp.com/attachments/1238866275363721226/1238866792529531001/next.png?ex=6640d81c&is=663f869c&hm=edd1b6bb574e9c16e9e89b1df2403ba6f1db582e5c123a2b0b0c83355b4137e1&',
              url: 'https://discord.gg/Na6FFYMPW6'
            })
            .setDescription(success ? ` **Bỏ qua!** : **${old.name}**` : '❌ Hàng đợi trống!')
            .setFooter({ text: 'Made By Cherry' })
            .setTimestamp();

          return interaction.reply({ embeds: [embed] });
        } catch (e) {
          return interaction.reply({ content: '❌ Hàng đợi trống!', ephemeral: true });
        }
      }
    } catch (error) {
      // Xử lý lỗi nếu có và ghi log
      console.error('Có lỗi xảy ra khi thực hiện lệnh Skip:', error);
      // Phản hồi cho người dùng với thông báo lỗi
      interaction.reply({ content: '⚠️ Đã xảy ra lỗi khi thực hiện lệnh này!', ephemeral: true }).catch(console.error);
    }
  },
};
