const { Client, GatewayIntentBits, Partials } = require("discord.js");
const { DisTube } = require("distube");
const { SpotifyPlugin } = require("@distube/spotify");
const { SoundCloudPlugin } = require("@distube/soundcloud");
const { DeezerPlugin } = require("@distube/deezer");
const { YtDlpPlugin } = require("@distube/yt-dlp");
const { printWatermark } = require('./util/printwatermark');
const config = require("./config.js");
const fs = require("fs");
const path = require('path');

// Khởi tạo Discord client với các cấu hình cần thiết
const client = new Client({
  partials: [
    Partials.Channel, 
    Partials.GuildMember, 
    Partials.User, 
  ],
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMembers, 
    GatewayIntentBits.GuildIntegrations, 
    GatewayIntentBits.GuildVoiceStates, 
  ],
});

// Lưu cấu hình vào client để dễ truy cập
client.config = config;

// Khởi tạo DisTube client để phát nhạc
client.player = new DisTube(client, {
  leaveOnStop: config.opt.voiceConfig.leaveOnStop,
  leaveOnFinish: config.opt.voiceConfig.leaveOnFinish,
  leaveOnEmpty: config.opt.voiceConfig.leaveOnEmpty.status,
  emitNewSongOnly: true,
  emitAddSongWhenCreatingQueue: false,
  emitAddListWhenCreatingQueue: false,
  plugins: [
    new SpotifyPlugin(),
    new SoundCloudPlugin(),
    new YtDlpPlugin(),
    new DeezerPlugin(),
  ],
});

// Tắt cập nhật YTDl để tránh việc gây lỗi
process.env.YTDL_NO_UPDATE = true;
const player = client.player;

// Tải và kích hoạt các sự kiện từ thư mục "events"
fs.readdir("./events", (_err, files) => {
  files.forEach((file) => {
    if (!file.endsWith(".js")) return;
    const event = require(`./events/${file}`);
    let eventName = file.split(".")[0]; 
    client.on(eventName, event.bind(null, client));
    delete require.cache[require.resolve(`./events/${file}`)];
  });
});

// Tải và kích hoạt các sự kiện từ thư mục "events/player"
fs.readdir("./events/player", (_err, files) => {
  files.forEach((file) => {
    if (!file.endsWith(".js")) return;
    const player_events = require(`./events/player/${file}`);
    let playerName = file.split(".")[0];
    player.on(playerName, player_events.bind(null, client));
    delete require.cache[require.resolve(`./events/player/${file}`)];
  });
});

// Tải danh sách các lệnh từ thư mục được chỉ định trong cấu hình
client.commands = [];
fs.readdir(config.commandsDir, (err, files) => {
  if (err) throw err;
  files.forEach(async (f) => {
    try {
      if (f.endsWith(".js")) {
        let props = require(`${config.commandsDir}/${f}`);
        client.commands.push({
          name: props.name,
          description: props.description,
          options: props.options,
        });
      }
    } catch (err) {
      console.log(err);
    }
  });
});

// Đăng nhập vào Discord bằng token từ cấu hình hoặc biến môi trường
if (config.TOKEN || process.env.TOKEN) {
  client.login(config.TOKEN || process.env.TOKEN).catch((e) => {
    console.log('TOKEN đã bị lỗi❌');
  });
} else {
  setTimeout(() => {
    console.log('TOKEN đã bị lỗi do Timeout❌');
  }, 2000);
}

// Kết nối đến MongoDB
if(config.mongodbURL || process.env.MONGO){
  const mongoose = require("mongoose")
  mongoose.set('strictQuery', false);
  mongoose.connect(config.mongodbURL || process.env.MONGO, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  }).then(async () => {
    console.log('\x1b[32m%s\x1b[0m', `|    🍔 Đã kết nối MongoDB!`)
  }).catch((err) => {
    console.log('\x1b[32m%s\x1b[0m', `|    🍔 Không thể kết nối MongoDB!`)})
  } else {
  console.log('\x1b[32m%s\x1b[0m', `|    🍔 Lỗi MongoDB!`)
}

// Khởi tạo server Express
const express = require("express");
const app = express();
const port = 5000;
app.get('/', (req, res) => {
  const imagePath = path.join(__dirname, 'index.html');
  res.sendFile(imagePath);
});
app.listen(port, () => console.log('\x1b[36m%s\x1b[0m', `|    🍒 Cherry đang mở cổng : ${port}`));

printWatermark();
