const config = require("../config.js");
const { ActivityType } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const { AutoPoster } = require('topgg-autoposter');

module.exports = async (client) => {
  // Kiểm tra nếu đã cung cấp URL của MongoDB
  if (config.mongodbURL || process.env.MONGO) {
    // Khởi tạo REST client để tạo các lệnh ứng dụng Discord
    const rest = new REST({ version: "10" }).setToken(config.TOKEN || process.env.TOKEN);

    try {
      // Đăng tải các lệnh của ứng dụng Discord
      await rest.put(Routes.applicationCommands(client.user.id), {
        body: await client.commands,
      });
      console.log('\x1b[36m%s\x1b[0m', '|    🚀 Đăng tải các lệnh thành công!')
    } catch (err) {
      console.log('\x1b[36m%s\x1b[0m', '|    🚀 Các lệnh không cần thiết!');
    }

    // Hiển thị thông tin đăng nhập
    console.log('\x1b[32m%s\x1b[0m', `|    🌼 Đăng nhập với tư cách ${client.user.username}`);

    // Thiết lập interval để thay đổi trạng thái của Bot
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

    // Lưu trữ đường dẫn lỗi vào client để sử dụng trong toàn bộ ứng dụng
    client.errorLog = config.errorLog;
  } else {
    console.log('\x1b[36m%s\x1b[0m', `|    🍔 Lỗi MongoDB!`);
  }

  // Hiển thị trạng thái sẵn sàng của Bot
  console.log('\x1b[36m%s\x1b[0m', `|    🎯 Trạng thái của Bot đã sẵn sàng!`);

  // Nếu tính năng quản lý bình chọn được bật và có khóa API được cung cấp
  if (client.config.voteManager.status === true && client.config.voteManager.api_key) {
    // Khởi tạo AutoPoster cho trang web top.gg
    const ap = AutoPoster(client.config.voteManager.api_key, client);
    ap.on('posted', () => {
    });
  }
}
