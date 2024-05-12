const config = require('./config.js');

if (config.shardManager.shardStatus) {
  const { ShardingManager } = require('discord.js');
  const manager = new ShardingManager('./bot.js', { token: config.TOKEN || process.env.TOKEN });

  manager.on('shardCreate', shard => {
    console.log(`Chạy với phiên ${shard.id}`);
  });

  manager.spawn();
} else {
  require("./bot.js");
}
