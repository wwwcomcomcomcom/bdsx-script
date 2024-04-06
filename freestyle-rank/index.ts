import { CommandPermissionLevel } from "bdsx/bds/command";
import { CustomForm, Form, FormButton, FormDropdown, FormInput, FormLabel, FormSlider, FormToggle, ModalForm, SimpleForm } from "bdsx/bds/form";
import { MinecraftPacketIds } from "bdsx/bds/packetids";
import { TextPacket } from "bdsx/bds/packets";
import { ServerPlayer } from "bdsx/bds/player";
import { command } from "bdsx/command";
import { CANCEL } from "bdsx/common";
import { events } from "bdsx/event";
import { bedrockServer } from "bdsx/launcher";
import fs = require("fs");

const settings: {
    rankChat: string,
    normalChat: string,
    guildChat: string,
    rankGuildChat: string,
    chatToConsole: boolean,
    setting: [boolean, number, number, number],
    guildSort: "level" | "members"
} = JSON.parse(fs.readFileSync("../freestyle-rank/settings.json", "utf-8"));
const ranks: { [keyof: string]: string | undefined } = JSON.parse(fs.readFileSync("../freestyle-rank/ranks.json", "utf-8"));
const guildIcon: string[] = [
    "textures/items/apple",
    "textures/items/arrow",
    "textures/items/blaze_powder",
    "textures/gui/newgui/mob_effects/fire_resistance_effect",
    "textures/gui/newgui/mob_effects/regeneration_effect",
    "textures/gui/newgui/anvil-hammer",
    "textures/blocks/grass_side_carried",
    "textures/blocks/beacon",
    "textures/blocks/camera_front",
    "textures/blocks/bedrock",
    "textures/ui/mashup_world",
    "textures/blocks/tnt_side",
    "textures/ui/accessibility_glyph_color",
    "textures/ui/op",
    "textures/ui/permissions_member_star",
    "textures/ui/icon_steve",
    "textures/ui/icon_panda",
    "textures/ui/icon_alex",
    "textures/ui/icon_balloon",
    "textures/ui/creator_glyph_color"
];
let censors: string[] = JSON.parse(fs.readFileSync("../freestyle-rank/censorList.json", "utf-8"));
let time: any = {};
let stack: any = {};

const guild: { player: { [keyof: string]: string }, guilds: { [keyof: string]: { master: string, icon: string, submaster: string[], level: number, settings: { pvp: boolean, join: "free" | "request", maxPlayers: number }, joinRequest: string[] } } } = JSON.parse(fs.readFileSync("../freestyle-rank/guild.json", "utf-8"));
function getGuilldPlayers(guildName: string, opt?: "exeptMaster"): string[] {
    let arr: string[] = [];
    if (opt === "exeptMaster") {
        Object.entries(guild.player).forEach(([name, value]) => {
            if (value === guildName && name !== guild.guilds[guildName].master) arr.push(name);
        });
    } else {
        Object.entries(guild.player).forEach(([name, value]) => {
            if (value === guildName) arr.push(name);
        });
    }
    return arr;
}

//     _____   _    _              _______              _____               _   _   _  __
//    / ____| | |  | |     /\     |__   __|    ___     |  __ \      /\     | \ | | | |/ /
//   | |      | |__| |    /  \       | |      ( _ )    | |__) |    /  \    |  \| | | ' /
//   | |      |  __  |   / /\ \      | |      / _ \/\  |  _  /    / /\ \   | . ` | |  <
//   | |____  | |  | |  / ____ \     | |     | (_>  <  | | \ \   / ____ \  | |\  | | . \
//    \_____| |_|  |_| /_/    \_\    |_|      \___/\/  |_|  \_\ /_/    \_\ |_| \_| |_|\_\
//

let formResult: [boolean, number, number, number] = settings.setting;

if (!settings.rankChat.includes("칭호") || !settings.rankChat.includes("채팅") || !settings.rankChat.includes("이름")) {
    settings.rankChat = "§a[§r 칭호 §a]§r 이름 §a=>§r 채팅";
}
if (!settings.normalChat.includes("채팅") || !settings.normalChat.includes("이름")) {
    settings.normalChat = "이름 §a=>§r 채팅";
}
if (!settings.guildChat.includes("길드") || !settings.rankChat.includes("채팅") || !settings.rankChat.includes("이름")) {
    settings.guildChat = "§6§l〔§r길드§6§l〕§r 이름 §a=>§r 채팅";
}
if (!settings.rankGuildChat.includes("길드") || !settings.rankChat.includes("칭호") || !settings.rankChat.includes("채팅") || !settings.rankChat.includes("이름")) {
    settings.rankGuildChat = "§6§l〔§r길드§6§l〕§r §a[§r 칭호 §a]§r 이름 §a=>§r 채팅";
}
if (settings.chatToConsole === undefined) {
    settings.chatToConsole = true;
}
const saveInterval = setInterval(() => {
    fs.writeFileSync("../freestyle-rank/settings.json", JSON.stringify(settings));
    fs.writeFileSync("../freestyle-rank/ranks.json", JSON.stringify(ranks));
    fs.writeFileSync("../freestyle-rank/censorList.json", JSON.stringify(censors));
    fs.writeFileSync("../freestyle-rank/guild.json", JSON.stringify(guild));
}, 100000)

