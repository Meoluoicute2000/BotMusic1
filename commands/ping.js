const { EmbedBuilder } = require('discord.js')
const db = require("../mongoDB");
module.exports = {
  name: "ping",
  description: "Kiểm tra độ trễ của Bot.",
  permissions: "0x0000000000000800",
  options: [],
  run: async (client, interaction) => {

    try {

      const start = Date.now();
      interaction.reply("Độ trễ🍒💦").then(msg => {
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
    console.error(e); 
  }
  },
};
