const config = require('./config.js');

// Kiểm tra xem có sử dụng Shard Manager không
if (config.shardManager.shardStatus == true) {
    const { ShardingManager } = require('discord.js');
    const manager = new ShardingManager('./bot.js', { token: config.TOKEN || process.env.TOKEN });
    
    // Bắt sự kiện khi shard được tạo
    manager.on('shardCreate', shard => console.log(`Chạy với phiên ${shard.id}`));
    
    // Spawn shard
    manager.spawn();
} else {
    // Nếu không sử dụng Shard Manager, khởi động bot trực tiếp
    require("./bot.js");
}
