import { CommandMessage, CommandPermissionLevel, PlayerCommandSelector } from "bdsx/bds/command";
import { FormButton, SimpleForm } from "bdsx/bds/form";
import { NetworkIdentifier } from "bdsx/bds/networkidentifier";
import { MinecraftPacketIds } from "bdsx/bds/packetids";
import { ServerPlayer } from "bdsx/bds/player";
import { command } from "bdsx/command";
import { events } from "bdsx/event";
import { bedrockServer } from "bdsx/launcher";
import { CxxString } from "bdsx/nativetype";
import fs = require("fs");
const data = fs.readFileSync("../my-modules/banList.json", "utf-8");
const banList: { bans: { id: string, reason: string, name: string }[] } = JSON.parse(data);
/** * <username,deviceId> */
let idList = new Map<NetworkIdentifier, string>();

events.packetAfter(MinecraftPacketIds.Login).on((pkt, ni) => {
    const connreq = pkt.connreq;
    if (connreq === null) return;
    const deviceId = connreq.getDeviceId();
    let isBanned = false;
    for (let i = 0; i < banList.bans.length; i++) {
        const value = banList.bans[i];
        const name = connreq.getCertificate().getId();
        if (deviceId.length === 0) {
            if (value.id === deviceId || value.name === name) {
                bedrockServer.serverInstance.disconnectClient(ni, `밴 사유:${value.reason}`);
                console.log(`밴당한 ${name}의 접속시도`);
                isBanned = true;
                break;
            } else {
                continue;
            }
        } else {
            if (value.name === name) {
                bedrockServer.serverInstance.disconnectClient(ni, `밴 사유:${value.reason}`);
                console.log(`밴당한 ${name}의 접속시도`);
                isBanned = true;
                break;
            } else {
                continue;
            }
        }
    }
    if (isBanned) return;
    idList.set(ni, deviceId);
});

events.packetBefore(MinecraftPacketIds.Disconnect).on((pkt, ni) => {
    idList.delete(ni);
});


command.register('ban', '밴먹임', CommandPermissionLevel.Operator).overload((param, origin, output) => {
    const msg = param.reason.getMessage(origin);
    const targets = param.target.newResults(origin, ServerPlayer);

    for (const player of targets) {

        const id = idList.get(player.getNetworkIdentifier());
        if (id === undefined) continue;
        banList.bans.push({ id: id, reason: msg, name: player.getName() });
    }
    targets.map((value, index) => {
        if (!value.isPlayer()) targets.splice(index, 1);
        else {
            bedrockServer.serverInstance.disconnectClient(value.getNetworkIdentifier(), msg);
        }
    });
}, {
    target: PlayerCommandSelector,
    reason: CommandMessage
});

events.serverLeave.on(() => {
    const string = JSON.stringify(banList);
    fs.writeFileSync("../my-modules/banList.json", string);
});

command.register('pardon', '밴 품', CommandPermissionLevel.Operator).overload((param, origin, output) => {
    if (param.target === undefined) {
        const player = origin.getEntity();
        if (!player?.isPlayer()) return;
        const form = new SimpleForm;
        banList.bans.forEach((value, index) => {
            form.addButton(new FormButton(`${value.name} ${value.name}`));
        });
        form.sendTo(player.getNetworkIdentifier(), (result) => {
            if (result.response === null) return;
            banList.bans.splice(result.response, 1);
            bedrockServer.executeCommand(`§e${banList.bans[result.response].name}님의 밴이 풀렸습니다.`);
        });
    } else {
        banList.bans.forEach((value, index) => {
            if (value.name === param.target) {
                banList.bans.splice(index, 1);
                bedrockServer.executeCommand(`§e${value.name}님의 밴이 풀렸습니다.`);
                return;
            }
        })
    }
}, {
    target: [CxxString, true]
});