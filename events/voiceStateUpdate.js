const db = require("../mongoDB");

module.exports = async (client, oldState, newState) => {
    // Lấy hàng đợi phát nhạc của server từ client
    const queue = client.player.getQueue(oldState.guild.id);

    // Kiểm tra nếu có hàng đợi và đang phát nhạc
    if (queue || queue?.playing) {
        // Kiểm tra cấu hình để xác định liệu bot có rời kênh khi kênh rỗng không
        if (client?.config?.opt?.voiceConfig?.leaveOnEmpty?.status === true) {
            // Thiết lập timeout để kiểm tra trạng thái của kênh
            setTimeout(async () => {
                // Lấy kênh mà bot đang tham gia
                let botChannel = oldState?.guild?.channels?.cache?.get(queue?.voice?.connection?.joinConfig?.channelId);

                // Kiểm tra xem bot có trong kênh không và kênh đã rỗng không
                if (botChannel) {
                    if (botChannel.id == oldState.channelId && botChannel?.members?.find(x => x == client?.user?.id)) {
                        if (botChannel?.members?.size == 1) {
                            // Gửi thông báo và tạm dừng nhạc nếu kênh rỗng
                            await queue?.textChannel?.send({ content: `🔴 Người dùng thoát khỏi kênh. Tạm dừng âm nhạc!!` }).catch(e => { });
                            if (queue || queue?.playing) {
                                return queue?.pause(oldState.guild.id);
                            }
                        }
                    }
                }
            }, client?.config?.opt?.voiceConfig?.leaveOnEmpty?.cooldown || 0);
        }

        // Xử lý sự kiện mute/unmute bot
        if (newState.id === client.user.id) {
            if (oldState.serverMute === false && newState.serverMute === true) {
                // Tạm dừng nhạc khi bot bị mute
                if (queue?.textChannel) {
                    try {
                        await queue?.pause();
                    } catch(e) {
                        return;
                    }
                    await queue?.textChannel?.send({ content: `🔴 Đã tắt tiếng` }).catch(e => { });
                }
            }

            if (oldState.serverMute === true && newState.serverMute === false) {
                // Tiếp tục phát nhạc khi bot được unmute
                if (queue?.textChannel) {
                    try {
                        await queue.resume();
                    } catch(e) {
                        return;
                    }
                }
            }
        }
    }
};