events.serverLeave.on(() => {
    clearInterval(saveInterval);
    fs.writeFileSync("../freestyle-rank/settings.json", JSON.stringify(settings));
    fs.writeFileSync("../freestyle-rank/ranks.json", JSON.stringify(ranks));
    fs.writeFileSync("../freestyle-rank/censorList.json", JSON.stringify(censors));
    fs.writeFileSync("../freestyle-rank/guild.json", JSON.stringify(guild));
});

events.packetAfter(MinecraftPacketIds.Login).on((pkt, ni) => {
    const value = pkt.connreq?.getJsonValue();
    if (value === null) return;
    console.log(`Model:${value!.DeviceModel} OS:${value!.DeviceOS} Id:${value!.DeviceId}`);
});

events.playerJoin.on((ev) => {
    if (ev.player.getName().trim().length < 2) {
        bedrockServer.serverInstance.disconnectClient((ev.player as ServerPlayer).getNetworkIdentifier(), "ERROR");
    }
});

function chatToConsole(message: string) {
    if (settings.chatToConsole) {
        console.log("채팅: " + message);
    }
}

events.packetBefore(MinecraftPacketIds.Text).on((pkt, ni) => {
    if (formResult[0]) {
        if (time[pkt.name] === undefined) {
            time[pkt.name] = new Date();
            stack[pkt.name]++;
        } else if (Number(new Date()) - time[pkt.name] < formResult[2]) {
            if (stack[pkt.name] >= 2) {
                let Day: any = new Date;
                let remainTime: any = (formResult[2] / 1000) - (Day - time[pkt.name]) / 1000;
                bedrockServer.executeCommand(`tellraw @a[name="${pkt.name}"] {"rawtext":[{"text":"§e도배금지입니다 잠시후 다시시도해주세요\n§a${remainTime.toFixed(1)}초 남음"}]}`);
                console.log(`[경고]${pkt.name}님의 도배경고-->경고사유:너무 빠른 채팅`.red);
                return CANCEL;
            } else stack[pkt.name]++
        } else {
            time[pkt.name] = new Date();
            stack[pkt.name] = 0;
        }
        if (pkt.message.length >= formResult[1]) {
            bedrockServer.executeCommand(`tellraw @a[name="${pkt.name}"] {"rawtext":[{"text":"§e도배금지입니다 ${formResult[1]}자이상의 채팅은 자제해주세요"}]}`);
            console.log(`[경고]${pkt.name}님의 도배경고-->경고사유:너무 긴 채팅`.red);
            return CANCEL;
        }
        for (const censor of censors) {
            if (pkt.message.match(censor) !== null) {
                bedrockServer.executeCommand(`tellraw @a[name="${pkt.name}"] {"rawtext":[{"text":"§e검열된 메시지로 보낼수가 없습니다\n§e검열 대상:'${censor}'"}]}`);
                console.log(`[경고] "${censor}" 메시지 감지/실행자:${pkt.name}`.red);
                return CANCEL;
            }
        }
    }
    switch (formResult[3]) {
        case 0: pkt.message = `§r${pkt.message}`; break;
        case 1: pkt.message = `§b${pkt.message}`; break;
        case 2: pkt.message = `§e${pkt.message}`; break;
        case 3: pkt.message = `§a${pkt.message}`; break;
        case 4: pkt.message = `§c${pkt.message}`; break;
    }
    chatToConsole(`${pkt.name} => ${pkt.message}`);
});

// events.packetSend(MinecraftPacketIds.Text).on((pkt) => {
//     const name = pkt.params.get(0);
//     if (pkt.message === "§e%multiplayer.player.joined") {
//         pkt.message = `[ §a+§r ] §7${name}`;
//         return;
//     }
//     if (pkt.message === "§e%multiplayer.player.left") {
//         pkt.message = `[ §c-§r ] §7${name}`;
//         return;
//     }
// });

