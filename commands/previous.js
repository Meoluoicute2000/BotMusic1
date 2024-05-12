const db = require("../mongoDB");

module.exports = {
  name: "previous",
  description: "Phát lại bài hát trước đó.",
  permissions: "0x0000000000000800",
  options: [],
  voiceChannel: true,
  run: async (client, interaction) => {
    try {
      const queue = client.player.getQueue(interaction.guild.id);
      if (!queue || !queue.playing) return interaction.reply({ content: `⚠️ Không có bài hát nào đang phát !!`, ephemeral: true }).catch(e => { })
      try {
        let song = await queue.previous()
        interaction.reply({ content: `**Phát lại bài hát trước đó của bạn!**` }).catch(e => { })
          .setFooter({text: 'Made By Cherry' })
          .setTimestamp();
      } catch (e) {
        return interaction.reply({ content: `❌ Không có bài hát trước đó!!`, ephemeral: true }).catch(e => { })
      }
    } catch (e) {
      console.error(e); 
    }
  },
};
