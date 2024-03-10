module.exports = async (client, textChannel, e) => {
   if (textChannel) {
     const errorMessage = `**Đã sảy ra lỗi:** ${e.toString().slice(0, 1974)}`;
     return textChannel.send(errorMessage);
   }
 };
 