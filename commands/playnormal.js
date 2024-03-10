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
      let stp = interaction.options.getSubcommand()

      if (stp === "playlist") {
        let playlistw = interaction.options.getString('name')
        let playlist = await db?.playlist?.find().catch(e => { })
        if (!playlist?.length > 0) return interaction.reply({ content: `❌ Không có Playlist!`, ephemeral: true }).catch(e => { })

        let arr = 0
        for (let i = 0; i < playlist.length; i++) {
          if (playlist[i]?.playlist?.filter(p => p.name === playlistw)?.length > 0) {

            let playlist_owner_filter = playlist[i].playlist.filter(p => p.name === playlistw)[0].author
            let playlist_public_filter = playlist[i].playlist.filter(p => p.name === playlistw)[0].public

            if (playlist_owner_filter !== interaction.member.id) {
              if (playlist_public_filter === false) {
                return interaction.reply({ content: `❌ Không có quyền phát Playlist!`, ephemeral: true }).catch(e => { })
              }
            }

            const music_filter = playlist[i]?.musics?.filter(m => m.playlist_name === playlistw)
            if (!music_filter?.length > 0) return interaction.reply({ content: `Không có tên nhạc nào như vậy!`, ephemeral: true }).catch(e => { })
            const listembed = new EmbedBuilder()
            .setTitle('Đang tải Playlist')
            .setColor('#FF0000')
            .setDescription('**Chuẩn bị phát nhạc rồi🍒!**')
            .setFooter({ text: 'Made By Cherry' })
            .setTimestamp();
        interaction.reply({ content : '', embeds: [listembed] }).catch(e => { })

            let songs = []
            music_filter.map(m => songs.push(m.music_url))

            setTimeout(async () => {
              const playl = await client?.player?.createCustomPlaylist(songs, {
                member: interaction.member,
                properties: { name: playlistw, source: "custom" },
                parallel: true
              });

              const qembed = new EmbedBuilder()
        .setAuthor({
        name: 'Thêm Playlist vào hàng chờ!',
        iconURL: 'https://cdn.discordapp.com/attachments/1156866389819281418/1157218651179597884/1213-verified.gif', 
        url: 'https://discord.gg/Na6FFYMPW6'
    })
        .setColor('#14bdff')
        .setFooter({ text: 'Sử dụng /queue để kiểm tra hàng chờ.' })
        .setTimestamp();

              await interaction.editReply({ content: '',embeds: [qembed] }).catch(e => {
                  console.error('Lỗi trả lời', e);
                });

              try {
                await client.player.play(interaction.member.voice.channel, playl, {
                  member: interaction.member,
                  textChannel: interaction.channel,
                  interaction
                })
              } catch (e) {
                await interaction.editReply({ content: `❌ Không có kết quả nào được tìm thấy!!`, ephemeral: true }).catch(e => { })
              }

              playlist[i]?.playlist?.filter(p => p.name === playlistw).map(async p => {
                await db.playlist.updateOne({ userID: p.author }, {
                  $pull: {
                    playlist: {
                      name: playlistw
                    }
                  }
                }, { upsert: true }).catch(e => { })

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
                }, { upsert: true }).catch(e => { })
              })
            }, 3000)
          } else {
            arr++
            if (arr === playlist.length) {
              return interaction.reply({ content: `❌ Không có Playlist nào ở đây!`, ephemeral: true }).catch(e => { })
            }
          }
        }
      }

      if (stp === "normal") {
  const name = interaction.options.getString('name');
  if (!name) {
    return interaction.reply({ content: '▶️ Cung cấp văn bản hoặc liên kết', ephemeral: true }).catch(e => {});
  }

  const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setDescription('**🍒 Đang tìm kiếm bản nhạc bạn cần nghe. . . .** \n**😻 Sử dụng soucre code của Cherry xin vui lòng ghi nguồn!**')
        .setFooter({ text: 'Made By Cherry' })
        .setTimestamp();
        await interaction.reply({ embeds: [embed] }).catch(e => {});

  try {
    await client.player.play(interaction.member.voice.channel, name, {
      member: interaction.member,
      textChannel: interaction.channel,
      interaction
    });
  } catch (e) {
    const errorEmbed = new EmbedBuilder()
      .setColor('#FF0000')
      .setDescription('❌ Không có kết quả nào được tìm thấy!!')
      .setFooter({ text: 'Made By Cherry' })
      .setTimestamp();

    await interaction.editReply({ embeds: [errorEmbed], ephemeral: true }).catch(e => {});
  }
}

    } catch (e) {
      const errorNotifer = require("../functions.js")
      errorNotifer(client, interaction, e, pint)
    }
  },
};
