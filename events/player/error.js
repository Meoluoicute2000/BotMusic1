module.exports = async (client, textChannel, e) => {
  // Kiểm tra xem textChannel có tồn tại không
  if (textChannel) {
    // Tạo thông báo lỗi
    const errorMessage = `**Đã xảy ra lỗi không mong muốn :** ${e.toString().slice(0, 1974)}`;
    
    // Gửi thông báo lỗi vào kênh văn bản
    textChannel.send(errorMessage)
      .catch(console.error);
  }
};
