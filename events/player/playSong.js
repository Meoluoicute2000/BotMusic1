const db = require("../../mongoDB");
const { EmbedBuilder } = require("discord.js");

module.exports = async (client, queue, song) => {
  // Kiểm tra nếu có hàng đợi
  if (queue) {
    // Kiểm tra xem có thông báo lặp lại được kích hoạt và chế độ lặp lại của hàng đợi không
    if (!client.config.opt.loopMessage && queue?.repeatMode !== 0) return;

    // Kiểm tra nếu có kênh văn bản để gửi thông báo
    if (queue?.textChannel) {
      // Tạo Embed để chứa thông điệp
      const embed = new EmbedBuilder()
        .setAuthor({
          name: 'Đang phát một bản nhạc',
          iconURL: 'https://cdn.discordapp.com/attachments/1238866275363721226/1238866444482121748/diaquay.gif?ex=6640d7c9&is=663f8649&hm=40ade926b4b3a1b3bcfdadb02e1d0dbacec99f094542ae81341b4a24e03ef77f&', 
          url: 'https://discord.gg/Na6FFYMPW6'
        })
        .setDescription(`\n \n ▶️ **Hãy chờ Bot chuẩn bị cho bài hát yêu thích. ** \n \n ▶️ **Nếu như bị lỗi xin hãy kiểm tra lại phần tìm kiếm.** \n \n ▶️ **Sẽ tuyệt hơn nếu như có thêm ai nghe nhạc cùng các bạn.**`) 
        .setImage(song.thumbnail) 
        .setColor('#FF0000') 
        .setFooter({ text: 'Lệnh hỗ trợ của Bot : /help - Tổng hợp commands' })
        .setFooter({ text: 'Made By Cherry' })
        .setTimestamp();

      // Gửi Embed vào kênh văn bản của hàng đợi
      queue.textChannel.send({ embeds: [embed] }).catch(e => { });
    }
  }
}
