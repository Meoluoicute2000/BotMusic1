const { EmbedBuilder } = require("discord.js");
const config = require("../config.js");
const db = require("../mongoDB");

module.exports = {
  name: "shuffle",
  description: "Xáo trộn các bài hát.",
  options: [],
  permissions: "0x0000000000000800",
  run: async (client, interaction) => {
    try {
      // Lấy hàng đợi phát nhạc của máy chủ từ client
      const queue = client.player.getQueue(interaction.guild.id);

      // Kiểm tra nếu không có hàng đợi hoặc không có bài hát nào đang phát
      if (!queue || !queue.playing) {
        return interaction.reply({ content: `⚠️ Không có bài hát nào đang phát !!`, ephemeral: true });
      }

      // Thực hiện xáo trộn các bài hát trong hàng đợi
      try {
        queue.shuffle(interaction);
        
        const embed = new EmbedBuilder()
          .setAuthor({
            name: 'Xáo trộn các bài hát',
            iconURL: 'https://cdn.discordapp.com/attachments/1238866275363721226/1238867375504359434/shuffle.png?ex=6640d8a7&is=663f8727&hm=d3b86d388619f4c71f9cdc32afb9ba2ec3991d51940c148fb325fdbcb08cd76d&',
            url: 'https://discord.gg/Na6FFYMPW6'
          })
          .setColor('#3498db')
          .setFooter({text: 'Made By Cherry' })
          .setTimestamp()
          .setDescription(`<@${interaction.user.id}>, Đã xáo trộn các bài hát`);

        return interaction.reply({ embeds: [embed] });
      } catch(err) {
        // Xử lý lỗi nếu có
        console.error('Lỗi khi xáo trộn hàng đợi:', err);
        return interaction.reply({ content: `**${err}**` });
      }
    } catch (error) {
      // Xử lý lỗi nếu có và ghi log
      console.error('Có lỗi xảy ra khi thực hiện lệnh Shuffle:', error);
      // Phản hồi cho người dùng với thông báo lỗi
      interaction.reply({ content: '⚠️ Đã xảy ra lỗi khi thực hiện lệnh này!', ephemeral: true }).catch(console.error);
    }
  },
};