events.packetSend(MinecraftPacketIds.Text).on((pkt, ni) => {
    if (pkt.type === TextPacket.Types.Chat) {
        pkt.type = TextPacket.Types.Raw;
        if (ranks[pkt.name] !== undefined) {
            if (Object.keys(guild.player).includes(pkt.name)) {
                const msg = settings.rankGuildChat.replace("길드", guild.player[pkt.name]).replace("칭호", ranks[pkt.name]!).replace("이름", pkt.name).replace("채팅", pkt.message);
                pkt.message = msg;
            } else {
                const msg = settings.rankChat.replace("칭호", ranks[pkt.name]!).replace("이름", pkt.name).replace("채팅", pkt.message);
                pkt.message = msg;
            }
        } else {
            if (Object.keys(guild.player).includes(pkt.name)) {
                const msg = settings.guildChat.replace("길드", guild.player[pkt.name]).replace("이름", pkt.name).replace("채팅", pkt.message);
                pkt.message = msg;
            } else {
                const msg = settings.normalChat.replace("이름", pkt.name).replace("채팅", pkt.message);
                pkt.message = msg;
            }
        }
    }
});

command.register('칭호', '칭호 추가&삭제', CommandPermissionLevel.Operator).overload(async (param, origin) => {
    const player = origin.getEntity();
    if (!player?.isPlayer()) return;
    const ni = player.getNetworkIdentifier();
    const form = new SimpleForm;
    form.addButton(new FormButton("칭호추가", "path", "textures/items/book_writable"));
    form.addButton(new FormButton("칭호삭제", "path", "textures/blocks/barrier"));
    form.sendTo(ni, async (result) => {
        if (result.response === null) return;
        else if (result.response === 0) {
            const players: ServerPlayer[] = [];
            bedrockServer.serverInstance.getPlayers().forEach((player) => { if (ranks[player.getName()] === undefined) { players.push(player) } });
            if (players.length === 0) {
                player.sendMessage("§e칭호를 가지고 있지 않은 플레이어가 없습니다.");
                return;
            }
            const form = new SimpleForm;
            form.setContent("칭호를 가지고 있지 않은 플레이어만 표시합니다.\n");
            players.forEach((player) => {
                form.addButton(new FormButton(player.getName()));
            });
            form.sendTo(ni, async (result) => {
                if (result.response !== null) {
                    const selectedPlayer = players[result.response];
                    const form2 = new CustomForm;
                    form2.addComponent(new FormInput("", "칭호를 입력하세요."));
                    form2.sendTo(ni, (result) => {
                        if (result.response !== null || selectedPlayer === undefined) {
                            ranks[selectedPlayer.getName()] = result.response;
                            bedrockServer.executeCommand(`tellraw @a {"rawtext":[{"text":"§e${selectedPlayer.getName()}의 칭호가 ${result.response}로 설정되었습니다."}]}`);
                        } else return;
                    });
                }
            });
        } else if (result.response === 1) {
            const form = new SimpleForm;
            const rankList = Object.entries(ranks);
            rankList.forEach(([key, value], index) => {
                form.addButton(new FormButton(`${key}\n${value}`));
            });
            form.sendTo(ni, (result) => {
                if (result.response !== null) {
                    delete ranks[rankList[result.response][0]];
                }
            });
        }
    }
    );
}, {});

