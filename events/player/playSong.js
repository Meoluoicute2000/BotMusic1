const db = require("../../mongoDB");
const { EmbedBuilder } = require("discord.js");

module.exports = async (client, queue, song) => {
  if (queue) {
    if (!client.config.opt.loopMessage && queue?.repeatMode !== 0) return;
    if (queue?.textChannel) {
      const embed = new EmbedBuilder()
      .setAuthor({
        name: 'Đang phát một bản nhạc',
        iconURL: 'https://cdn.discordapp.com/attachments/1140841446228897932/1144671132948103208/giphy.gif', 
        url: 'https://discord.gg/Na6FFYMPW6'
    })
    .setDescription(`\n \n ▶️ **Hãy chờ Bot chuẩn bị cho bài hát yêu thích. ** \n \n ▶️ **Nếu như bị lỗi xin hãy kiểm tra lại phần tìm kiếm.** \n \n ▶️ **Sẽ tuyệt hơn nếu như có thêm ai nghe nhạc cùng các bạn.**`)
        .setImage(song.thumbnail)
    .setColor('#FF0000')
    .setFooter({ text: 'Lệnh hỗ trợ của Bot : /help - Tổng hợp commands ● Made By Cherry' })
    .setTimestamp();

      queue?.textChannel?.send({ embeds: [embed] }).catch(e => { });
    }
  }
}
