const { MessageEmbed } = require("discord.js");
const config = require("../config.js");
const db = require("../mongoDB");

module.exports = {
  name: "shuffle",
  description: "Xáo trộn các bài hát.",
  options: [],
  permissions: "0x0000000000000800",
  run: async (client, interaction) => {
    try {
      const queue = client.player.getQueue(interaction.guild.id);

      if (!queue || !queue.playing) {
        return interaction.reply({ content: `⚠️ Không có bài hát nào đang phát !!`, ephemeral: true }).catch(e => {});
      }

      try {
        queue.shuffle(interaction);
        
        const embed = new MessageEmbed()
          .setColor('#3498db')
          .setFooter({text: 'Made By Cherry' })
          .setTimestamp()
          .setDescription(`<@${interaction.user.id}>, Đã xáo trộn các bài hát`);

        return interaction.reply({ embeds: [embed] }).catch(e => {});
      } catch(err) {
        return interaction.reply({ content: `**${err}**` }).catch(e => {});
      }
    } catch (e) {
      console.error(e);
    }
  },
};