command.register('채팅설정', '채팅에 관련된것들을 설정합니다.', CommandPermissionLevel.Operator).overload(async (param, origin) => {
    const player = origin.getEntity();
    if (!player?.isPlayer()) return;
    const ni = player.getNetworkIdentifier();
    const form = new SimpleForm;
    form.addButton(new FormButton("채팅형식 설정"));
    form.addButton(new FormButton("채팅제한 설정"));
    form.addButton(new FormButton("검열"));
    await form.sendTo(ni, async result => {
        switch (true) {
            case result.response === 0:
                const form = new SimpleForm;
                form.addButton(new FormButton("칭호 채팅 형식 설정"));
                form.addButton(new FormButton("일반 채팅 형식 설정"));
                form.addButton(new FormButton("길드 채팅 형식 설정"));
                form.addButton(new FormButton("칭호길드 채팅 형식 설정"));
                form.sendTo(ni, async result => {
                    switch (result.response) {
                        case 0: {
                            const form = new CustomForm;
                            form.addComponent(new FormInput("예시: [칭호] 이름 => 채팅\n결과: [방장] 홍길동 => ㅎㅇ", "위 양식에 맞게 채팅형식 입력"));
                            form.sendTo(ni, result => {
                                if (result.response !== null && typeof result.response[0] === "string") {
                                    if (result.response[0].includes("칭호") && result.response[0].includes("이름") && result.response[0].includes("채팅")) {
                                        settings.rankChat = result.response[0];
                                    } else {
                                        player.sendMessage("§e입력한 값이 양식에 맞지 않아 취소되었습니다.");
                                        return;
                                    }
                                }
                            });
                            break;
                        } case 1: {
                            const form = new CustomForm;
                            form.addComponent(new FormInput("예시: 이름 => 채팅\n결과: 홍길동 => ㅎㅇ", "위 양식에 맞게 채팅형식 입력"));
                            form.sendTo(ni, result => {
                                if (result.response !== null && typeof result.response[0] === "string") {
                                    if (result.response[0].includes("이름") && result.response[0].includes("채팅")) {
                                        settings.normalChat = result.response[0];
                                    } else {
                                        player.sendMessage("§e입력한 값이 양식에 맞지 않아 취소되었습니다.");
                                        return;
                                    }
                                }
                            });
                            break;
                        }
                        case 2: {
                            const form = new CustomForm;
                            form.addComponent(new FormInput("예시: <길드> 이름 => 채팅\n결과: <미스틱> 홍길동 => ㅎㅇ", "위 양식에 맞게 채팅형식 입력"));
                            form.sendTo(ni, result => {
                                if (result.response !== null && typeof result.response[0] === "string") {
                                    if (result.response[0].includes("이름") && result.response[0].includes("채팅") && result.response[0].includes("길드")) {
                                        settings.guildChat = result.response[0];
                                    } else {
                                        player.sendMessage("§e입력한 값이 양식에 맞지 않아 취소되었습니다.");
                                        return;
                                    }
                                }
                            });
                            break;
                        }
                        case 3: {
                            const form = new CustomForm;
                            form.addComponent(new FormInput("예시: <길드> [칭호] 이름 => 채팅\n결과: <미스틱> [방장] 홍길동 => ㅎㅇ", "위 양식에 맞게 채팅형식 입력"));
                            form.sendTo(ni, result => {
                                if (result.response !== null && typeof result.response[0] === "string") {
                                    if (result.response[0].includes("이름") && result.response[0].includes("채팅") && result.response[0].includes("칭호") && result.response[0].includes("길드")) {
                                        settings.rankGuildChat = result.response[0];
                                    } else {
                                        player.sendMessage("§e입력한 값이 양식에 맞지 않아 취소되었습니다.");
                                        return;
                                    }
                                }
                            });
                            break;
                        }
                        default:
                            break;
                    }
                });
                break;

            case result.response === 1:
                const res = await Form.sendTo(ni, {
                    type: 'custom_form',
                    title: '채팅관리',
                    content: [
                        {
                            type: 'toggle',
                            text: '채팅제한',
                            default: formResult[0]
                        },
                        {
                            type: 'slider',
                            text: '도배제한-채팅최대길이',
                            min: 0,
                            max: 100,
                            step: 5,
                            default: formResult[1]
                        },
                        {
                            type: 'slider',
                            min: 0,
                            max: 3000,
                            step: 100,
                            text: '도배제한-채팅속도(ms) 1000ms = 1초',
                            default: formResult[2]
                        },
                        {
                            type: 'dropdown',
                            text: '채팅색',
                            options: ['흰색', '§b파란색', '§e노란색', '§a초록색', '§c빨강색'],
                            default: formResult[3]
                        }
                    ]
                });
                if (res === null) return; // x pressed
                formResult = [res[0], res[1], res[2], res[3]];
                break;
            case result.response === 2:
                const res2 = await Form.sendTo(ni, {
                    type: 'form',
                    title: '검열',
                    content: "검열관리",
                    buttons: [
                        {
                            "text": "검열리스트 추가",
                            "image": {
                                type: "path",
                                data: "textures/items/book_writable"
                            }
                        },
                        {
                            "text": "검열리스트 삭제",
                            "image": {
                                type: "path",
                                data: "textures/blocks/barrier"
                            }
                        }
                    ]
                });
                if (res2 === null) return; // x pressed
                if (res2 === 0) {
                    const form1 = await Form.sendTo(ni, {
                        type: "custom_form",
                        title: "검열",
                        content: [
                            {
                                type: "input",
                                text: "검열",
                                placeholder: "검열할 단어 입력"
                            }
                        ]
                    });
                    if (form1 === null) return;
                    censors.push(form1[0]);
                } else {
                    const form = new SimpleForm;
                    form.setTitle('검열');
                    form.setContent('검열리스트 삭제');
                    for (let i = 0; i < censors.length; i++) {
                        form.addButton(new FormButton(`${censors[i]}`, "path", "textures/blocks/barrier"));
                    }
                    form.sendTo(ni, async (result) => {
                        censors.splice(result.response, 1);
                    });
                }
                break;
            default:
                return;
        }
    })
}, {});

