const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require("../mongoDB");

module.exports = {
  name: "filter",
  description: "Thêm bộ lọc âm thanh vào nhạc đang phát.",
  permissions: "0x0000000000000800",
  options: [],
  voiceChannel: true,
  run: async (client, interaction) => {
    try {
      const queue = client?.player?.getQueue(interaction?.guild?.id);
      if (!queue || !queue?.playing) {
        return interaction?.reply({ content: '⚠️ Không có bài hát nào đang phát !!', ephemeral: true });
      }

      // Xây dựng các nút chức năng cho việc chọn bộ lọc
      let buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("3D")
          .setCustomId('3d')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setLabel("Bassboost")
          .setCustomId('bassboost')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setLabel("Echo")
          .setCustomId('echo')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setLabel("Nightcore")
          .setCustomId('nightcore')
          .setStyle(ButtonStyle.Secondary)
      );

      let buttons2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Vaporwave")
          .setCustomId('vaporwave')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setLabel("Surround")
          .setCustomId('surround')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setLabel("Earwax")
          .setCustomId('earwax')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setLabel("Karaoke")
          .setCustomId('karaoke')
          .setStyle(ButtonStyle.Secondary)
      );

      // Tạo Embed để hướng dẫn người dùng chọn bộ lọc âm thanh
      let embed = new EmbedBuilder()
        .setColor('#01fe66')
        .setAuthor({
          name: 'Bộ lọc Audio',
          iconURL: 'https://cdn.discordapp.com/attachments/1238866275363721226/1238866910502981683/filter.png?ex=6640d838&is=663f86b8&hm=d349257d88e26435c5486b33f38de8692116ee1fd2393725f05c31270c98ab4b&',
          url: 'https://discord.gg/Na6FFYMPW6'
        })
        .setDescription('**Hãy chọn kiểu âm thanh của bạn bên dưới!**')
        .setFooter({ text: 'Made By Cherry' })
        .setTimestamp();

      // Phản hồi với Embed và các nút chức năng
      interaction.reply({ embeds: [embed], components: [buttons, buttons2] }).then(async (Message) => {
        // Tạo bộ lắng nghe sự kiện khi người dùng chọn nút
        const filter = i => i.user.id === interaction?.user?.id;
        let col = await Message?.createMessageComponentCollector({ filter, time: 60000 });

        col.on('collect', async (button) => {
          if (button?.user?.id !== interaction?.user?.id) return;
          await button?.deferUpdate();

          // Danh sách các bộ lọc âm thanh
          let filters = ["3d", "bassboost", "echo", "karaoke", "nightcore", "vaporwave", "surround", "earwax"];
          if (!filters?.includes(button?.customId)) return;

          let filtre = button.customId.toLowerCase();
          if (!filtre) return interaction?.editReply({ content: '❌ Không hợp lệ', ephemeral: true });
          filtre = filtre?.toLowerCase();

          if (filters?.includes(filtre?.toLowerCase())) {
            if (queue?.filters?.has(filtre)) {
              queue?.filters?.remove(filtre);
              embed?.setDescription(`Bộ lọc : **${filtre}**, Trạng thái áp dụng: **❌**`);
              return interaction?.editReply({ embeds: [embed] });
            } else {
              queue?.filters?.add(filtre);
              embed?.setDescription(`Bộ lọc : **${filtre}**, Trạng thái áp dụng: **✅**`);
              return interaction?.editReply({ embeds: [embed] });
            }
          } else {
            const filter = filters?.find((x) => x?.toLowerCase() === filtre?.toLowerCase());
            embed?.setDescription(`❌ Không thể tìm thấy bộ lọc`.replace("{filters}", filters?.map(mr => `\`${mr}\``).join(", ")));
            if (!filter) return interaction?.editReply({ embeds: [embed] });
          }
        });

        col.on('end', async (button, reason) => {
          if (reason === 'time') {
            // Nếu hết thời gian, chỉnh sửa tin nhắn để ẩn đi Embed và nút chức năng
            embed = new EmbedBuilder()
              .setColor(client?.config?.embedColor)
              .setTitle("Tự động sửa tin nhắn để ember ngắn gọn!")
              .setFooter({ text: 'Made By Cherry' })
              .setTimestamp();

            await interaction?.editReply({ embeds: [embed], components: [] });
          }
        });
      });
    } catch (error) {
      // Xử lý lỗi nếu có và ghi log
      console.error('Có lỗi xảy ra khi thực hiện lệnh Filter:', error);
      // Phản hồi cho người dùng với thông báo lỗi
      interaction.reply({ content: '⚠️ Đã có lỗi xảy ra khi thực hiện lệnh này!', ephemeral: true }).catch(console.error);
    }
  },
};
