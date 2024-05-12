const db = require("../../mongoDB");
const { EmbedBuilder } = require("discord.js");

module.exports = async (client, queue, song) => {
  // Kiểm tra xem queue có tồn tại không
  if (!queue) return;

  // Kiểm tra xem cài đặt loopMessage được kích hoạt không và chế độ lặp không phải là 0
  if (!client.config.opt.loopMessage && queue.repeatMode !== 0) return;

  // Kiểm tra xem có kênh văn bản được gán cho hàng đợi không
  if (queue.textChannel) {
    // Tạo embed thông báo
    const embed = new EmbedBuilder()
      .setAuthor({
        name: 'Thêm nhạc vào hàng đợi',
        iconURL: 'https://cdn.discordapp.com/attachments/1238866275363721226/1238866444482121748/diaquay.gif?ex=6640d7c9&is=663f8649&hm=40ade926b4b3a1b3bcfdadb02e1d0dbacec99f094542ae81341b4a24e03ef77f&', 
        url: 'https://discord.gg/Na6FFYMPW6'
      })
      .setDescription(`<@${song.user.id}>, **${song.name}**`)
      .setColor('#14bdff')
      .setFooter({ text: 'Sử dụng lệnh queue để biết thêm bài nhạc tiếp theo!' });

    // Gửi embed vào kênh văn bản
    queue.textChannel.send({ embeds: [embed] }).catch(console.error);
  }
};