//     _____   _    _   _____   _        _____
//    / ____| | |  | | |_   _| | |      |  __ \
//   | |  __  | |  | |   | |   | |      | |  | |
//   | | |_ | | |  | |   | |   | |      | |  | |
//   | |__| | | |__| |  _| |_  | |____  | |__| |
//    \_____|  \____/  |_____| |______| |_____/
//
//

const guildCommand1 = command.register('길드', '길드').overload(async (param, origin) => {
    const player = origin.getEntity();
    if (!player?.isPlayer()) return;
    const name = player.getName();
    const pGuild = guild.player[name];
    const ni = player.getNetworkIdentifier();
    const form = new SimpleForm;
    form.setContent(`플레이어:${name}\n길드:${pGuild === undefined ? "없음" : pGuild}\n`);

    let buttonArr: string[] = ["listButton"];
    form.addButton(new FormButton("길드 목록"));

    if (pGuild === undefined) {
        form.addButton(new FormButton("길드 가입"));
        form.addButton(new FormButton("길드 생성"));
        buttonArr.push(...["joinButton", "createButton"]);
    } else {
        if (guild.guilds[pGuild].master !== name) {
            form.addButton(new FormButton("길드 탈퇴"));
            buttonArr.push("withdrawButton");
        } else {
            form.addButton(new FormButton("길드 관리 §6[길드장 전용]"));
            buttonArr.push("settingButton");
        }
        if ((guild.guilds[pGuild].submaster.includes(name) || guild.guilds[pGuild].master === name) && guild.guilds[pGuild].joinRequest.length !== 0) {
            form.addButton(new FormButton("§a길드 가입 요청 승인"));
            buttonArr.push("joinConfirmButton");
        }
    }
    form.sendTo(ni, async (result) => {
        switch (buttonArr[result.response]) {
            case "listButton": {
                let guildsArr = Object.entries(guild.guilds).map(([name, value]) => { return { name, value } });
                if (guildsArr.length === 0) {
                    new SimpleForm("", "§a서버에 생성된 길드가 없습니다.").sendTo(ni);
                    return;
                }
                let str = "§a----- 길드 목록 -----"
                // value 기준으로 정렬
                guildsArr.sort(function (a, b) {
                    if ((settings.guildSort === "level" ? a.value.level : getGuilldPlayers(a.name).length) < (settings.guildSort === "level" ? b.value.level : getGuilldPlayers(a.name).length)) {
                        return 1;
                    }
                    if ((settings.guildSort === "level" ? a.value.level : getGuilldPlayers(a.name).length) > (settings.guildSort === "level" ? b.value.level : getGuilldPlayers(a.name).length)) {
                        return -1;
                    }
                    return 0;
                });

                const form = new SimpleForm("", "");
                guildsArr.forEach((guild, index) => {
                    const guildPlayers = getGuilldPlayers(guild.name, "exeptMaster");
                    form.addButton(new FormButton(`${guild.name}   §a랭킹${index + 1}등§r\n §8레벨:${guild.value.level}\n   인원수:${guildPlayers.length + 1}/${guild.value.settings.maxPlayers}`, "path", guild.value.icon));
                });
                form.sendTo(ni, async (result) => {
                    if (result.response === null) return;
                    const guildPlayers = getGuilldPlayers(guildsArr[result.response].name);
                    let str = `\n\n§6길드 : ${guildsArr[result.response].name}      §a랭킹${result.response + 1}등§r\n       §6길드장:${guildsArr[result.response].value.master}§r\n       레벨:${guildsArr[result.response].value.level}\n       인원수:${guildPlayers.length + 1}/${guildsArr[result.response].value.settings.maxPlayers}\n\n ${guildPlayers.length !== 0 ? "     §a-------길드원-------" : ""}`
                    guildsArr[result.response]
                    let submasterArr: string[] = [];
                    let memberArr: string[] = [];
                    guildPlayers.forEach(((value) => {
                        if (guildsArr[result.response].value.master !== value && !guildsArr[result.response].value.submaster.includes(value)) {
                            //일반 멤버일때
                            memberArr.push(value);
                        } else if (guildsArr[result.response].value.submaster.includes(value)) {
                            // 부길드장 일때
                            submasterArr.push(value);
                        }
                        //길드장일땐 따로 표시 X
                    }));
                    submasterArr.forEach((value) => {
                        str += `\n        §6부길드장§r:${value}`
                    });
                    memberArr.forEach((value) => {
                        str += `\n        멤버:${value}`
                    });
                    new SimpleForm("", str).sendTo(ni);
                });
                /*const guildPlayers = getGuilldPlayers(guild.name,"exeptMaster");
                    //str += `\n\n${index !== 0 ? "§7--------------------------------§r" : ""}   §6길드 : ${guild.name}      §a랭킹${index+1}등§r\n       §6길드장:${guild.value.master}§r\n       레벨:${guild.value.level}\n       인원수:${guildPlayers.length+1}/${guild.value.settings.maxPlayers}\n\n ${guildPlayers.length !== 0 ? "     §a-------길드원-------" : ""}`;
                    let submasterArr:string[] = [];
                    let memberArr:string[] = [];
                    getGuilldPlayers(guild.name).forEach(((value)=>{
                        if(guild.value.master !== value && !guild.value.submaster.includes(value)){
                            //일반 멤버일때
                            memberArr.push(value);
                        }else if(guild.value.submaster.includes(value)){
                            // 부길드장 일때
                            submasterArr.push(value);
                        }
                        //길드장일땐 따로 표시 X
                    }));
                    submasterArr.forEach((value)=>{
                        str += `\n        §6부길드장§r:${value}`
                    });
                    memberArr.forEach((value)=>{
                        str += `\n        멤버:${value}`
                    });*/
                break;
            }
            case "joinButton": {
                const form = new SimpleForm;
                const guildList = Object.entries(guild.guilds).map(([name, value], index, arr) => {
                    if (arr.length === 0) {
                        form.setContent("§a서버에 생성된 길드가 없습니다.");
                        return;
                    }
                    form.addButton(new FormButton(`§l${name}\n§r§7레벨:${value.level} 길드장:${value.master} ${getGuilldPlayers(name).length}/${value.settings.maxPlayers}`, "path", value.icon));
                    return { name, value };
                });
                form.sendTo(ni, async (result) => {
                    if (result.response === null) return;
                    if (getGuilldPlayers(name).length === guild.guilds[guildList[result.response]!.name].settings.maxPlayers) {
                        player.sendMessage("§e길드 인원 꽉차서 가입이 취소되었습니다.");
                    }
                    if (guild.guilds[guildList[result.response]!.name].settings.join === "free") {
                        guild.player[name] = guildList[result.response]!.name;
                    } else {
                        guild.guilds[guildList[result.response]!.name].joinRequest.push(name);
                        const form = new CustomForm;
                        form.addComponent(new FormLabel("§e길드 가입 신청을 보냈습니다.\n승인을 기다리세요."));
                        form.sendTo(ni);
                    }
                });
                break;
            }

            case "withdrawButton": {
                const form = new ModalForm;
                form.setContent("§l정말로 길드를 탈퇴하시겠습니까?");
                form.setButtonConfirm("네");
                form.setButtonCancel("아니오");
                form.sendTo(ni, (result) => {
                    if (result.response === true) {
                        delete guild.player[name];
                        guild.guilds[pGuild].submaster.splice(guild.guilds[pGuild].submaster.indexOf(name), 1);
                        player.sendMessage("§a길드를 탈퇴하였습니다.");
                    }
                });
                break;
            }

            case "createButton": {
                const form = new CustomForm;
                form.addComponent(new FormInput("", "길드이름  §7중복불가"));
                form.addComponent(new FormDropdown("길드 가입방식", ["조건 없음", "요청후 승인"], 0));
                form.addComponent(new FormSlider("길드 최대 인원수", 1, 100, undefined, 20));
                form.addComponent(new FormToggle("길드원끼리의 전투 허용", true));
                form.sendTo(ni, (result) => {
                    if (result.response === null) return;
                    if (guild.guilds[result.response[0]] !== undefined) {
                        new CustomForm("", [new FormLabel("길드 이름이 중복되어 생성이 취소 되었습니다.")]).sendTo(ni);
                        return;
                    }
                    if (result.response[0].length > 10) {
                        new CustomForm("", [new FormLabel("길드 이름이 길어서 취소 되었습니다.")]).sendTo(ni);
                        return;
                    }
                    const form = new SimpleForm;
                    form.setContent("\n길드 아이콘 설정\n원하는 아이콘을 선택해주세요. 나중에 바꿀 수 없습니다.\n");
                    guildIcon.forEach((iconPath) => {
                        form.addButton(new FormButton("", 'path', iconPath));
                    });
                    form.sendTo(ni, async (result2) => {
                        if (result2.response === null) {
                            player.sendMessage("길드생성이 취소되었습니다.");
                            return;
                        }
                        guild.guilds[result.response[0]] = {
                            master: name,
                            icon: guildIcon[result2.response],
                            submaster: [],
                            level: 1,
                            settings: { pvp: result.response[3], join: result.response[1] === 0 ? "free" : "request", maxPlayers: result.response[2] },
                            joinRequest: []
                        };
                        guild.player[name] = result.response[0];
                        bedrockServer.executeCommand(`tellraw @a {"rawtext":[{"text":"§e${name}님이 ${result.response[0]}길드를 만들었습니다."}]}`);

                    })
                });
                break;
            }

            case "settingButton": {
                new SimpleForm("", "", [
                    new FormButton("길드 설정"),
                    new FormButton("길드원 관리"),
                    new FormButton("길드 삭제")
                ]).sendTo(ni, async (result) => {
                    switch (result.response) {
                        case 0:
                            new CustomForm("", [
                                new FormDropdown("가입방식", ["제한 없음", "요청후 승인"]),
                                new FormSlider("길드 최대 인원수", 1, 100, undefined, 20),
                                new FormToggle("길드원간의 pvp허용", guild.guilds[pGuild].settings.pvp)
                            ]).sendTo(ni, (result) => {
                                if (result.response === null) return;
                                if (guild.guilds[result.response[0]] !== undefined) {
                                    new CustomForm("", [new FormLabel("길드 이름이 중복되어 생성이 취소 되었습니다.")]).sendTo(ni);
                                    return;
                                }
                                guild.guilds[pGuild].settings = {
                                    join: result.response[0] === 0 ? "free" : "request",
                                    maxPlayers: result.response[1],
                                    pvp: result.response[2]
                                };
                                player.sendMessage(`§a길드 설정이 성공적으로 변경 되었습니다.`);
                            });
                            break;
                        case 1:
                            new SimpleForm("", "", [
                                new FormButton("길드원 강퇴"),
                                new FormButton("부관리자 임명"),
                                new FormButton("부관리자 퇴임")
                            ]).sendTo(ni, async (result) => {
                                switch (result.response) {
                                    case 0: {
                                        const form = new SimpleForm;
                                        let arr: string[] = [];
                                        getGuilldPlayers(pGuild).forEach((value) => {
                                            if (guild.guilds[pGuild].master !== value) {
                                                form.addButton(new FormButton(value));
                                                arr.push(value);
                                            }
                                        });
                                        form.sendTo(ni, async (result) => {
                                            if (result.response === null) return;
                                            delete guild.player[arr[result.response]];
                                            player.sendMessage(`§a${arr[result.response]}를 내보냈습니다.`);
                                        });
                                        break;
                                    }
                                    case 1: {
                                        const form = new SimpleForm;
                                        let arr: string[] = [];
                                        getGuilldPlayers(pGuild).forEach((value) => {
                                            if (!guild.guilds[pGuild].submaster.includes(value) && guild.guilds[pGuild].master !== value) {
                                                form.addButton(new FormButton(value));
                                                arr.push(value);
                                            }
                                        });
                                        form.sendTo(ni, async (result) => {
                                            if (result.response === null) return;
                                            guild.guilds[pGuild].submaster.push(arr[result.response]);
                                            player.sendMessage(`§a${arr[result.response]}를 부길드장으로 임명했습니다.`);
                                        });
                                        break;
                                    }
                                    case 2: {
                                        const form = new SimpleForm;
                                        let arr: string[] = [];
                                        getGuilldPlayers(pGuild).forEach((value) => {
                                            if (guild.guilds[pGuild].submaster.includes(value)) {
                                                form.addButton(new FormButton(value));
                                                arr.push(value);
                                            }
                                        });
                                        form.sendTo(ni, async (result) => {
                                            if (result.response === null) return;
                                            delete guild.player[arr[result.response]];
                                            guild.guilds[pGuild].submaster.splice(guild.guilds[pGuild].submaster.indexOf(arr[result.response]), 1);
                                            player.sendMessage(`§a${arr[result.response]}를 부길드장에서 퇴임시켰습니다.`);
                                        });
                                        break;
                                    }
                                    default: return;
                                }
                            });
                            break;
                        case 2:
                            const modalForm = new ModalForm("", "정말로 길드를 삭제하시겠습니까?\n\n§4삭제된 후에는 다시 복구할 수 없습니다.")
                            modalForm.setButtonConfirm("예");
                            modalForm.setButtonCancel("아니오");
                            modalForm.sendTo(ni, (result) => {
                                if (result.response === true) {
                                    delete guild.guilds[pGuild];
                                    getGuilldPlayers(pGuild).forEach((name) => {
                                        delete guild.player[name];
                                    });
                                }
                            });
                            break;
                        default: return;
                    }
                });
                break;
            }
            case "joinConfirmButton": {
                const form = new SimpleForm;
                let arr: string[] = [];
                guild.guilds[pGuild].joinRequest.forEach((value) => {
                    form.addButton(new FormButton(value));
                    arr.push(value);
                });
                form.sendTo(ni, async (result) => {
                    if (result.response === null) return;
                    const form = new ModalForm("", `정말로 ${guild.guilds[pGuild].joinRequest[guild.guilds[pGuild].joinRequest.indexOf(arr[result.response])]}의 길드 가입 요청을 승인하시겠습니까?`);
                    form.setButtonConfirm("가입 승인");
                    form.setButtonCancel("가입 취소");
                    form.sendTo(ni, (result2) => {
                        if (result2.response === true) {
                            guild.player[guild.guilds[pGuild].joinRequest[guild.guilds[pGuild].joinRequest.indexOf(arr[result.response])]] = pGuild;
                            bedrockServer.executeCommand(`tellraw ${guild.guilds[pGuild].joinRequest[guild.guilds[pGuild].joinRequest.indexOf(arr[result.response])]} {"rawtext":[{"text":"§e${pGuild} 길드 가입 요청이 승인되었습니다."}]}`);
                            player.sendMessage("§e가입 승인이 완료되었습니다.");
                        } else {
                            bedrockServer.executeCommand(`tellraw ${guild.guilds[pGuild].joinRequest[guild.guilds[pGuild].joinRequest.indexOf(arr[result.response])]} {"rawtext":[{"text":"§e${pGuild} 길드 가입 요청이 취소되었습니다."}]}`);
                            player.sendMessage("§e가입 승인이 취소되었습니다.");
                        }
                        guild.guilds[pGuild].joinRequest.splice(guild.guilds[pGuild].joinRequest.indexOf(arr[result.response]), 1);
                    });

                });
            }
            default: return;
        }
    });
}, {});
guildCommand1.alias("길드");

