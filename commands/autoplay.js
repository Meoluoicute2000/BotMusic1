const db = require("../mongoDB");
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: "autoplay", 
  description: "Chuyển đổi tự động phát của hàng đợi.", 
  options: [], 
  permissions: "0x0000000000000800", 

  run: async (client, interaction) => { 
    try {
      // Lấy hàng đợi phát nhạc của máy chủ từ client
      const queue = client?.player?.getQueue(interaction?.guild?.id);
      
      // Kiểm tra xem có hàng đợi và có bài hát nào đang phát không
      if (!queue || !queue?.playing) {
        // Nếu không có bài hát đang phát, phản hồi với thông báo và kết thúc
        return interaction?.reply({ content: '⚠️ Không có bài hát nào đang phát !!', ephemeral: true });
      }

      // Chuyển đổi trạng thái tự động phát của hàng đợi
      queue?.toggleAutoplay();

      // Tạo Embed để hiển thị trạng thái tự động phát mới
      const embed = new EmbedBuilder()
        .setColor('#2f58fe') 
        .setAuthor({
          name: 'Tự động phát nhạc', 
          iconURL: 'https://cdn.discordapp.com/attachments/1238866275363721226/1238867308823449770/autoplay.png?ex=6640d897&is=663f8717&hm=7650456bb63acccceaf9a53a2c3dba8f5da6014cb06a51a4e7b1d832a2b07d3c&', // Icon của Embed
          url: 'https://discord.gg/Na6FFYMPW6' 
        })
        .setTitle('Tự động phát nhạc dựa theo đề xuất!') 
        .setDescription(queue?.autoplay ? '**✅ Autoplay Bật**' : '**❌ Autoplay Tắt**')
        .setFooter({ text: 'Made By Cherry' }) 
        .setTimestamp(); 

      // Phản hồi với Embed mới
      interaction?.reply({ embeds: [embed] });
    } catch (error) {
      // Xử lý lỗi nếu có và ghi log
      console.error('Có lỗi xảy ra khi thực hiện lệnh Autoplay:', error);
      // Phản hồi cho người dùng với thông báo lỗi
      interaction.reply({ content: '⚠️ Đã có lỗi xảy ra khi thực hiện lệnh này!', ephemeral: true }).catch(console.error);
    }
  },
};
