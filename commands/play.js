const { ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require("../mongoDB");
const { opt } = require("../config.js");

// Lấy thumbailUrl ảnh
let selectedThumbnailURL;
module.exports.selectedThumbnailURL = selectedThumbnailURL;

module.exports = {
  name: "play",
  description: "Phát nhạc (Mặc định phát nhạc là YouTube)!",
  permissions: "0x0000000000000800",
  options: [{
    name: 'name',
    description: 'Nhập tên nhạc bạn muốn phát.',
    type: ApplicationCommandOptionType.String,
    required: true
  }],
  voiceChannel: true,
  run: async (client, interaction) => {
    try {
      // Lấy tên bài hát từ lựa chọn
      const name = interaction.options.getString('name');
      // Kiểm tra tên bài hát xem có hợp lệ hay không
      if (!name) return interaction.reply({ content: `❌ Nhập tên bài hát hợp lệ.`, ephemeral: true }).catch(e => { });

      let res;
      try {
        // Khởi động tìm kiếm dựa vào tên
        res = await client.player.search(name, {
          member: interaction.member,
          textChannel: interaction.channel,
          interaction
        });
      } catch (e) {
        // Trả về nếu không có kết quả
        return interaction.editReply({ content: `❌ Không có kết quả` }).catch(e => { });
      }

      // Kiểm tra xem có kết quả nào không
      if (!res || !res.length || !res.length > 1) return interaction.reply({ content: `❌ Không có kết quả`, ephemeral: true }).catch(e => { });

      // Tạo Embed để hiển thị kết quả tìm kiếm
      const embed = new EmbedBuilder();
      embed.setColor(client.config.embedColor);
      embed.setFooter({ text: 'Made By Cherry' });
      embed.setTitle(`🔍 [| **Thanh Tìm Kiểm:** *${name}* |]`);
      embed.setTimestamp();

      // Lấy danh sách các bài hát tìm được (tối đa 10 bài hát)
      const maxTracks = res.slice(0, 10);

      // Tạo các nút chọn bài hát
      let track_button_creator = maxTracks.map((song, index) => {
        return new ButtonBuilder()
          .setLabel(`${index + 1}`)
          .setStyle(ButtonStyle.Secondary)
          .setCustomId(`${index + 1}`);
      });

      // Phân chia nút chọn thành các hàng
      let buttons1;
      let buttons2;
      if (track_button_creator.length > 10) {
        buttons1 = new ActionRowBuilder().addComponents(track_button_creator.slice(0, 5));
        buttons2 = new ActionRowBuilder().addComponents(track_button_creator.slice(5, 10));
      } else {
        if (track_button_creator.length > 5) {
          buttons1 = new ActionRowBuilder().addComponents(track_button_creator.slice(0, 5));
          buttons2 = new ActionRowBuilder().addComponents(track_button_creator.slice(5, Number(track_button_creator.length)));
        } else {
          buttons1 = new ActionRowBuilder().addComponents(track_button_creator);
        }
      } 
      
      // Tạo nút hủy
      let cancel = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Hủy")
          .setStyle(ButtonStyle.Danger)
          .setCustomId('cancel')
      );

      // Thiết lập thông điệp và nút chọn trong Embed
      embed.setDescription(`${maxTracks.map((song, i) => `**${i + 1}**. [${song.name}](${song.url}) | \`Tác giả: ${song.uploader.name}\``).join('\n')}\n\n✨Chọn một bài hát từ bên dưới!!`);
      embed.setFooter({ text: 'Made By Cherry' });
      embed.setTimestamp();

      // Tạo mã để gửi Embed và các nút 
      let code;
      if (buttons1 && buttons2) {
        code = { embeds: [embed], components: [buttons1, buttons2, cancel] };
      } else {
        code = { embeds: [embed], components: [buttons1, cancel] };
      }

      // Gửi Embed và các nút và xử lý phản hồi từ người dùng
      interaction.reply(code).then(async Message => {
        const filter = i => i.user.id === interaction.user.id;
        let collector = await Message.createMessageComponentCollector({ filter, time: 30000 });

        collector.on('collect', async (button) => {
          switch (button.customId) {
            case 'cancel': {
              // Người dùng hủy tìm kiếm, dừng thu thập
              embed.setDescription(`Tìm kiếm bị gián đoạn`);
              await interaction.editReply({ embeds: [embed], components: [] }).catch(e => { });
              return collector.stop();
            }
            break;
            default: {
              // Người dùng chọn một bài hát để phát
              selectedThumbnailURL = maxTracks[Number(button.customId) - 1].thumbnail;
              embed.setThumbnail(selectedThumbnailURL);
              embed.setDescription(`## *Đang phát bài hát:* [${res[Number(button.customId) - 1].name}](${res[Number(button.customId) - 1].url})`);
              await interaction.editReply({ embeds: [embed], components: [] }).catch(e => { });
              try {
                // Phát bài hát được chọn
                await client.player.play(interaction.member.voice.channel, res[Number(button.customId) - 1].url, {
                  member: interaction.member,
                  textChannel: interaction.channel,
                  interaction
                });
              } catch (e) {
                // Xử lý lỗi nếu không thể phát bài hát
                await interaction.editReply({ content: `❌ Không có kết quả!`, ephemeral: true }).catch(e => { });
              }
              return collector.stop();
            }
          }
        });
        // Sửa tin nhắn ember cho ngắn gọn
        collector.on('end', (msg, reason) => {
          if (reason === 'time') {
            embed.setDescription("**😺 Phát hiện chưa lựa chọn nhạc sau 30 giây.**\n **🍒 Tự động sửa tin nhắn để ember ngắn gọn!**");
            embed.setFooter({ text: 'Made By Cherry' });
            embed.setTimestamp();
            return interaction.editReply({ embeds: [embed], components: [] }).catch(e => { });
          }
        });
      }).catch(e => { });
    } catch (e) {
      // Xử lý lỗi nếu có và ghi log
      console.error('Có lỗi xảy ra khi thực hiện lệnh Play:', error);
      // Phản hồi cho người dùng với thông báo lỗi
      interaction.reply({ content: '⚠️ Đã xảy ra lỗi khi thực hiện lệnh này!', ephemeral: true }).catch(console.error);
    }
  },
};
