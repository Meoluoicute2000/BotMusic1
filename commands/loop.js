const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: "loop",
  description: "Bật hoặc tắt chế độ vòng lặp nhạc.",
  permissions: "0x0000000000000800",
  options: [],
  voiceChannel: true,
  run: async (client, interaction) => {
    try {
      const queue = client.player.getQueue(interaction.guild.id);
      if (!queue || !queue.playing) return interaction.reply({ content: '⚠️ Không có bài hát nào đang phát !!', ephemeral: true }).catch(e => {});

      let button = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Xếp hàng đợi")
          .setStyle(ButtonStyle.Secondary)
          .setCustomId("queue"),
        new ButtonBuilder()
          .setLabel("Bài hát hiện tại")
          .setStyle(ButtonStyle.Secondary)
          .setCustomId("nowplaying"),
        new ButtonBuilder()
          .setLabel("Dừng lặp lại!")
          .setStyle(ButtonStyle.Danger)
          .setCustomId("close")
      );

      const embed = new EmbedBuilder()
        .setColor('#fc4e03')
        .setAuthor({
          name: 'Lặp lại giai điệu.',
          iconURL: 'https://cdn.discordapp.com/attachments/1156866389819281418/1157318080670728283/7905-repeat.gif',
          url: 'https://discord.gg/Na6FFYMPW6'
        })
        .setDescription('**Để bài hát được phát lặp lại. **')
        .setFooter({text: 'Made By Cherry' })
        .setTimestamp();

      interaction?.reply({ embeds: [embed], components: [button], fetchReply: true }).then(async Message => {
        const filter = i => i.user.id === interaction.user.id;
        let col = await Message.createMessageComponentCollector({ filter, time: 30000 });

        col.on('collect', async (button) => {
          if (button.user.id !== interaction.user.id) return;

          const queue1 = client.player.getQueue(interaction.guild.id);
          if (!queue1 || !queue1.playing) {
            await interaction?.editReply({ content: '⚠️ Không có bài hát nào đang phát!', ephemeral: true }).catch(e => {});
            await button?.deferUpdate().catch(e => {});
          }

          switch (button.customId) {
            case 'queue':
              const success = queue.setRepeatMode(2);
              interaction?.editReply({ content: `✅ Hàng đợi lặp lại!!` }).catch(e => {});
              await button?.deferUpdate().catch(e => {});
              break;
            case 'nowplaying':
              const success2 = queue.setRepeatMode(1);
              interaction?.editReply({ content: `✅ Vòng lặp được kích hoạt!!` }).catch(e => {});
              await button?.deferUpdate().catch(e => {});
              break;
            case 'close':
              if (queue.repeatMode === 0) {
                await button?.deferUpdate().catch(e => {});
                return interaction?.editReply({ content: '⚠️Vòng lặp đã tắt!!', ephemeral: true }).catch(e => {});
              }
              const success4 = queue.setRepeatMode(0);
              interaction?.editReply({ content: '▶️ Vòng lặp tắt' }).catch(e => {});
              await button?.deferUpdate().catch(e => {});
              break;
          }
        });

        col.on('end', async () => {
          const embed = new EmbedBuilder()
            .setColor('#fc5203')
            .setTitle('Tự động sửa tin nhắn để embed ngắn gọn!')
            .setFooter({text: 'Made By Cherry' })
            .setTimestamp();

          await interaction?.editReply({ content: "", embeds: [embed], components: [] }).catch(e => {});
        });
      }).catch(e => {});

    } catch (e) {
      console.error(e);
    }
  }
}
