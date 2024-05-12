const config = require("../config.js");
const { EmbedBuilder, InteractionType } = require('discord.js');
const db = require("../mongoDB.js");
const fs = require("fs");

module.exports = async (client, interaction) => {
    try {
        if (!interaction?.guild) {
            return interaction?.reply({ content: "Tỉ lệ giới hạn.", ephemeral: true });
        } else {
            function cmdLoader() {
                if (interaction?.type === InteractionType.ApplicationCommand) {
                    fs.readdir(config.commandsDir, (err, files) => {
                        if (err) throw err;
                        files.forEach(async (f) => {
                            let props = require(`.${config.commandsDir}/${f}`);
                            if (interaction.commandName === props.name) {
                                try {
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

                                    if (interaction?.member?.permissions?.has(props?.permissions || "0x0000000000000800")) {
                                        const DJ = client.config.opt.DJ;

                                        if (props && DJ.commands.includes(interaction?.commandName)) {
                                            let djRole = await db?.musicbot?.findOne({ guildID: interaction?.guild?.id }).catch(e => { });

                                            if (djRole) {
                                                const roleDJ = interaction?.guild?.roles?.cache?.get(djRole?.role);

                                                if (!interaction?.member?.permissions?.has("0x0000000000000020")) {
                                                    if (roleDJ) {
                                                        if (!interaction?.member?.roles?.cache?.has(roleDJ?.id)) {
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
                                                return interaction?.reply({ content: `🔴 Vào một kênh Voice trước!!`, ephemeral: true }).catch(e => { });
                                            }

                                            const guildMe = interaction?.guild?.members?.cache?.get(client?.user?.id);

                                            if (guildMe?.voice?.channelId) {
                                                if (guildMe?.voice?.channelId !== interaction?.member?.voice?.channelId) {
                                                    return interaction?.reply({ content: `🔴 Phải ở cùng một kênh Voice!`, ephemeral: true }).catch(e => { });
                                                }
                                            }
                                        }

                                        return props.run(client, interaction);
                                    } else {
                                        return interaction?.reply({ content: `▶️ Thiếu quyền: **${props?.permissions?.replace("0x0000000000000020", "MANAGE GUILD")?.replace("0x0000000000000800", "SEND MESSAGES") || "SEND MESSAGES"}**`, ephemeral: true });
                                    }
                                } catch (e) {
                                    return interaction?.reply({ content: `❌ Lỗi...\n\n\`\`\`${e?.message}\`\`\``, ephemeral: true });
                                }
                            }
                        });
                    });
                }
            }

            if (config.voteManager.status === true && config.voteManager.api_key) {
                if (config.voteManager.vote_commands.includes(interaction?.commandName)) {
                    try {
                        const topSdk = require("@top-gg/sdk");
                        let topApi = new topSdk.Api(config.voteManager.api_key, client);

                        await topApi?.hasVoted(interaction?.user?.id).then(async voted => {
                            if (!voted) {
                                const embed2 = new EmbedBuilder()
                                    .setTitle("Vote " + client?.user?.username)
                                    .setColor(client?.config?.embedColor);

                                return interaction?.reply({ content: "", embeds: [embed2], ephemeral: true });
                            } else {
                                cmdLoader();
                            }
                        });
                    } catch (e) {
                        cmdLoader();
                    }
                } else {
                    cmdLoader();
                }
            } else {
                cmdLoader();
            }
        }
    } catch (e) {
        console.error(e);
    }
};
