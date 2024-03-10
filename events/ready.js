const config = require("../config.js");
const { ActivityType } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const { AutoPoster } = require('topgg-autoposter');

module.exports = async (client) => {
  if (config.mongodbURL || process.env.MONGO) {
    const rest = new REST({ version: "10" }).setToken(config.TOKEN || process.env.TOKEN);

    try {
      await rest.put(Routes.applicationCommands(client.user.id), {
        body: await client.commands,
      });
      console.log('\x1b[36m%s\x1b[0m', '|    🚀 Đăng tải các lệnh thành công!')
    } catch (err) {
      console.log('\x1b[36m%s\x1b[0m', '|    🚀 Các lệnh không cần thiết!');
    }

    console.log('\x1b[32m%s\x1b[0m', `|    🌼 Đăng nhập với tư cách ${client.user.username}`);

    setInterval(() => {
      const currentPresence = client.user.presence;
      client.user.setPresence({
        ...currentPresence,
        activities: [
          {
            name: 'nhạc với Cherry',
            type: ActivityType.Listening,
            state: '🍒𝗖𝗵𝗲𝗿𝗿𝘆 𝗬𝗲̂𝘂 🐰𝗦𝗮𝘆𝗼𝗻𝗮𝗿𝗮 - 12/10/2023',
          },
        ],
      });
    }, 10000);

    client.errorLog = config.errorLog;
  } else {
    console.log('\x1b[36m%s\x1b[0m', `|    🍔 Lỗi MongoDB!`);
  }

  console.log('\x1b[36m%s\x1b[0m', `|    🎯 Trạng thái của Bot đã sẵn sàng!`);

  if (client.config.voteManager.status === true && client.config.voteManager.api_key) {
    const ap = AutoPoster(client.config.voteManager.api_key, client);
    ap.on('posted', () => {
    });
  }
}
