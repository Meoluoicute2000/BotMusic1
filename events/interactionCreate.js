const config = require("../config.js");
const { EmbedBuilder, InteractionType } = require('discord.js');
const db = require("../mongoDB.js");
const fs = require("fs");

module.exports = async (client, interaction) => {
    try {
        // Kiểm tra xem interaction có thuộc một server không
        if (!interaction?.guild) {
            // Nếu không, phản hồi rằng lệnh bị giới hạn
            return interaction?.reply({ content: "Tỉ lệ giới hạn.", ephemeral: true });
        } else {
            // Hàm để tải lệnh và thực thi nó
            function cmdLoader() {
                if (interaction?.type === InteractionType.ApplicationCommand) {
                    fs.readdir(config.commandsDir, (err, files) => {
                        if (err) throw err;
                        files.forEach(async (f) => {
                            let props = require(`.${config.commandsDir}/${f}`);
                            if (interaction.commandName === props.name) {
                                try {
                                    // Kiểm tra nếu trong dữ liệu có giới hạn kênh
                                    let data = await db?.musicbot?.findOne({ guildID: interaction?.guild?.id });

                                    if (data?.channels?.length > 0) {
                                        let channelControl = await data?.channels?.filter(x => !interaction?.guild?.channels?.cache?.get(x?.channel));

                                        if (channelControl?.length > 0) {
                                            for (const x of channelControl) {
                                                await db?.musicbot?.updateOne({ guildID: interaction?.guild?.id }, {
                                                    $pull: {
                                                        channels: {
                                                            channel: x?.channel
                                                        }
                                                    }
                                                }, { upsert: true }).catch(e => { });
                                            }
                                        } else {
                                            data = await db?.musicbot?.findOne({ guildID: interaction?.guild?.id });
                                            let channelFilter = data?.channels?.filter(x => x.channel === interaction?.channel?.id);

                                            if (!channelFilter?.length > 0 && !interaction?.member?.permissions?.has("0x0000000000000020")) {
                                                channelFilter = data?.channels?.map(x => `<#${x.channel}>`).join(", ");
                                                return interaction?.reply({ content: '🔴 Tỉ lệ giới hạn'.replace("{channelFilter}", channelFilter), ephemeral: true }).catch(e => { });
                                            }
                                        }
                                    }

                                    // Kiểm tra quyền của thành viên để thực hiện lệnh
                                    if (interaction?.member?.permissions?.has(props?.permissions || "0x0000000000000800")) {
                                        const DJ = client.config.opt.DJ;

                                        if (props && DJ.commands.includes(interaction?.commandName)) {
                                            let djRole = await db?.musicbot?.findOne({ guildID: interaction?.guild?.id }).catch(e => { });

                                            if (djRole) {
                                                const roleDJ = interaction?.guild?.roles?.cache?.get(djRole?.role);

                                                if (!interaction?.member?.permissions?.has("0x0000000000000020")) {
                                                    if (roleDJ) {
                                                        if (!interaction?.member?.roles?.cache?.has(roleDJ?.id)) {
                                                            // Phản hồi nếu thành viên không có vai trò DJ
                                                            const embed = new EmbedBuilder()
                                                                .setColor(client.config.embedColor)
                                                                .setTitle(client?.user?.username)
                                                                .setThumbnail(client?.user?.displayAvatarURL())
                                                                .setFooter({ text: 'Made By Cherry' })
                                                                .setTimestamp();

                                                            return interaction?.reply({ embeds: [embed], ephemeral: true }).catch(e => { });
                                                        }
                                                    }
                                                }
                                            }
                                        }

                                        if (props && props.voiceChannel) {
                                            if (!interaction?.member?.voice?.channelId) {
                                                // Phản hồi nếu thành viên không ở trong kênh voice
                                                return interaction?.reply({ content: `🔴 Vào một kênh Voice trước!!`, ephemeral: true }).catch(e => { });
                                            }

                                            const guildMe = interaction?.guild?.members?.cache?.get(client?.user?.id);

                                            if (guildMe?.voice?.channelId) {
                                                if (guildMe?.voice?.channelId !== interaction?.member?.voice?.channelId) {
                                                    // Phản hồi nếu Bot và thành viên không ở cùng một kênh voice
                                                    return interaction?.reply({ content: `🔴 Phải ở cùng một kênh Voice!`, ephemeral: true }).catch(e => { });
                                                }
                                            }
                                        }

                                        return props.run(client, interaction);
                                    } else {
                                        // Phản hồi nếu thiếu quyền cần thiết
                                        return interaction?.reply({ content: `▶️ Thiếu quyền: **${props?.permissions?.replace("0x0000000000000020", "MANAGE GUILD")?.replace("0x0000000000000800", "SEND MESSAGES") || "SEND MESSAGES"}**`, ephemeral: true });
                                    }
                                } catch (e) {
                                    // Phản hồi nếu có lỗi xảy ra
                                    return interaction?.reply({ content: `❌ Lỗi...\n\n\`\`\`${e?.message}\`\`\``, ephemeral: true });
                                }
                            }
                        });
                    });
                }
            }

            // Kiểm tra nếu tính năng bình chọn được bật và có khóa API được cung cấp
            if (config.voteManager.status === true && config.voteManager.api_key) {
                if (config.voteManager.vote_commands.includes(interaction?.commandName)) {
                    try {
                        const topSdk = require("@top-gg/sdk");
                        let topApi = new topSdk.Api(config.voteManager.api_key, client);

                        await topApi?.hasVoted(interaction?.user?.id).then(async voted => {
                            if (!voted) {
                                // Phản hồi nếu người dùng chưa bình chọn
                                const embed2 = new EmbedBuilder()
                                    .setTitle("Vote " + client?.user?.username)
                                    .setColor(client?.config?.embedColor);

                                return interaction?.reply({ content: "", embeds: [embed2], ephemeral: true });
                            } else {
                                // Nếu đã bình chọn, thực thi lệnh
                                cmdLoader();
                            }
                        });
                    } catch (e) {
                        // Nếu xảy ra lỗi trong quá trình kiểm tra bình chọn, vẫn thực thi lệnh
                        cmdLoader();
                    }
                } else {
                    // Nếu lệnh không yêu cầu bình chọn, thực thi lệnh
                    cmdLoader();
                }
            } else {
                // Nếu tính năng bình chọn không được bật, thực thi lệnh
                cmdLoader();
            }
        }
    } catch (e) {
        // Xử lý lỗi nếu có
        console.error(error);
    }
};
