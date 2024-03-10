const { ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../mongoDB');

module.exports = {
  name: "playlist",
  description: "Tạo một danh sách Playlist âm nhạc.",
  options: [
    {
      name: "create",
      description: "Tạo Playlist.",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "name",
          description: "Đặt tên cho Playlist đó.",
          type: ApplicationCommandOptionType.String,
          required: true
        },
        {
          name: "public",
          description: "Để công khai Playlist hay không? True Or False.",
          type: ApplicationCommandOptionType.Boolean,
          required: true
        }
      ]
    },
    {
      name: "delete",
      description: "Bạn muốn xóa Playlist này đi chứ?",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "name",
          description: "Viết Playlist mà bạn muốn xóa.",
          type: ApplicationCommandOptionType.String,
          required: true
        }
      ]
    },
    {
      name: "add-music",
      description: "Thêm bài nhạc vào Playlist.",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "playlist-name",
          description: "Viết tên Playlist đó.",
          type: ApplicationCommandOptionType.String,
          required: true
        },
        {
          name: "name",
          description: "Viết tên bài hát hoặc dán link đường dẫn.",
          type: ApplicationCommandOptionType.String,
          required: true
        }
      ]
    },
    {
      name: "delete-music",
      description: "Cho phép bạn xóa bài hát khỏi Album.",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "playlist-name",
          description: "Viết tên Playlist đó.",
          type: ApplicationCommandOptionType.String,
          required: true
        },
        {
          name: "name",
          description: "Viết tên bài hát đó.",
          type: ApplicationCommandOptionType.String,
          required: true
        }
      ]
    },
    {
      name: "song",
      description: "Xem danh sách bài hát trong Playlist",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "name",
          description: "Viết tên Playlist đó.",
          type: ApplicationCommandOptionType.String,
          required: true
        }
      ]
    },
    {
      name: "lists",
      description: "Xem tất cả các Playlist.",
      type: ApplicationCommandOptionType.Subcommand,
      options: []
    },
    {
      name: "top",
      description: "Playlist phổ biến nhất.",
      type: ApplicationCommandOptionType.Subcommand,
      options: []
    }
  ],
  permissions: "0x0000000000000800",
  run: async (client, interaction) => {
    try {
      let stp = interaction.options.getSubcommand()
      if (stp === "create") {
        let name = interaction.options.getString('name')
        let public = interaction.options.getBoolean('public')
        if (!name) return interaction.reply({ content: '⚠️ Nhập tên Playlist mà bạn muốn tạo!', ephemeral: true }).catch(e => { })

        const userplaylist = await db.playlist.findOne({ userID: interaction.user.id })

        const playlist = await db.playlist.find().catch(e => { })
        if (playlist?.length > 0) {
          for (let i = 0; i < playlist.length; i++) {
            if (playlist[i]?.playlist?.filter(p => p.name === name)?.length > 0) {
              return interaction.reply({ content: '⭕ Playlist này đã tồn tại.', ephemeral: true }).catch(e => { })
            }
          }
        }

        if (userplaylist?.playlist?.length >= client.config.playlistSettings.maxPlaylist) return interaction.reply({ content: '🚫 Đã vượt quá giới hạn Playlist.', ephemeral: true }).catch(e => { })

        const creatingAlbumEmbed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('Tạo Playlist')
          .setDescription(`🍒Chúc mừng <@${interaction.member.id}>, Playlist đã được tạo.`)
          .setFooter({ text: 'Made By Cherry' })
          .setTimestamp();

        await interaction.reply({
          content: '',
          embeds: [creatingAlbumEmbed]
        }).catch(e => {
          console.error('Lỗi tin nhắn:', e);
        });

        await db.playlist.updateOne({ userID: interaction.user.id }, {
          $push: {
            playlist: {
              name: name,
              author: interaction.user.id,
              authorTag: interaction.user.tag,
              public: public,
              plays: 0,
              createdTime: Date.now()
            }
          }
        }, { upsert: true }).catch(e => { })

        const albumCreatedEmbed = new EmbedBuilder()
  .setColor('#00ff00')
          .setAuthor({
            name: 'Playlist đã được tạo thành công.',
            iconURL: 'https://cdn.discordapp.com/attachments/1213421081226903552/1215554404527116288/7762-verified-blue.gif',
            url: 'https://discord.gg/Na6FFYMPW6'
          })
  .setDescription(`🍒Chúc mừng <@${interaction.member.id}>, Playlist đã được tạo thành công!`)
  .setFooter({ text: 'Made By Cherry' })
  .setTimestamp();

await interaction.editReply({
  content: '',
  embeds: [albumCreatedEmbed]
}).catch(e => {
  console.error('Lỗi khi chỉnh sửa cú pháp', e);
});
      }

      if (stp === "delete") {
        let name = interaction.options.getString('name')
        if (!name) return interaction.reply({ content: '⚠️ Nhập Playlist mà bạn đã tạo!', ephemeral: true }).catch(e => { })

        const playlist = await db.playlist.findOne({ userID: interaction.user.id }).catch(e => { })
        if (!playlist?.playlist?.filter(p => p.name === name).length > 0) return interaction.reply({ content: '❌ Không tìm thấy Playlist đó.', ephemeral: true }).catch(e => { })

        const music_filter = playlist?.musics?.filter(m => m.playlist_name === name)
        if (music_filter?.length > 0){
          await db.playlist.updateOne({ userID: interaction.user.id }, {
            $pull: {
              musics: {
                playlist_name: name
              }
            }
          }).catch(e => { })
        }

       const deletingAlbumEmbed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('Xóa Playlist')
          .setDescription(`🍒Chịu rồi <@${interaction.member.id}>, Playlist của bạn đã bị xóa!`)
          .setFooter({ text: 'Made By Cherry' })
          .setTimestamp();
          

        await interaction.reply({
          content: '',
          embeds: [deletingAlbumEmbed]
        }).catch(e => {
          console.error('Lỗi gửi tin nhắn:', e);
        });

        await db.playlist.updateOne({ userID: interaction.user.id }, {
          $pull: {
            playlist: {
              name: name
            }
          }
        }, { upsert: true }).catch(e => { })

         const albumDeleteEmbed = new EmbedBuilder()
  .setColor('#00ff00')
          .setAuthor({
            name: 'Xóa Playlist thành công',
            iconURL: 'https://cdn.discordapp.com/attachments/1213421081226903552/1215554404527116288/7762-verified-blue.gif',
            url: 'https://discord.gg/Na6FFYMPW6'
          })
  .setDescription(`🍒Chịu rồi <@${interaction.member.id}>, bạn đã xóa thành công Playlist!`)
  .setFooter({ text: 'Made By Cherry' })
  .setTimestamp();

await interaction.editReply({
  content: '',
  embeds: [albumDeleteEmbed]
}).catch(e => {
  console.error('Lỗi chỉnh sửa tin nhắn:', e);
});
      }

      if (stp === "add-music") {
        let name = interaction.options.getString('name')
        if (!name) return interaction.reply({ content: '🎀 Nhập tên bài hát tìm kiếm!', ephemeral: true }).catch(e => { })
        let playlist_name = interaction.options.getString('playlist-name')
        if (!playlist_name) return interaction.reply({ content: '⚠️ Nhập tên Playlist muốn thêm nhạc!', ephemeral: true }).catch(e => { })

        const playlist = await db.playlist.findOne({ userID: interaction.user.id }).catch(e => { })
        if (!playlist?.playlist?.filter(p => p.name === playlist_name).length > 0) return interaction.reply({ content: 'Thêm nhạc thành công!', ephemeral: true }).catch(e => { })

        let max_music = client.config.playlistSettings.maxMusic
        if (playlist?.musics?.filter(m => m.playlist_name === playlist_name).length > max_music) return interaction.reply({ content: "Đã đạt đến giới hạn bài hát trong Playlist".replace("{max_music}", max_music), ephemeral: true }).catch(e => { })
        let res 
        try{
          res = await client.player.search(name, {
            member: interaction.member,
            textChannel: interaction.channel,
            interaction
          })
        } catch (e) {
          return interaction.reply({ content: '❌ Không thể tìm thấy', ephemeral: true }).catch(e => { })
        }
        if (!res || !res.length || !res.length > 1) return interaction.reply({ content: `❌ Không thể tìm thấy `, ephemeral: true }).catch(e => { })
        const loadingembed = new EmbedBuilder()
        .setColor('#0099ff')
       .setAuthor({
          name: 'Bài hát đã thêm vào Playlist!',
          iconURL: 'https://cdn.discordapp.com/attachments/1213421081226903552/1213430944007061574/6943_Verified.gif',
          url: 'https://discord.gg/Na6FFYMPW6'
        })
        .setDescription(`🍒Chúc mừng <@${interaction.member.id}>, bạn đã thêm bài hát thành công!`)
        .setFooter({ text: 'Made By Cherry' })
        .setTimestamp();
        await interaction.reply({
  content: '',
  embeds: [ loadingembed ] 
}).catch(e => {
  console.error('Lỗi khi gửi tin nhắn:', e);
});

        const music_filter = playlist?.musics?.filter(m => m.playlist_name === playlist_name && m.music_name === res[0]?.name)
        if (music_filter?.length > 0) return interaction.editReply({ content: ' ❌ Bài hát đã có trong Playlist', ephemeral: true }).catch(e => { })

        await db.playlist.updateOne({ userID: interaction.user.id }, {
          $push: {
            musics: {
              playlist_name: playlist_name,
              music_name: res[0]?.name,
              music_url: res[0]?.url, 
              saveTime: Date.now()
            }
          }
        }, { upsert: true }).catch(e => { })

        await interaction.editReply({ content: `<@${interaction.member.id}>, \`${res[0]?.name}\` ` }).catch(e => { })

      }

      if (stp === "delete-music") {
        let name = interaction.options.getString('name')
        if (!name) return interaction.reply({ content: '⚠️ Nhập bài hát bạn tìm kiếm!', ephemeral: true }).catch(e => { })
        let playlist_name = interaction.options.getString('playlist-name')
        if (!playlist_name) return interaction.reply({ content: '⚠️ Nhập tên Playlist cần xóa bài hát!', ephemeral: true }).catch(e => { })

        const playlist = await db.playlist.findOne({ userID: interaction.user.id }).catch(e => { })
        if (!playlist?.playlist?.filter(p => p.name === playlist_name).length > 0) return interaction.reply({ content: '❌ Không thấy Playlist!', ephemeral: true }).catch(e => { })

        const music_filter = playlist?.musics?.filter(m => m.playlist_name === playlist_name && m.music_name === name)
        if (!music_filter?.length > 0) return interaction.reply({ content: `❌ Không thấy bài hát!`, ephemeral: true }).catch(e => { })

         const deletingSongEmbed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('Xóa bỏ bài hát.')
          .setDescription(`🍒Ơ kìa <@${interaction.member.id}>, bài hát của bạn đã bị xóa!`)
          .setFooter({ text: 'Made By Cherry' })
          .setTimestamp();

        await interaction.reply({
          content: '',
          embeds: [deletingSongEmbed]
        }).catch(e => {
          console.error('Lỗi gửi tin nhắn:', e);
        });

        await db.playlist.updateOne({ userID: interaction.user.id }, {
          $pull: {
            musics: {
              playlist_name: playlist_name,
              music_name: name
            }
          }
        }, { upsert: true }).catch(e => { })

         const songDeleteEmbed = new EmbedBuilder()
  .setColor('#00ff00')
          .setAuthor({
            name: 'Xóa bài hát thành công!',
            iconURL: 'https://cdn.discordapp.com/attachments/1213421081226903552/1215554404527116288/7762-verified-blue.gif',
            url: 'https://discord.gg/Na6FFYMPW6'
          })
  .setDescription(`🍒Ơ kìa <@${interaction.member.id}>, bạn đã xóa nhạc thành công!`)
  .setFooter({ text: 'Made By Cherry' })
  .setTimestamp();

await interaction.editReply({
  content: '',
  embeds: [songDeleteEmbed]
}).catch(e => {
  console.error('Lỗi tin nhắn chỉnh sửa:', e);
});
      }

      if (stp === "song") {
        let name = interaction.options.getString('name')
        if (!name) return interaction.reply({ content: '🔍 Nhập tên Playlist để tìm!', ephemeral: true }).catch(e => { })

        let trackl

        const playlist = await db.playlist.find().catch(e => { })
        if (!playlist?.length > 0) return interaction.reply({ content: `🚫 Không có tên Playlist!`, ephemeral: true }).catch(e => { })

        let arr = 0
        for (let i = 0; i < playlist.length; i++) {
          if (playlist[i]?.playlist?.filter(p => p.name === name)?.length > 0) {

            let playlist_owner_filter = playlist[i].playlist.filter(p => p.name === name)[0].author
            let playlist_public_filter = playlist[i].playlist.filter(p => p.name === name)[0].public

            if (playlist_owner_filter !== interaction.member.id) {
              if (playlist_public_filter === false) {
                return interaction.reply({ content: '🚫 Bạn không thể phát Playlist này!', ephemeral: true }).catch(e => { })
              }
            }

            trackl = await playlist[i]?.musics?.filter(m => m.playlist_name === name)
            if (!trackl?.length > 0) return interaction.reply({ content: '😺 Playlist này chưa có nhạc, hãy thêm vô nhé!', ephemeral: true }).catch(e => { })

          } else {
            arr++
            if (arr === playlist.length) {
              return interaction.reply({ content: '❌ Không thấy Playlist nào!', ephemeral: true }).catch(e => { })
            }
          }
        }

        const backId = "emojiBack"
        const forwardId = "emojiForward"
        const backButton = new ButtonBuilder({
          style: ButtonStyle.Secondary,
          emoji: "◀️",
          customId: backId
        });

        const deleteButton = new ButtonBuilder({
          style: ButtonStyle.Secondary,
          emoji: "🚫",
          customId: "close"
        });

        const forwardButton = new ButtonBuilder({
          style: ButtonStyle.Secondary,
          emoji: "▶️",
          customId: forwardId
        });


        let howmuch = 8
        let page = 1
        let a = trackl.length / howmuch

        const generateEmbed = async (start) => {
          let sayı = page === 1 ? 1 : page * howmuch - howmuch + 1
          const current = trackl.slice(start, start + howmuch)
          if (!current || !current?.length > 0) return interaction.reply({ content: '😺 Playlist này chưa có nhạc, hãy thêm vô nhé!', ephemeral: true }).catch(e => { })
          return new EmbedBuilder()
           .setAuthor({
          name: 'Playlist nhạc!',
          iconURL: 'https://cdn.discordapp.com/attachments/1213421081226903552/1213422313035407360/8218-alert.gif',
          url: 'https://discord.gg/Na6FFYMPW6'
        })
            .setThumbnail(interaction.user.displayAvatarURL({ size: 2048, dynamic: true }))
            .setColor(client.config.embedColor) 
            .setDescription(`\n${current.map(data =>
              `\n\`${sayı++}\` | [${data.music_name}](${data.music_url}) - <t:${Math.floor(data.saveTime / 1000) }:R>`
            ) }`)
            .setFooter({ text: `Trang ${page}/${Math.floor(a+1) }` })
            .setTimestamp();
        }

        const canFitOnOnePage = trackl.length <= howmuch

        await interaction.reply({
          embeds: [await generateEmbed(0)],
          components: canFitOnOnePage
            ? []
            : [new ActionRowBuilder({ components: [deleteButton, forwardButton] })],
          fetchReply: true
        }).then(async Message => {
          const filter = i => i.user.id === interaction.user.id
          const collector = Message.createMessageComponentCollector({ filter, time: 30000 });


          let currentIndex = 0
          collector.on("collect", async (button) => {
            if (button.customId === "close") {
              collector.stop()
              return button.reply({ content: `Đã hủy lệnh ❌`, ephemeral: true }).catch(e => { })
            } else {

              if (button.customId === backId) {
                page--
              }
              if (button.customId === forwardId) {
                page++
              }

              button.customId === backId
                ? (currentIndex -= howmuch)
                : (currentIndex += howmuch)

              await interaction.editReply({
                embeds: [await generateEmbed(currentIndex)],
                components: [
                  new ActionRowBuilder({
                    components: [
                      ...(currentIndex ? [backButton] : []),
                      deleteButton,
                      ...(currentIndex + howmuch < trackl.length ? [forwardButton] : []),
                    ],
                  }),
                ],
              }).catch(e => { })
              await button.deferUpdate().catch(e => {})
            }
          })

          collector.on("end", async (button) => {
            button = new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("◀️")
                .setCustomId(backId)
                .setDisabled(true),
              new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("🚫")
                .setCustomId("close")
                .setDisabled(true),
              new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("▶️")
                .setCustomId(forwardId)
                .setDisabled(true))

            const embed = new EmbedBuilder()
              .setTitle(`${name}`)
              .setThumbnail(interaction.user.displayAvatarURL({ size: 2048, dynamic: true }))
              .setColor(client.config.embedColor)
              .setDescription('Time Out!!! Hãy thử lại lệnh nhé!'.replace("{name}", name))
              .setFooter({ text: 'Made By Cherry' })
              .setTimestamp();
            return interaction.editReply({ embeds: [embed], components: [button] }).catch(e => { })

          })
        }).catch(e => { })

      }

      if (stp === "lists") {
        const playlist = await db?.playlist?.findOne({ userID: interaction.user.id }).catch(e => { })
        if (!playlist?.playlist?.length > 0) return interaction.reply({ content: `💦 Bạn chưa tạo Playlist nào!`, ephemeral: true }).catch(e => { })

        let number = 1
        const embed = new EmbedBuilder()
          .setAuthor({
            name: 'Playlist của tôi!',
            iconURL: 'https://cdn.discordapp.com/attachments/1213421081226903552/1213422313035407360/8218-alert.gif',
            url: 'https://discord.gg/Na6FFYMPW6'
          })
          .setColor(client.config.embedColor)
          .setDescription(`\n${playlist?.playlist?.map(data =>
            `\n**${number++} |** \`${data.name}\` - **${playlist?.musics?.filter(m => m.playlist_name === data.name)?.length || 0}** bài hát (** đã tạo từ ** <t:${Math.floor(data.createdTime / 1000) }:R> )`
          ) }`)
          .setFooter({ text: 'Made By Cherry' })
          .setTimestamp();
        return interaction.reply({ embeds: [embed] }).catch(e => { }) 

      }

      if (stp === "top") {
        let playlists = await db?.playlist?.find().catch(e => { })
        if (!playlists?.length > 0) return interaction.reply({ content: '🍒 Không có Playlist nào cả!', ephemeral: true }).catch(e => { })

        let trackl = []
        playlists.map(async data => {
          data.playlist.filter(d => d.public === true).map(async d => {
            let filter = data.musics.filter(m => m.playlist_name === d.name)
            if (filter.length > 0) {
              trackl.push(d)
            }
          })
        })

        trackl = trackl.filter(a => a.plays > 0) 

        if (!trackl?.length > 0) return interaction.reply({ content: '🍒 Không có Playlist nào cả!', ephemeral: true }).catch(e => { })

        trackl = trackl.sort((a, b) => b.plays - a.plays)

        const backId = "emojiBack"
        const forwardId = "emojiForward"
        const backButton = new ButtonBuilder({
          style: ButtonStyle.Secondary,
          emoji: "◀️",
          customId: backId
        });

        const deleteButton = new ButtonBuilder({
          style: ButtonStyle.Secondary,
          emoji: "🚫",
          customId: "close"
        });

        const forwardButton = new ButtonBuilder({
          style: ButtonStyle.Secondary,
          emoji: "▶️",
          customId: forwardId
        });


        let howmuch = 8
        let page = 1
        let a = trackl.length / howmuch

        const generateEmbed = async (start) => {
          let sayı = page === 1 ? 1 : page * howmuch - howmuch + 1
          const current = trackl.slice(start, start + howmuch)
          if (!current || !current?.length > 0) return interaction.reply({ content: `🍒 Không có Playlist nào cả!`, ephemeral: true }).catch(e => { })
          return new EmbedBuilder()
            .setAuthor({
              name: 'Top những Playlist!',
              iconURL: 'https://cdn.discordapp.com/attachments/1213421081226903552/1213422313035407360/8218-alert.gif',
              url: 'https://discord.gg/Na6FFYMPW6'
            })
            .setThumbnail(interaction.user.displayAvatarURL({ size: 2048, dynamic: true }))
            .setColor(client.config.embedColor)
            .setDescription(`\n${current.map(data =>
              `\n**${sayı++} |** \`${data.name}\` tạo bởi \`${data.authorTag}\` - *đã có* **${data.plays}** *lượt phát* (** đã tạo từ **<t:${Math.floor(data.createdTime / 1000) }:R> )`
            ) }`)
            .setFooter({ text: `Trang ${page}/${Math.floor(a+1) }` })
            .setTimestamp();
        }

        const canFitOnOnePage = trackl.length <= howmuch

        await interaction.reply({
          embeds: [await generateEmbed(0)],
          components: canFitOnOnePage
            ? []
            : [new ActionRowBuilder({ components: [deleteButton, forwardButton] })],
          fetchReply: true
        }).then(async Message => {
          const filter = i => i.user.id === interaction.user.id
          const collector = Message.createMessageComponentCollector({ filter, time: 30000 });


          let currentIndex = 0
          collector.on("collect", async (button) => {
            if (button.customId === "close") {
              collector.stop()
              return button.reply({ content: `Đã dừng lệnh 🍒`, ephemeral: true }).catch(e => { })
            } else {

              if (button.customId === backId) {
                page--
              }
              if (button.customId === forwardId) {
                page++
              }

              button.customId === backId
                ? (currentIndex -= howmuch)
                : (currentIndex += howmuch)

              await interaction.editReply({
                embeds: [await generateEmbed(currentIndex)],
                components: [
                  new ActionRowBuilder({
                    components: [
                      ...(currentIndex ? [backButton] : []),
                      deleteButton,
                      ...(currentIndex + howmuch < trackl.length ? [forwardButton] : []),
                    ],
                  }),
                ],
              }).catch(e => { })
              await button.deferUpdate().catch(e => {})
            }
          })

          collector.on("end", async (button) => {
            button = new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("◀️")
                .setCustomId(backId)
                .setDisabled(true),
              new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("🚫")
                .setCustomId("close")
                .setDisabled(true),
              new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("▶️")
                .setCustomId(forwardId)
                .setDisabled(true))

            const embed = new EmbedBuilder()
              .setAuthor({
          name: 'Top những Playlist!',
          iconURL: 'https://cdn.discordapp.com/attachments/1213421081226903552/1213422313035407360/8218-alert.gif',
          url: 'https://discord.gg/Na6FFYMPW6'
        })
              .setThumbnail(interaction.user.displayAvatarURL({ size: 2048, dynamic: true }))
              .setColor(client.config.embedColor)
              .setDescription('Tự động sửa tin nhắn để ember ngắn gọn!')
              .setFooter({ text: 'Made By Cherry' })
              .setTimestamp();
            return interaction.editReply({ embeds: [embed], components: [button] }).catch(e => { })

          })
          
        }).catch(e => { })

      }
    } catch (e) {
      console.error(e);
      interaction.reply({ content: 'Đã xảy ra lỗi khi thực hiện lệnh này🍒!', ephemeral: true }).catch(e => { })
    }
  }
}
    