const guildCommand = command.register('guild', '운영자 전용 - 길드 관리', CommandPermissionLevel.Operator)
guildCommand.overload(async (param, origin) => {
    const player = origin.getEntity();
    if (!player?.isPlayer()) return;
    const ni = player.getNetworkIdentifier();
    const name = player.getName();
    new SimpleForm("", "", [new FormButton("삭제"), new FormButton("레벨 관리"), new FormButton("정렬기준")]).sendTo(ni, async (result) => {
        switch (result.response) {
            case 0: {
                const form = new SimpleForm;
                let arr: string[] = [];
                Object.entries(guild.guilds).forEach(([name, value]) => {
                    form.addButton(new FormButton(name));
                    arr.push(name);
                });
                form.sendTo(ni, async (result) => {
                    if (result.response === null) return;
                    delete guild.guilds[arr[result.response]];
                    getGuilldPlayers(arr[result.response]).forEach((name) => {
                        delete guild.player[name];
                    });
                });
                break;
            }
            case 1: {
                const form = new SimpleForm;
                let arr: string[] = [];
                Object.entries(guild.guilds).forEach(([name, value]) => {
                    form.addButton(new FormButton(name));
                    arr.push(name);
                });
                form.sendTo(ni, async (result) => {
                    if (result.response === null) return;
                    new CustomForm("", [new FormSlider("레벨", 1, 100)]).sendTo(ni, async (result2) => {
                        if (result.response === null) return;
                        guild.guilds[arr[result.response]].level = result2.response[0];
                    });
                });
                break;
            }
            case 2: {
                const form = new SimpleForm("", "", [new FormButton("인원수 기준"), new FormButton("레벨 기준")]);
                form.sendTo(ni, async (result) => {
                    if (result.response === null) return;
                    settings.guildSort = result.response === 0 ? "members" : "level";
                });
                break;
            }
            default: return;
        }
    });

}, {

});
events.playerAttack.on((ev) => {
    const name = ev.player.getName();
    if (ev.victim.isPlayer() && guild.player[name] !== undefined && guild.player[name] === guild.player[ev.victim.getName()] && !guild.guilds[guild.player[name]].settings.pvp) {
        (ev.player as ServerPlayer).sendActionbar("§a길드원끼리 전투할 수 없습니다.");
        return CANCEL;
    }
});