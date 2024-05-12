const { ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../mongoDB');

module.exports = {
  name: "playlist",
  description: "Tạo một danh sách Playlist âm nhạc.",
  options: [
    {
      // Tùy chọn "create" để tạo mới một playlist
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
      // Tùy chọn "delete" để xóa một playlist
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
      // Tùy chọn "add-music" để thêm một bài hát vào playlist
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
      // Tùy chọn "delete-music" để xóa một bài hát khỏi playlist
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
      // Tùy chọn "song" để xem danh sách bài hát trong playlist
      name: "song",
      description: "Xem danh sách bài hát trong Playlist.",
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
      // Tùy chọn "lists" để xem tất cả các playlist
      name: "lists",
      description: "Xem tất cả các Playlist.",
      type: ApplicationCommandOptionType.Subcommand,
      options: []
    },
    {
      // Tùy chọn "top" để xem playlist phổ biến nhất
      name: "top",
      description: "Playlist phổ biến nhất.",
      type: ApplicationCommandOptionType.Subcommand,
      options: []
    }
  ],
  permissions: "0x0000000000000800",
  run: async (client, interaction) => {
    try {
      // Lấy subcommand mà người dùng đã chọn
      let stp = interaction.options.getSubcommand()
      // Xử lý khi subcommand là "create"
      if (stp === "create") {
        // Lấy tên và công khai của playlist từ người dùng
        let name = interaction.options.getString('name')
        let public = interaction.options.getBoolean('public')
        // Kiểm tra xem tên playlist đã được nhập hay chưa
        if (!name) return interaction.reply({ content: '⚠️ Nhập tên Playlist mà bạn muốn tạo!', ephemeral: true }).catch(e => { })

        // Kiểm tra xem người dùng đã đạt đến giới hạn số playlist được tạo chưa
        const userplaylist = await db.playlist.findOne({ userID: interaction.user.id })

        const playlist = await db.playlist.find().catch(e => { })
        if (playlist?.length > 0) {
          // Kiểm tra xem playlist đã tồn tại chưa
          for (let i = 0; i < playlist.length; i++) {
            if (playlist[i]?.playlist?.filter(p => p.name === name)?.length > 0) {
              return interaction.reply({ content: '⭕ Playlist này đã tồn tại.', ephemeral: true }).catch(e => { })
            }
          }
        }

        // Kiểm tra xem người dùng đã đạt đến giới hạn số playlist được tạo chưa
        if (userplaylist?.playlist?.length >= client.config.playlistSettings.maxPlaylist) return interaction.reply({ content: '🚫 Đã vượt quá giới hạn Playlist.', ephemeral: true }).catch(e => { })

        // Tạo embed thông báo cho việc tạo playlist thành công
        const creatingAlbumEmbed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('Tạo Playlist')
          .setDescription(`🍒Chúc mừng <@${interaction.member.id}> đã tạo thành công 1 Playlist.`)
          .setFooter({ text: 'Made By Cherry' })
          .setTimestamp();

        // Gửi embed thông báo
        await interaction.reply({
          content: '',
          embeds: [creatingAlbumEmbed]
        }).catch(e => {
          // Xử lý lỗi nếu có và ghi log
          console.error('Có lỗi xảy ra khi thực hiện các lệnh Playlist', error);
        });

        // Cập nhật thông tin trong database để lưu trữ playlist của người dùng
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

        // Tạo embed thông báo cho việc tạo playlist thành công
        const albumCreatedEmbed = new EmbedBuilder()
  .setColor('#00ff00')
          .setAuthor({
            name: 'Playlist đã được tạo thành công.',
            iconURL: 'https://cdn.discordapp.com/attachments/1238866275363721226/1238867547152060456/verify.png?ex=6640d8d0&is=663f8750&hm=e10391646957775a528d8b3baa273fceab1f2813b231333d93d2664102839058&',
            url: 'https://discord.gg/Na6FFYMPW6'
          })
  .setDescription(`🍒Chúc mừng <@${interaction.member.id}> đã tạo thành công 1 Playlist!`)
  .setFooter({ text: 'Made By Cherry' })
  .setTimestamp();

// Chỉnh sửa lại tin nhắn tạo thành công Playlist
await interaction.editReply({
  content: '',
  embeds: [albumCreatedEmbed]
}).catch(e => {
  // Xử lý lỗi nếu có và ghi log
  console.error('Lỗi khi chỉnh sửa lại tin nhắn của Playlist', error);
});
      }
      // Xử lý khi subcommand là "delete"
      if (stp === "delete") {
        // Lấy tên playlist từ người dùng
        let name = interaction.options.getString('name')
        // Kiểm tra xem tên playlist đã được nhập hay chưa
        if (!name) return interaction.reply({ content: '⚠️ Nhập Playlist mà bạn đã tạo!', ephemeral: true }).catch(e => { })

        // Kiểm tra xem playlist có tồn tại chưa
        const playlist = await db.playlist.findOne({ userID: interaction.user.id }).catch(e => { })
        if (!playlist?.playlist?.filter(p => p.name === name).length > 0) return interaction.reply({ content: '❌ Không tìm thấy Playlist đó.', ephemeral: true }).catch(e => { })

        // Cập nhật thông tin trong database về playlist của người dùng
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

      // Gửi thông báo cho việc xóa playlist thành công
      const deletingAlbumEmbed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('Xóa Playlist')
          .setDescription(`🍒Chịu rồi <@${interaction.member.id}> đã xóa 1 Playlist!`)
          .setFooter({ text: 'Made By Cherry' })
          .setTimestamp();
          

        await interaction.reply({
          content: '',
          embeds: [deletingAlbumEmbed]
        }).catch(e => {
          // Xử lý lỗi nếu có và ghi log
          console.error('Lỗi gửi tin nhắn của lệnh Playlist', error);
        });

        // Xóa playlist từ database
        await db.playlist.updateOne({ userID: interaction.user.id }, {
          $pull: {
            playlist: {
              name: name
            }
          }
        }, { upsert: true }).catch(e => { })

        // Gửi thông báo cho việc xóa playlist thành công
         const albumDeleteEmbed = new EmbedBuilder()
  .setColor('#00ff00')
          .setAuthor({
            name: 'Xóa Playlist thành công',
            iconURL: 'https://cdn.discordapp.com/attachments/1238866275363721226/1238867547152060456/verify.png?ex=6640d8d0&is=663f8750&hm=e10391646957775a528d8b3baa273fceab1f2813b231333d93d2664102839058&',
            url: 'https://discord.gg/Na6FFYMPW6'
          })
  .setDescription(`🍒Chịu rồi <@${interaction.member.id}> đã xóa thành công Playlist!`)
  .setFooter({ text: 'Made By Cherry' })
  .setTimestamp();

// Chỉnh sửa lại tin nhắn ember
await interaction.editReply({
  content: '',
  embeds: [albumDeleteEmbed]
}).catch(e => {
  // Xử lý lỗi nếu có và ghi log
  console.error('Lỗi chỉnh sửa tin nhắn của lệnh Playlist', error);
});
      }
      // Xử lý khi subcommand là "add-music"
      if (stp === "add-music") {
        // Lấy tên playlist và tên bài hát từ người dùng
        let name = interaction.options.getString('name')
        if (!name) return interaction.reply({ content: '🎀 Nhập tên bài hát tìm kiếm!', ephemeral: true }).catch(e => { })
        let playlist_name = interaction.options.getString('playlist-name')
        // Kiểm tra xem tên playlist và tên bài hát đã được nhập hay chưa
        if (!playlist_name) return interaction.reply({ content: '⚠️ Nhập tên Playlist muốn thêm nhạc!', ephemeral: true }).catch(e => { })

        // Tìm playlist trong database và thêm nhạc
        const playlist = await db.playlist.findOne({ userID: interaction.user.id }).catch(e => { })
        if (!playlist?.playlist?.filter(p => p.name === playlist_name).length > 0) return interaction.reply({ content: 'Thêm nhạc thành công!', ephemeral: true }).catch(e => { })

        // Tạo một document mới trong database và cập nhật playlist của người dùng
        let max_music = client.config.playlistSettings.maxMusic
        if (playlist?.musics?.filter(m => m.playlist_name === playlist_name).length > max_music) return interaction.reply({ content: "Đã đạt đến giới hạn bài hát trong Playlist".replace("{max_music}", max_music), ephemeral: true }).catch(e => { })
        let res 
        try{
          // Kiếm tra bài hát có hợp lệ hay không
          res = await client.player.search(name, {
            member: interaction.member,
            textChannel: interaction.channel,
            interaction
          })
        } catch (e) {
          return interaction.reply({ content: '❌ Không thể tìm thấy', ephemeral: true }).catch(e => { })
        }
        if (!res || !res.length || !res.length > 1) return interaction.reply({ content: `❌ Không thể tìm thấy `, ephemeral: true }).catch(e => { })
        
        // Gửi thông báo cho việc thêm bài hát vào playlist thành công
        const loadingembed = new EmbedBuilder()
        .setColor('#0099ff')
        .setAuthor({
          name: 'Bài hát đã thêm vào Playlist!',
          iconURL: 'https://cdn.discordapp.com/attachments/1238866275363721226/1238867547152060456/verify.png?ex=6640d8d0&is=663f8750&hm=e10391646957775a528d8b3baa273fceab1f2813b231333d93d2664102839058&',
          url: 'https://discord.gg/Na6FFYMPW6'
        })
        .setDescription(`🍒Chúc mừng <@${interaction.member.id}>, bạn đã thêm bài hát thành công!`)
        .setFooter({ text: 'Made By Cherry' })
        .setTimestamp();
        await interaction.reply({
  content: '',
  embeds: [ loadingembed ] 
}).catch(e => {
  // Xử lý lỗi nếu có và ghi log
  console.error('Lỗi khi gửi tin nhắn của lệnh Playlist', error);
});
      //Kiểm tra bài hát đã có trong Playlist chưa
        const music_filter = playlist?.musics?.filter(m => m.playlist_name === playlist_name && m.music_name === res[0]?.name)
        if (music_filter?.length > 0) return interaction.editReply({ content: ' ❌ Bài hát đã có trong Playlist', ephemeral: true }).catch(e => { })

        // Tạo một document mới trong database để lưu trữ bài hát vào playlist của người dùng
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

      // Xử lý khi subcommand là "delete-music"
      if (stp === "delete-music") {
        // Lấy tên playlist và tên bài hát từ người dùng
        let name = interaction.options.getString('name')
        if (!name) return interaction.reply({ content: '⚠️ Nhập bài hát bạn tìm kiếm!', ephemeral: true }).catch(e => { })
        let playlist_name = interaction.options.getString('playlist-name')
        if (!playlist_name) return interaction.reply({ content: '⚠️ Nhập tên Playlist cần xóa bài hát!', ephemeral: true }).catch(e => { })

        // Kiểm tra xem tên playlist và tên bài hát đã được nhập hay chưa
        const playlist = await db.playlist.findOne({ userID: interaction.user.id }).catch(e => { })
        if (!playlist?.playlist?.filter(p => p.name === playlist_name).length > 0) return interaction.reply({ content: '❌ Không thấy Playlist!', ephemeral: true }).catch(e => { })

        //Kiểm tra xem playlist có bài hát đó hay chưa
        const music_filter = playlist?.musics?.filter(m => m.playlist_name === playlist_name && m.music_name === name)
        if (!music_filter?.length > 0) return interaction.reply({ content: `❌ Không thấy bài hát!`, ephemeral: true }).catch(e => { })

         const deletingSongEmbed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('Xóa bỏ bài hát.')
          .setDescription(`🍒Ơ kìa <@${interaction.member.id}> đã xóa 1 bài hát trong Playlist!`)
          .setFooter({ text: 'Made By Cherry' })
          .setTimestamp();


        await interaction.reply({
          content: '',
          embeds: [deletingSongEmbed]
        }).catch(e => {
          // Xử lý lỗi nếu có và ghi log
          console.error('Lỗi gửi tin nhắn của lệnh Playlist', error);
        });

        // Tìm playlist trong database để xóa bài hát cần gỡ
        await db.playlist.updateOne({ userID: interaction.user.id }, {
          $pull: {
            musics: {
              playlist_name: playlist_name,
              music_name: name
            }
          }
        }, { upsert: true }).catch(e => { })

        // Gửi thông báo cho việc xóa bài hát khỏi playlist thành công
         const songDeleteEmbed = new EmbedBuilder()
  .setColor('#00ff00')
          .setAuthor({
            name: 'Xóa bài hát thành công!',
            iconURL: 'https://cdn.discordapp.com/attachments/1238866275363721226/1238867547152060456/verify.png?ex=6640d8d0&is=663f8750&hm=e10391646957775a528d8b3baa273fceab1f2813b231333d93d2664102839058&',
            url: 'https://discord.gg/Na6FFYMPW6'
          })
  .setDescription(`🍒Ơ kìa <@${interaction.member.id}>, bạn đã xóa nhạc thành công!`)
  .setFooter({ text: 'Made By Cherry' })
  .setTimestamp();

// Chỉnh sửa lại tin nhắn ember
await interaction.editReply({
  content: '',
  embeds: [songDeleteEmbed]
}).catch(e => {
  // Xử lý lỗi nếu có và ghi log
  console.error('Lỗi chỉnh sửa tin nhắn của lênh Playlist ', error);
});
      }
      // Xử lý khi subcommand là "song"
      if (stp === "song") {
        // Lấy tên playlist và tên bài hát từ người dùng
        let name = interaction.options.getString('name')
        if (!name) return interaction.reply({ content: '🔍 Nhập tên Playlist để tìm!', ephemeral: true }).catch(e => { })
        // Kiểm tra playlist người dùng
        let trackl
        // Tìm kiếm bài hát đó từ database người dùng
        const playlist = await db.playlist.find().catch(e => { })
        if (!playlist?.length > 0) return interaction.reply({ content: `🚫 Không có tên Playlist!`, ephemeral: true }).catch(e => { })
        // Kiểm tra thông tin bài hát trong playlist
        let arr = 0
        for (let i = 0; i < playlist.length; i++) {
          if (playlist[i]?.playlist?.filter(p => p.name === name)?.length > 0) {

            let playlist_owner_filter = playlist[i].playlist.filter(p => p.name === name)[0].author
            let playlist_public_filter = playlist[i].playlist.filter(p => p.name === name)[0].public
            // Kiểm tra quyền của playlist người dùng
            if (playlist_owner_filter !== interaction.member.id) {
              if (playlist_public_filter === false) {
                return interaction.reply({ content: '🚫 Bạn không thể phát Playlist này!', ephemeral: true }).catch(e => { })
              }
            } 
            // Kiểm tra bài hát có tồn tại hay chưa
            trackl = await playlist[i]?.musics?.filter(m => m.playlist_name === name)
            if (!trackl?.length > 0) return interaction.reply({ content: '😺 Playlist này chưa có nhạc, hãy thêm vô nhé!', ephemeral: true }).catch(e => { })
          // Nếu không có danh sách playlist nào
          } else {
            arr++
            if (arr === playlist.length) {
              return interaction.reply({ content: '❌ Không thấy Playlist nào!', ephemeral: true }).catch(e => { })
            }
          }
        }
        // Tạo các nút button để tương tác danh sách bài hát
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

        // Kiểm tra bài hát
        let howmuch = 8
        let page = 1
        let a = trackl.length / howmuch
        // Kiểm tra database xem playlist có bài hát nào chưa
        const generateEmbed = async (start) => {
          let sayı = page === 1 ? 1 : page * howmuch - howmuch + 1
          const current = trackl.slice(start, start + howmuch)
          if (!current || !current?.length > 0) return interaction.reply({ content: '😺 Playlist này chưa có nhạc, hãy thêm vô nhé!', ephemeral: true }).catch(e => { })
          return new EmbedBuilder()
            // Ngược lại gửi danh sách bài hát trong playlist nếu có
            .setAuthor({
          name: 'Playlist nhạc!',
          iconURL: 'https://cdn.discordapp.com/attachments/1238866275363721226/1238867000097505361/playlist.png?ex=6640d84d&is=663f86cd&hm=9ff229fb1fa12660090e59b980522a9cec8fe03e8d5ba41866530af85e13782e&',
          url: 'https://discord.gg/Na6FFYMPW6'
        })
            .setThumbnail(interaction.user.displayAvatarURL({ size: 2048, dynamic: true }))
            .setColor(client.config.embedColor) 
            .setDescription(`\n${current.map(data =>
              `\n\`${sayı++}\` | [${data.music_name}](${data.music_url}) - <t:${Math.floor(data.saveTime / 1000) }:R>`
            ) }`)
            .setFooter({ text: `Trang ${page}/${Math.floor(a+1) }` })
            .setFooter({ text: 'Made By Cherry' })
            .setTimestamp();
        }

        // Gửi người dùng danh sách bài hát trong playlist
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

          // Kiểm tra nút và nếu như người dùng hủy lệnh
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

            // Tự động sửa tin nhắn cho gọn
            const embed = new EmbedBuilder()
              .setTitle(`${name}`)
              .setThumbnail(interaction.user.displayAvatarURL({ size: 2048, dynamic: true }))
              .setColor(client.config.embedColor)
              .setDescription('Tự động sửa ember để tin nhắn ngắn gọn! '.replace("{name}", name))
              .setFooter({ text: 'Made By Cherry' })
              .setTimestamp();
            return interaction.editReply({ embeds: [embed], components: [button] }).catch(e => { })

          })
        }).catch(e => { })

      }
      // Xử lý khi subcommand là "list"
      if (stp === "lists") {
        // Lấy tên playlist và tên bài hát từ người dùng
        const playlist = await db?.playlist?.findOne({ userID: interaction.user.id }).catch(e => { })
        if (!playlist?.playlist?.length > 0) return interaction.reply({ content: `💦 Bạn chưa tạo Playlist nào!`, ephemeral: true }).catch(e => { })

        // Trang đầu của playplst
        let number = 1
        // Gửi thông báo ember về danh sách playlist
        const embed = new EmbedBuilder()
          .setAuthor({
            name: 'Danh sách Playlist của tôi',
            iconURL: 'https://cdn.discordapp.com/attachments/1238866275363721226/1238867000097505361/playlist.png?ex=6640d84d&is=663f86cd&hm=9ff229fb1fa12660090e59b980522a9cec8fe03e8d5ba41866530af85e13782e&',
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
      // Xử lý khi subcommand là "top"
      if (stp === "top") {
        // Kiểm tra các playlist từ database
        let playlists = await db?.playlist?.find().catch(e => { })
        if (!playlists?.length > 0) return interaction.reply({ content: '🍒 Không có Playlist nào cả!', ephemeral: true }).catch(e => { })
        // Trang đầu của playlist
        let trackl = []
        playlists.map(async data => {
          data.playlist.filter(d => d.public === true).map(async d => {
            let filter = data.musics.filter(m => m.playlist_name === d.name)
            if (filter.length > 0) {
              trackl.push(d)
            }
          })
        })
        // Kiểm tra xem có playlist nào hay chưa
        trackl = trackl.filter(a => a.plays > 0) 

        if (!trackl?.length > 0) return interaction.reply({ content: '🍒 Không có Playlist nào cả!', ephemeral: true }).catch(e => { })

        trackl = trackl.sort((a, b) => b.plays - a.plays)
        // Thêm các nút để tương tác với ember
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

        // Trình bày playlist sao cho phù hợp với ember
        let howmuch = 8
        let page = 1
        let a = trackl.length / howmuch

        // Kiểm tra xem có playlist nào chưa
        const generateEmbed = async (start) => {
          let sayı = page === 1 ? 1 : page * howmuch - howmuch + 1
          const current = trackl.slice(start, start + howmuch)
          if (!current || !current?.length > 0) return interaction.reply({ content: `🍒 Không có Playlist nào cả!`, ephemeral: true }).catch(e => { })
          // Gửi thông báo về Top playlist trong database được phát nhiều nhất
          return new EmbedBuilder()
            .setAuthor({
              name: 'Top những Playlist được phát nhiều nhất',
              iconURL: 'https://cdn.discordapp.com/attachments/1238866275363721226/1238867000097505361/playlist.png?ex=6640d84d&is=663f86cd&hm=9ff229fb1fa12660090e59b980522a9cec8fe03e8d5ba41866530af85e13782e&',
              url: 'https://discord.gg/Na6FFYMPW6'
            })
            .setThumbnail(interaction.user.displayAvatarURL({ size: 2048, dynamic: true }))
            .setColor(client.config.embedColor)
            .setDescription(`\n${current.map(data =>
              `\n**${sayı++} |** \`${data.name}\` tạo bởi \`${data.authorTag}\` - *đã có* **${data.plays}** *lượt phát* (** đã tạo từ **<t:${Math.floor(data.createdTime / 1000) }:R> )`
            ) }`)
            .setFooter({ text: `Trang ${page}/${Math.floor(a+1) }` })
            .setFooter({ text: 'Made By Cherry' })
            .setTimestamp();
        }
        // Kiểm tra lại và gửi lại tin nhắn ember
        const canFitOnOnePage = trackl.length <= howmuch
        // Trả lời tin nhắn ember 
        await interaction.reply({
          embeds: [await generateEmbed(0)],
          components: canFitOnOnePage
            ? []
            : [new ActionRowBuilder({ components: [deleteButton, forwardButton] })],
          fetchReply: true
        }).then(async Message => {
          const filter = i => i.user.id === interaction.user.id
          const collector = Message.createMessageComponentCollector({ filter, time: 30000 });

          // Nếu như dừng lệnh xem playlist
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
          // Thêm các nút để tương tác với ember
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
            // Tự động chỉnh sửa tin nhắn cho gọn
            const embed = new EmbedBuilder()
              .setAuthor({
          name: 'Top những Playlist được phát nhiều nhất',
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
      interaction.reply({ content: 'Đã xảy ra lỗi khi thực hiện các lệnh Playlist', ephemeral: true }).catch(e => { })
    }
  }
}
