const db = require("../mongoDB");
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: "pause",
  description: "Dừng phát nhạc hiện đang phát.",
  permissions: "0x0000000000000800",
  options: [],
  voiceChannel: true,
  run: async (client, interaction) => {
    // Lấy hàng đợi phát nhạc của máy chủ từ client
    const queue = client.player.getQueue(interaction.guild.id);

    try {
      if (!queue || !queue.playing) {
        // Kiểm tra nếu không có hàng đợi hoặc không có bài hát nào đang phát
        return interaction.reply({ content: '⚠️ Không có bài hát nào đang phát !!', ephemeral: true });
      }

      // Kiểm tra dừng thành công hay chưa
      const success = queue.pause();
      
      // Nếu dừng thành công
      const embed = new EmbedBuilder()
        .setColor('#7645fe') 
        .setAuthor({
          name: 'Tạm dừng bài hát đang phát.',
          iconURL: 'https://cdn.discordapp.com/attachments/1238866275363721226/1238866713861423175/pause-button.png?ex=6640d809&is=663f8689&hm=1e5ba71dab1922b2417e3c42ea69b2b9abf2e0a93be31907f678fcf292407519&',
          url: 'https://discord.gg/Na6FFYMPW6'
        })
        .setDescription(success ? '**Nhạc đã bị tạm dừng !!**' : '❌ Lỗi: Không thể tạm dừng bài hát')
        .setFooter({ text: 'Made By Cherry' })
        .setTimestamp();
      // Trả lời lại ember nếu thành công
      return interaction.reply({ embeds: [embed] });
    } catch (e) {
      // Xử lý lỗi nếu có và ghi log
      console.error('Có lỗi xảy ra khi thực hiện lệnh Pause:', e);
      // Phản hồi cho người dùng với thông báo lỗi
      interaction.reply({ content: '⚠️ Đã xảy ra lỗi khi thực hiện lệnh này!', ephemeral: true }).catch(console.error);
    }
  },
};
