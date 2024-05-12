const db = require("../mongoDB");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: "help",
  description: "Tất cả các lệnh hỗ trợ về Bot.",
  permissions: "0x0000000000000800",
  options: [],

  run: async (client, interaction) => {
    try {
      // Tạo Embed để hiển thị danh sách các lệnh và thông tin về Bot
      const embed = new EmbedBuilder()
        .setColor(client.config.embedColor)
        .setAuthor({
          name: 'Lệnh và thông tin Bot',
          iconURL: 'https://cdn.discordapp.com/attachments/1238871099027230782/1238871439214641172/owner.png?ex=6640dc70&is=663f8af0&hm=cf1c4751a1e65087c5d2df07417d72554a7cb4a967e05c48fd731b91c5fbbea0&',
          url: 'https://discord.gg/Na6FFYMPW6'
        })
        .setDescription("__**Các lệnh có sẵn :**__\n\n" +
          "🎹 **Play**: Phát bài hát từ một liên kết hoặc tìm kiếm\n" +
          "⏹️ **Stop**: Làm cho bot ngừng phát nhạc\n" +
          "🎶 **Queue**: Xem và quản lý hàng đợi bài hát\n" +
          "⏭️ **Skip**: Bỏ qua bài hát hiện tại\n" +
          "⏸️ **Pause**: Tạm dừng bài hát đang phát\n" +
          "▶️ **Resume**: Tiếp tục bài hát đang tạm dừng\n" +
          "🔁 **Loop**: Chuyển đổi chế độ vòng lặp\n" +
          "📌 **Ping**: Kiểm tra Ping của Bot\n" +
          "🗑️ **Clear**: Xóa hàng đợi bài hát\n" +
          "🔄 **Autoplay**: Bật hoặc tắt tính năng tự động phát\n" +
          "🍒 **Playlist + [...] ** Các tính năng Playlist của Bot\n" +
          "🔊 **Volume**: Điều chỉnh âm lượng nhạc\n" +
          "🎧 **Filter**: Áp dụng các bộ lọc để nâng cao âm thanh\n")
        .setImage(`https://cdn.discordapp.com/attachments/1173688114460495923/1191278568647426089/23ra_ai_wallpaper_AI.jpg`)
        .setFooter({ text: 'Made By Cherry' })
        .setTimestamp();

      // Tạo các nút để đưa người dùng đến các trang web khác nhau
      const button1 = new ButtonBuilder()
        .setLabel('YouTube')
        .setURL('https://www.youtube.com/@Kidtomboy')
        .setStyle(ButtonStyle.Link);

      const button2 = new ButtonBuilder()
        .setLabel('Discord Server')
        .setURL('https://discord.gg/Na6FFYMPW6')
        .setStyle(ButtonStyle.Link);

      const button3 = new ButtonBuilder()
        .setLabel('Mã nguồn bot!')
        .setURL('https://github.com/')
        .setStyle(ButtonStyle.Link);

      // Tạo một dòng hành động chứa các nút
      const row = new ActionRowBuilder()
        .addComponents(button1, button2, button3);

      // Phản hồi với Embed và các nút đã tạo
      interaction.reply({ embeds: [embed], components: [row] });

    } catch (error) {
      // Xử lý lỗi nếu có và ghi log
      console.error('Có lỗi xảy ra khi thực hiện lệnh Help:', error);
      // Phản hồi cho người dùng với thông báo lỗi
      interaction.reply({ content: '⚠️ Đã xảy ra lỗi khi thực hiện lệnh này!', ephemeral: true }).catch(console.error);
    }
  },
};
