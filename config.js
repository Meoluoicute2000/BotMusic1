module.exports = {
  // Token của bot
  TOKEN: "",

  // ID của chủ bot
  ownerID: ["827533541113069609", "701647458349875312"],

  // Liên kết mời bot vào máy chủ
  botInvite: "",

  // Liên kết máy chủ hỗ trợ
  supportServer: "",

  // URL của MongoDB
  mongodbURL: "mongodb+srv://KidtomboyReal:Kidtomboy1412@cherry.ulfcfwi.mongodb.net/?retryWrites=true&w=majority",

  // Trạng thái của bot
  status: 'Cherry',

  // Thư mục chứa các lệnh của bot
  commandsDir: './commands',

  // Ngôn ngữ mặc định của bot
  language: "en",

  // Màu sắc mặc định của Embed
  embedColor: "0055ff",

  // Đường dẫn lưu log lỗi
  errorLog: "",

  // Cài đặt tài trợ
  sponsor: {
    status: true,
    url: "https://www.youtube.com/@Kidtomboy",
  },

  // Quản lý vote
  voteManager: {
    status: false,
    api_key: "",
    vote_commands: ["back", "channel", "clear", "dj", "filter", "loop", "nowplaying", "pause", "playnormal", "playlist", "queue", "resume", "save", "play", "skip", "stop", "time", "volume"],
    vote_url: "",
  },

  // Quản lý Shard
  shardManager: {
    shardStatus: false
  },

  // Cài đặt Playlist
  playlistSettings: {
    maxPlaylist: 20,
    maxMusic: 100,
  },

  // Tùy chọn
  opt: {
    // Tùy chọn DJ
    DJ: {
      commands: ['back', 'clear', 'filter', 'loop', 'pause', 'resume', 'skip', 'stop', 'volume', 'shuffle']
    },

    // Cấu hình voice
    voiceConfig: {
      leaveOnFinish: false,
      leaveOnStop: false,
      leaveOnEmpty: {
        status: false,
        cooldown: 0,
      },
    },

    // Giới hạn âm lượng tối đa
    maxVol: 150,
  }
}
