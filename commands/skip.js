const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const db = require("../mongoDB");
module.exports = {
  name: "skip",
  description: "Chuyển đổi nhạc đang được phát.",
  permissions: "0x0000000000000800",
  options: [{
    name: "number",
    description: "Đề cập đến số lượng bài hát bạn muốn bỏ qua",
    type: ApplicationCommandOptionType.Number,
    required: false
  }],
  voiceChannel: true,
  run: async (client, interaction) => {

    try {

      const queue = client.player.getQueue(interaction.guild.id);
      if (!queue || !queue.playing) return interaction.reply({ content: '⚠️ Không có bài hát nào đang phát !!', ephemeral: true }).catch(e => { })

      let number = interaction.options.getNumber('number');
      if (number) {
        if (!queue.songs.length > number) return interaction.reply({ content: '⚠️ Đã vượt quá số lượng bài hát trong hàng chờ', ephemeral: true }).catch(e => { })
        if (isNaN(number)) return interaction.reply({ content: '⚠️ Con số không hợp lệ', ephemeral: true }).catch(e => { })
        if (1 > number) return interaction.reply({ content: '⚠️ Con số không hợp lệ', ephemeral: true }).catch(e => { })

        try {
        let old = queue.songs[0];
        await client.player.jump(interaction, number).then(song => {
          return interaction.reply({ content: `⏯️ Skipped : **${old.name}**` }).catch(e => { })
        })
      } catch(e){
        return interaction.reply({ content: '❌ Hàng đợi trống!!', ephemeral: true }).catch(e => { })
      }
      } else {
try {
  const queue = client.player.getQueue(interaction.guild.id);
  if (!queue || !queue.playing) {
    return interaction.reply({ content: '⚠️ Không có bài hát nào đang phát !!', ephemeral: true });
  }

  let old = queue.songs[0];
  const success = await queue.skip();

  const embed = new EmbedBuilder()
    .setColor('#3498db')
    .setAuthor({
      name: 'Bài hát bị bỏ qua',
      iconURL: 'https://cdn.discordapp.com/attachments/1156866389819281418/1157269773118357604/giphy.gif',
      url: 'https://discord.gg/Na6FFYMPW6'
    })
    .setDescription(success ? ` **Bỏ qua!** : **${old.name}**` : '❌ Hàng đợi trống!')
    .setFooter({ text: 'Made By Cherry' })
    .setTimestamp();

  return interaction.reply({ embeds: [embed] });
}catch (e) {
          return interaction.reply({ content: '❌ Hàng đợi trống!', ephemeral: true }).catch(e => { })
        }
      }

    } catch (e) {
    console.error(e); 
  }
  },
};
