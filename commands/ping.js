const { EmbedBuilder } = require('discord.js')
const db = require("../mongoDB");
module.exports = {
  name: "ping",
  description: "Kiểm tra độ trễ của Bot.",
  permissions: "0x0000000000000800",
  options: [],
  run: async (client, interaction) => {

    try {
      // Tạo một Embed để hiển thị tin nhắn đang kiểm tra độ trễ
      const start = Date.now();
      interaction.reply("Đang tải độ trễ của bot...").then(msg => {
        const end = Date.now();
        const embed = new EmbedBuilder()
          .setColor(`#6190ff`)
          .setTitle(`Độ trễ của bot.`)
          .setDescription(`**Tình trạng của Bot là** : ${end - start}ms`)
          .setFooter({ text: 'Made By Cherry' })
          .setTimestamp();
        return interaction.editReply({ embeds: [embed] }).catch(e => { });
      }).catch(err => { })

    } catch (e) {
      // Xử lý lỗi nếu có và ghi log
      console.error('Có lỗi xảy ra khi thực hiện lệnh Ping:', error);
      // Phản hồi cho người dùng với thông báo lỗi
      interaction.reply({ content: '⚠️ Đã xảy ra lỗi khi thực hiện lệnh này!', ephemeral: true }).catch(console.error);
  }
  },
};
