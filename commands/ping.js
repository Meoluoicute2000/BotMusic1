const { EmbedBuilder } = require('discord.js');
const db = require("../mongoDB");

module.exports = {
  name: "ping",
  description: "Kiểm tra độ trễ của Bot.", 
  permissions: "0x0000000000000800", 
  options: [], 
  run: async (client, interaction) => { 
    try {
      // Lấy thời điểm bắt đầu gửi tin nhắn
      const startTime = Date.now(); 

      // Tạo một Embed để hiển thị tin nhắn đang kiểm tra độ trễ
      const pingEmbed = new EmbedBuilder()
        .setColor('#6190ff')
        .setTitle('Độ trễ của Bot')
        .setDescription('Đang kiểm tra...')
        .setFooter({ text: 'Made By Cherry' })
        .setTimestamp();

      // Gửi tin nhắn kiểm tra và lưu phản hồi
      const pingMessage = await interaction.reply({ embeds: [pingEmbed], fetchReply: true });

      // Lấy thời điểm nhận phản hồi
      const endTime = Date.now(); 

      // Tạo một Embed mới để hiển thị kết quả độ trễ
      const pingResultEmbed = new EmbedBuilder()
        .setColor('#6190ff')
        .setTitle('Độ trễ của Bot')
        .setDescription(`Tình trạng của Bot là: ${endTime - startTime}ms`)
        .setFooter({ text: 'Made By Cherry' })
        .setTimestamp();

      // Cập nhật tin nhắn ban đầu với kết quả độ trễ
      await interaction.editReply({ embeds: [pingResultEmbed] });
    } catch (error) { 
      // Xử lý lỗi nếu có và ghi log
      console.error('Có lỗi xảy ra khi thực hiện lệnh Ping:', error);
      // Phản hồi cho người dùng với thông báo lỗi
      interaction.reply({ content: '⚠️ Đã xảy ra lỗi khi thực hiện lệnh này!', ephemeral: true }).catch(console.error);
    }
  },
};
