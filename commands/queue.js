const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require("../mongoDB");

module.exports = {
  name: "queue",
  description: "Hiển thị cho bạn danh sách hàng đợi.",
  permissions: "0x0000000000000800",
  options: [],
  run: async (client, interaction) => {

    try {

      // Lấy hàng đợi phát nhạc của máy chủ từ client
      const queue = client.player.getQueue(interaction.guild.id);
      
      // Kiểm tra nếu hàng đợi trống hoặc không có bài hát nào đang phát
      if (!queue || !queue.playing) {
        return interaction.reply({ content: '⚠️ Không có bài hát nào đang phát !!', ephemeral: true }).catch(e => {});
      }
      
      // Kiểm tra nếu hàng đợi không có bài hát
      if (!queue.songs[0]) {
        return interaction.reply({ content: '⚠️ Hàng đợi đang trống!!', ephemeral: true }).catch(e => {});
      }

      const trackList = [];
      
      // Tạo danh sách các bài hát trong hàng đợi
      queue.songs.map(async (track, i) => {
        trackList.push({
          title: track.name,
          author: track.uploader.name,
          user: track.user,
          url: track.url,
          duration: track.duration
        });
      });

      // Thiết lập các nút điều hướng
      const backId = "emojiBack";
      const forwardId = "emojiForward";
      const backButton = new ButtonBuilder({
        style: ButtonStyle.Secondary,
        emoji: "⬅️",
        customId: backId
      });

      const deleteButton = new ButtonBuilder({
        style: ButtonStyle.Secondary,
        emoji: "❌",
        customId: "close"
      });

      const forwardButton = new ButtonBuilder({
        style: ButtonStyle.Secondary,
        emoji: "➡️",
        customId: forwardId
      });

      let howMuch = 8;
      let page = 1;
      let totalPage = Math.ceil(trackList.length / howMuch);

      // Hàm tạo embed
      const generateEmbed = async (start) => {
        let currentIndex = page === 1 ? 1 : page * howMuch - howMuch + 1;
        const current = trackList.slice(start, start + howMuch);
        
        if (!current || !current.length > 0) {
          return interaction.reply({ content: '⚠️ Hàng đợi đang trống!!', ephemeral: true }).catch(e => {});
        }
        
        return new EmbedBuilder()
          .setTitle(`${interaction.guild.name}  Queue`)
          .setThumbnail(interaction.guild.iconURL({ size: 2048, dynamic: true }))
          .setColor(client.config.embedColor)
          .setDescription(`▶️ Đang phát một bài hát : \`${queue.songs[0].name}\`
    ${current.map(data =>
            `\n\`${currentIndex++}\` | [${data.title}](${data.url}) | (Thực hiện bởi <@${data.user.id}>)`
          )}`)
          .setFooter({ text: `Page ${page}/${totalPage}` })
          .setFooter({ text: 'Made By Cherry' })
          .setTimestamp();
      };

      const canFitOnOnePage = trackList.length <= howMuch;

      // Gửi embed và các nút điều hướng
      await interaction.reply({
        embeds: [await generateEmbed(0)],
        components: canFitOnOnePage
          ? []
          : [new ActionRowBuilder({ components: [deleteButton, forwardButton] })],
        fetchReply: true
      }).then(async Message => {
        const filter = i => i.user.id === interaction.user.id;
        const collector = Message.createMessageComponentCollector({ filter, time: 120000 });

        let currentIndex = 0;
        
        // Xử lý sự kiện click nút
        collector.on("collect", async (button) => {
          if (button?.customId === "close") {
            collector?.stop();
            return button?.reply({ content: 'Lệnh đã bị hủy!', ephemeral: true }).catch(e => {});
          } else {
            if (button.customId === backId) {
              page--;
            }
            if (button.customId === forwardId) {
              page++;
            }
            button.customId === backId
              ? (currentIndex -= howMuch)
              : (currentIndex += howMuch);

            // Sửa embed và cập nhật nút
            await interaction.editReply({
              embeds: [await generateEmbed(currentIndex)],
              components: [
                new ActionRowBuilder({
                  components: [
                    ...(currentIndex ? [backButton] : []),
                    deleteButton,
                    ...(currentIndex + howMuch < trackList.length ? [forwardButton] : []),
                  ],
                }),
              ],
            }).catch(e => {});
            await button?.deferUpdate().catch(e => {});
          }
        });

        // Kết thúc collector
        collector.on("end", async (button) => {
          button = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setStyle(ButtonStyle.Secondary)
              .setEmoji("⬅️")
              .setCustomId(backId)
              .setDisabled(true),
            new ButtonBuilder()
              .setStyle(ButtonStyle.Secondary)
              .setEmoji("❌")
              .setCustomId("close")
              .setDisabled(true),
            new ButtonBuilder()
              .setStyle(ButtonStyle.Secondary)
              .setEmoji("➡️")
              .setCustomId(forwardId)
              .setDisabled(true));

          const embed = new EmbedBuilder()
            .setTitle('Danh sách hàng đợi')
            .setColor(`#ecfc03`)
            .setDescription('Tự động sửa tin nhắn để ember ngắn gọn!')
            .setTimestamp();
          return interaction?.editReply({ embeds: [embed], components: [button] }).catch(e => {});
        });
      }).catch(e => {});

    } catch (e) {
      // Xử lý lỗi nếu có và ghi log
      console.error('Có lỗi xảy ra khi thực hiện lệnh Queue:', error);
      // Phản hồi cho người dùng với thông báo lỗi
      interaction.reply({ content: '⚠️ Đã xảy ra lỗi khi thực hiện lệnh này!', ephemeral: true }).catch(console.error);
    }
  }
}
