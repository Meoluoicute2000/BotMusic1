const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: "loop",
  description: "Bật hoặc tắt chế độ vòng lặp nhạc.",
  permissions: "0x0000000000000800",
  options: [],
  voiceChannel: true,
  run: async (client, interaction) => {
    try {
      // Lấy hàng đợi phát nhạc của máy chủ từ client
      const queue = client.player.getQueue(interaction.guild.id);
      // Kiểm tra xem có hàng đợi và có bài hát nào đang phát không
      if (!queue || !queue.playing) {
        // Nếu không có bài hát đang phát, phản hồi với thông báo và kết thúc
        return interaction.reply({ content: '⚠️ Không có bài hát nào đang phát !!', ephemeral: true }).catch(console.error);
      }

      // Tạo nút cho các hành động
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

      // Tạo Embed để hiển thị trạng thái lặp lại nhạc
      const embed = new EmbedBuilder()
        .setColor('#fc4e03')
        .setAuthor({
          name: 'Lặp lại giai điệu.',
          iconURL: 'https://cdn.discordapp.com/attachments/1238866275363721226/1238866822611337286/loop.png?ex=6640d823&is=663f86a3&hm=7e5eae02746e6f5b8b84fbc57b5d3934830d9abf57ae0eaef72e29e3bc3bac78&',
          url: 'https://discord.gg/Na6FFYMPW6'
        })
        .setDescription('**Để bài hát được phát lặp lại. **')
        .setFooter({ text: 'Made By Cherry' })
        .setTimestamp();

      // Phản hồi với Embed và các nút
      interaction.reply({ embeds: [embed], components: [button], fetchReply: true }).then(async Message => {
        const filter = i => i.user.id === interaction.user.id;
        let col = await Message.createMessageComponentCollector({ filter, time: 30000 });

        // Bắt sự kiện khi người dùng nhấn vào nút
        col.on('collect', async (button) => {
          if (button.user.id !== interaction.user.id) return;

          const queue1 = client.player.getQueue(interaction.guild.id);
          if (!queue1 || !queue1.playing) {
            // Nếu không có bài hát đang phát, phản hồi với thông báo và kết thúc
            await interaction.editReply({ content: '⚠️ Không có bài hát nào đang phát!', ephemeral: true }).catch(console.error);
            await button.deferUpdate().catch(console.error);
          }

          // Xử lý các hành động khi người dùng nhấn vào các nút
          switch (button.customId) {
            case 'queue':
              const success = queue.setRepeatMode(2);
              interaction.editReply({ content: `✅ Hàng đợi lặp lại!!` }).catch(console.error);
              await button.deferUpdate().catch(console.error);
              break;
            case 'nowplaying':
              const success2 = queue.setRepeatMode(1);
              interaction.editReply({ content: `✅ Vòng lặp được kích hoạt!!` }).catch(console.error);
              await button.deferUpdate().catch(console.error);
              break;
            case 'close':
              if (queue.repeatMode === 0) {
                // Nếu chế độ lặp lại đã được tắt, không thực hiện gì cả
                await button.deferUpdate().catch(console.error);
                return interaction.editReply({ content: '⚠️Vòng lặp đã tắt!!', ephemeral: true }).catch(console.error);
              }
              // Tắt chế độ lặp lại
              const success4 = queue.setRepeatMode(0);
              interaction.editReply({ content: '▶️ Vòng lặp tắt' }).catch(console.error);
              await button.deferUpdate().catch(console.error);
              break;
          }
        });

        // Xử lý khi hết thời gian chờ
        col.on('end', async () => {
          // Tạo Embed mới để ẩn nút
          const embed = new EmbedBuilder()
            .setColor('#fc5203')
            .setTitle('Tự động sửa tin nhắn để embed ngắn gọn!')
            .setFooter({ text: 'Made By Cherry' })
            .setTimestamp();

          // Sửa tin nhắn để ẩn nút và Embed
          await interaction.editReply({ content: "", embeds: [embed], components: [] }).catch(console.error);
        });
      }).catch(console.error);

    } catch (error) {
      // Xử lý lỗi nếu có và ghi log
      console.error('Có lỗi xảy ra khi thực hiện lệnh Loop:', error);
      // Phản hồi cho người dùng với thông báo lỗi
      interaction.reply({ content: '⚠️ Đã xảy ra lỗi khi thực hiện lệnh này!', ephemeral: true }).catch(console.error);
    }
  }
}
