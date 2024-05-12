const { Schema, model } = require("mongoose");

// Schema cho bot nhạc trong mỗi server
const musicbotSchema = Schema({
  guildID: String,     // ID của server
  role: String,        // ID của vai trò có quyền điều khiển bot
  language: String,    // Ngôn ngữ được sử dụng trong bot
  channels: Array,     // Danh sách các kênh được phép sử dụng bot
});

// Schema cho danh sách phát cá nhân của người dùng
const playlistSchema = Schema({
  userID: String,      // ID của người dùng
  playlist: Array,     // Danh sách các playlist
  musics: Array,       // Danh sách các bài hát trong playlist
});

// Tạo model cho mỗi schema
const MusicBot = model("MusicBot", musicbotSchema);
const Playlist = model("Playlist", playlistSchema);

module.exports = {
  MusicBot,
  Playlist
};
