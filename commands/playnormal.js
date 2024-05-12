const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const db = require("../mongoDB");

module.exports = {
  name: "playsong",
  description: "Phát nhạc",
  permissions: "0x0000000000000800",
  options: [
    {
      name: "normal",
      description: "Mở nhạc từ các nền tảng khác - Hỗ trợ Spotify, Soundcloud, Deezer, Youtube.",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "name",
          description: "Viết tên nhạc của bạn - Hỗ trợ dán link.",
          type: ApplicationCommandOptionType.String,
          required: true
        }
      ]
    },
    {
      name: "playlist",
      description: "Phát danh sách Playlist của bạn.",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "name",
          description: "Viết tên danh sách phát bạn đã tạo.",
          type: ApplicationCommandOptionType.String,
          required: true
        }
      ]
    },
  ],
  voiceChannel: true,
  run: async (client, interaction) => {
    try {
      let stp = interaction.options.getSubcommand();

      // Kiểm tra xem người dùng chọn phát playlist hay bài nhạc thông thường
      if (stp === "playlist") {
        let playlistw = interaction.options.getString('name');
        let playlist = await db?.playlist?.find().catch(e => { });
        // Kiểm tra xem có playlist nào tồn tại không
        if (!playlist?.length > 0) return interaction.reply({ content: `❌ Không có Playlist!`, ephemeral: true }).catch(e => { });

        let arr = 0;
        // Duyệt qua từng playlist để tìm playlist được chọn
        for (let i = 0; i < playlist.length; i++) {
          if (playlist[i]?.playlist?.filter(p => p.name === playlistw)?.length > 0) {
            let playlist_owner_filter = playlist[i].playlist.filter(p => p.name === playlistw)[0].author;
            let playlist_public_filter = playlist[i].playlist.filter(p => p.name === playlistw)[0].public;

            // Kiểm tra quyền sở hữu playlist
            if (playlist_owner_filter !== interaction.member.id) {
              if (playlist_public_filter === false) {
                return interaction.reply({ content: `❌ Không có quyền phát Playlist!`, ephemeral: true }).catch(e => { });
              }
            }

            const music_filter = playlist[i]?.musics?.filter(m => m.playlist_name === playlistw);
            if (!music_filter?.length > 0) return interaction.reply({ content: `Không có tên nhạc nào như vậy!`, ephemeral: true }).catch(e => { });

            // Hiển thị embed thông báo đang tải playlist
            const listembed = new EmbedBuilder()
              .setTitle('Đang tải Playlist đã chọn')
              .setAuthor({
                name: 'Thêm Playlist vào hàng chờ!',
                iconURL: 'https://cdn.discordapp.com/attachments/1238866275363721226/1238866444482121748/diaquay.gif?ex=6640d7c9&is=663f8649&hm=40ade926b4b3a1b3bcfdadb02e1d0dbacec99f094542ae81341b4a24e03ef77f&', 
                url: 'https://discord.gg/Na6FFYMPW6'
              })
              .setColor('#FF0000')
              .setDescription('**Chuẩn bị phát nhạc rồi🍒!**')
              .setFooter({ text: 'Made By Cherry' })
              .setTimestamp();
            interaction.reply({ content : '', embeds: [listembed] }).catch(e => { });

            // Lấy danh sách các bài hát từ playlist
            let songs = [];
            music_filter.map(m => songs.push(m.music_url));

            // Tạo playlist tùy chỉnh và phát nhạc từ playlist đó
            setTimeout(async () => {
              const playl = await client?.player?.createCustomPlaylist(songs, {
                member: interaction.member,
                properties: { name: playlistw, source: "custom" },
                parallel: true
              });

              // Embed thông báo đã thêm playlist vào hàng chờ
              const qembed = new EmbedBuilder()
                .setAuthor({
                  name: 'Thêm Playlist vào hàng chờ!',
                  iconURL: 'https://cdn.discordapp.com/attachments/1238866275363721226/1238867547152060456/verify.png?ex=6640d8d0&is=663f8750&hm=e10391646957775a528d8b3baa273fceab1f2813b231333d93d2664102839058&', 
                  url: 'https://discord.gg/Na6FFYMPW6'
                })
                .setColor('#14bdff')
                .setFooter({ text: 'Sử dụng /queue để kiểm tra hàng chờ.' })
                .setFooter({ text: 'Made By Cherry' })
                .setTimestamp();

              await interaction.editReply({ content: '',embeds: [qembed] }).catch(e => {
                  console.error('Lỗi trả lời', e);
              });

              try {
                await client.player.play(interaction.member.voice.channel, playl, {
                  member: interaction.member,
                  textChannel: interaction.channel,
                  interaction
                });
              } catch (e) {
                await interaction.editReply({ content: `❌ Không có kết quả nào được tìm thấy!!`, ephemeral: true }).catch(e => { });
              }

              // Cập nhật số lượt phát của playlist
              playlist[i]?.playlist?.filter(p => p.name === playlistw).map(async p => {
                await db.playlist.updateOne({ userID: p.author }, {
                  $pull: {
                    playlist: {
                      name: playlistw
                    }
                  }
                }, { upsert: true }).catch(e => { });

                await db.playlist.updateOne({ userID: p.author }, {
                  $push: {
                    playlist: {
                      name: p.name,
                      author: p.author,
                      authorTag: p.authorTag,
                      public: p.public,
                      plays: Number(p.plays) + 1,
                      createdTime: p.createdTime
                    }
                  }
                }, { upsert: true }).catch(e => { });
              });
            }, 3000);
          } else {
            arr++;
            if (arr === playlist.length) {
              return interaction.reply({ content: `❌ Không có Playlist nào ở đây!`, ephemeral: true }).catch(e => { });
            }
          }
        }
      }

      // Nếu người dùng chọn phát bài nhạc thông thường
      if (stp === "normal") {
        const name = interaction.options.getString('name');
        if (!name) {
          return interaction.reply({ content: '▶️ Cung cấp văn bản hoặc liên kết', ephemeral: true }).catch(e => {});
        }

        // Embed thông báo đang tìm kiếm bài nhạc
        const embed = new EmbedBuilder()
          .setColor('#FF0000')
          .setDescription('**## 🍒 Đang tìm kiếm bản nhạc bạn cần nghe. . . .**')
          .setFooter({ text: 'Made By Cherry' })
          .setTimestamp();
        await interaction.reply({ embeds: [embed] }).catch(e => {});

        // Phát bài nhạc
        try {
          await client.player.play(interaction.member.voice.channel, name, {
            member: interaction.member,
            textChannel: interaction.channel,
            interaction
          });
        } catch (e) {
          // Embed thông báo không tìm thấy kết quả
          const errorEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setDescription('❌ Không có kết quả nào được tìm thấy!!')
            .setFooter({ text: 'Made By Cherry' })
            .setTimestamp();

          await interaction.editReply({ embeds: [errorEmbed], ephemeral: true }).catch(e => {});
        }
      }
    } catch (e) {
      // Ghi log lỗi
      console.error('Có lỗi xảy ra khi thực hiện các lệnh Playnormal:', error);
      // Phản hồi cho người dùng với thông báo lỗi
      interaction.reply({ content: '⚠️ Đã xảy ra lỗi khi thực hiện lệnh này!', ephemeral: true }).catch(console.error);
      
      // Xử lý lỗi và gửi thông báo
      const errorNotifer = require("../functions.js");
      errorNotifer(client, interaction, e, pint);
    }

  },
};
