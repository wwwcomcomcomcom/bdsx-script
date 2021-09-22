"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const packetids_1 = require("bdsx/bds/packetids");
const common_1 = require("bdsx/common");
const event_1 = require("bdsx/event");
const launcher_1 = require("bdsx/launcher");
const command_1 = require("bdsx/command");
const form_1 = require("bdsx/bds/form");
const command_2 = require("../bdsx/bds/command");
const actor_1 = require("bdsx/bds/actor");
let time = {};
let formResult = [true, 30, 1500, 0];
let rank;
const system = server.registerSystem(0, 0);
let nIt = new Map();
const packets_1 = require("bdsx/bds/packets");
function setHealth(networkIdentifier, value) {
    const HealthPacket = packets_1.SetHealthPacket.create();
    HealthPacket.setInt32(value, 0x30);
    HealthPacket.sendTo(networkIdentifier, 0);
    HealthPacket.dispose();
}
;
event_1.events.entityHurt.on((ev) => {
    ev.damage = 100;
    const type = ev.entity.getEntityTypeId();
    console.log(actor_1.ActorType[type]);
});
//events.playerUseItem.on((ev)=>{
//});
event_1.events.playerJoin.on(ev => {
    ev.player.setScoreTag("지극히 평범한 평민");
    ev.player.setSize(0.5, 1);
    if (ev.player.getName() == "wwwcomcom") {
        ev.player.setScoreTag("§a방장");
    }
});
event_1.events.blockDestroy.on(ev => {
    return common_1.CANCEL;
});
event_1.events.blockPlace.on(ev => {
    return common_1.CANCEL;
});
event_1.events.packetBefore(packetids_1.MinecraftPacketIds.Text).on(ev => {
    if (formResult[0]) {
        if (time[ev.name] === undefined) {
            time[ev.name] = new Date();
        }
        else if (Number(new Date()) - time[ev.name] < formResult[2]) {
            let Day = new Date;
            let remainTime = (formResult[2] / 1000) - (Day - time[ev.name]) / 1000;
            launcher_1.bedrockServer.executeCommand(`tellraw @a[name="${ev.name}"] {"rawtext":[{"text":"§e도배금지입니다 잠시후 다시시도해주세요\n§a${remainTime.toFixed(1)}초 남음"}]}`);
            console.log(`[경고]${ev.name}님의 도배경고-->경고사유:너무 빠른 채팅`);
            return common_1.CANCEL;
        }
        else {
            time[ev.name] = new Date();
        }
        if (ev.message.length >= formResult[1]) {
            launcher_1.bedrockServer.executeCommand(`tellraw @a[name="${ev.name}"] {"rawtext":[{"text":"§e도배금지입니다 ${formResult[1]}자이상의 채팅은 자제해주세요"}]}`);
            console.log(`[경고]${ev.name}님의 도배경고-->경고사유:너무 긴 채팅`);
            return common_1.CANCEL;
        }
        if (ev.message.match("검열") != null) {
            launcher_1.bedrockServer.executeCommand(`tellraw @a[name="${ev.name}"] {"rawtext":[{"text":"§e검열된 메시지로 보낼수가 없습니다\n§e검열 대상:'검열'"}]}`);
            console.log(`[경고] "검열" 메시지 감지/실행자:${ev.name}`);
            return common_1.CANCEL;
        }
        system.executeCommand(`tag "${ev.name}" list`, (output) => {
            var _a, _b;
            let test1 = (_a = output.data.statusMessage.match("_")) === null || _a === void 0 ? void 0 : _a.index;
            let test2 = (_b = output.data.statusMessage.match("-")) === null || _b === void 0 ? void 0 : _b.index;
            rank = `${output.data.statusMessage.substring(test1 + 1, test2)}`;
        });
        switch (formResult[3]) {
            case 0:
                ev.message = `§r${ev.message}`;
                break;
            case 1:
                ev.message = `§b${ev.message}`;
                break;
            case 2:
                ev.message = `§e${ev.message}`;
                break;
            case 3:
                ev.message = `§a${ev.message}`;
                break;
            case 4:
                ev.message = `§c${ev.message}`;
                break;
        }
        if (!rank.match("has no tags")) {
            ev.message = `[§a${rank}§r] ${ev.message}`;
        }
    }
    console.log(`[채팅]<${ev.name}> ${ev.message}`);
});
command_1.command.register('settingchat', '채팅 관리 옵션을 봅니다.', command_2.CommandPermissionLevel.Operator).overload(async (param, origin, output) => {
    const actor = origin.getEntity();
    if (actor === null) {
        console.log("it's the command for players");
        return;
    }
    const ni = actor.getNetworkIdentifier();
    const res = await form_1.Form.sendTo(ni, {
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
                max: 50,
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
    if (res === null)
        return; // x pressed
    formResult = [res[0], res[1], res[2], res[3]];
    console.log(formResult);
}, {});
command_1.command.register('form', 'form example').overload(async (param, origin, output) => {
    const actor = origin.getEntity();
    if (actor === null) {
        console.log("it's the command for players");
        return;
    }
    const ni = actor.getNetworkIdentifier();
    const isYes = await form_1.Form.sendTo(ni, {
        type: 'modal',
        title: 'Form Example',
        content: 'Open more forms',
        button1: 'yes',
        button2: 'no',
    });
    if (isYes) {
        const res = await form_1.Form.sendTo(ni, {
            type: 'custom_form',
            title: 'Form Example',
            content: [
                {
                    type: 'label',
                    text: 'label'
                },
                {
                    type: 'toggle',
                    text: 'toggle',
                    default: true
                },
                {
                    type: 'slider',
                    text: 'slider',
                    min: 0,
                    max: 10,
                    default: 6,
                    step: 2
                },
                {
                    type: 'step_slider',
                    text: 'step_slider',
                    steps: ['step0', 'step1', 'step2'],
                    default: 1,
                },
                {
                    type: 'dropdown',
                    text: 'dropdown',
                    options: ['dropdown0', 'dropdown1', 'dropdown2'],
                    default: 1
                },
                {
                    type: 'input',
                    text: 'input',
                    placeholder: 'placeholder',
                    default: 'deftext'
                },
            ]
        });
        if (res === null)
            return; // x pressed
        // alternative way
        const altform = new form_1.CustomForm;
        altform.setTitle('Alt Form');
        for (let i = 0; i < res.length; i++) {
            altform.addComponent(new form_1.FormLabel(`Value ${i} = ${res[i]}`));
        }
        altform.sendTo(ni);
    }
}, {});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNoYXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxrREFBd0Q7QUFDeEQsd0NBQXFDO0FBQ3JDLHNDQUFvQztBQUNwQyw0Q0FBOEM7QUFDOUMsMENBQXVDO0FBQ3ZDLHdDQUE0RDtBQUM1RCxpREFBNkQ7QUFDN0QsMENBQTJDO0FBQzNDLElBQUksSUFBSSxHQUFTLEVBQUUsQ0FBQztBQUNwQixJQUFJLFVBQVUsR0FBTyxDQUFDLElBQUksRUFBQyxFQUFFLEVBQUMsSUFBSSxFQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3RDLElBQUksSUFBUSxDQUFDO0FBQ2IsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUM7QUFDMUMsSUFBSSxHQUFHLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUdwQiw4Q0FBbUQ7QUFFbkQsU0FBUyxTQUFTLENBQUMsaUJBQW9DLEVBQUUsS0FBYTtJQUNsRSxNQUFNLFlBQVksR0FBRyx5QkFBZSxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQzlDLFlBQVksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ25DLFlBQVksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDMUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzNCLENBQUM7QUFBQSxDQUFDO0FBQ0YsY0FBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUMsRUFBRTtJQUN2QixFQUFFLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQztJQUNoQixNQUFNLElBQUksR0FBVyxFQUFFLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxDQUFDO0lBQ2pELE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ2pDLENBQUMsQ0FBQyxD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