const db = require("../../mongoDB");
const { EmbedBuilder } = require("discord.js");

module.exports = async (client, queue, song) => {
  if (queue) {
    if (!client.config.opt.loopMessage && queue?.repeatMode !== 0) return;
    if (queue?.textChannel) {
      const embed = new EmbedBuilder()
        .setAuthor({
        name: 'Thêm nhạc vào hàng đợi',
        iconURL: 'https://media.discordapp.net/attachments/1140841446228897932/1144671132948103208/giphy.gif', 
        url: 'https://discord.gg/Na6FFYMPW6'
    })
        .setDescription(`<@${song.user.id}>, **${song.name}**`)
        .setColor('#14bdff')
        .setFooter({ text: 'Sử dụng lệnh queue để biết thêm bài nhạc tiếp theo!' });
      queue?.textChannel?.send({ embeds: [embed] }).catch(e => { });
    }
  }
}
