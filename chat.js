"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const packetids_1 = require("bdsx/bds/packetids");
const common_1 = require("bdsx/common");
const event_1 = require("bdsx/event");
const launcher_1 = require("bdsx/launcher");
const command_1 = require("bdsx/command");
const form_1 = require("bdsx/bds/form");
const command_2 = require("../bdsx/bds/command");
const fs = require("fs");
let test = fs.readFileSync("../my-script/test.json", "utf-8");
let data = JSON.parse(test);
console.log(data.test);
let time = {};
let formResult = [true, 30, 1500, 0];
let rank;
const system = server.registerSystem(0, 0);
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
        system.executeCommand(`tag "${ev.name}" list`, (output) => {
            var _a, _b;
            let test1 = (_a = output.data.statusMessage.match("_")) === null || _a === void 0 ? void 0 : _a.index;
            let test2 = (_b = output.data.statusMessage.match("-")) === null || _b === void 0 ? void 0 : _b.index;
            rank = `${output.data.statusMessage.substring(test1 + 1, test2)}`;
        });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNoYXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxrREFBd0Q7QUFDeEQsd0NBQXFDO0FBQ3JDLHNDQUFvQztBQUNwQyw0Q0FBOEM7QUFDOUMsMENBQXVDO0FBQ3ZDLHdDQUFxQztBQUNyQyxpREFBNkQ7QUFFN0QseUJBQTBCO0FBQzFCLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsd0JBQXdCLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDOUQsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUU1QixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUd2QixJQUFJLElBQUksR0FBUyxFQUFFLENBQUM7QUFDcEIsSUFBSSxVQUFVLEdBQU8sQ0FBQyxJQUFJLEVBQUMsRUFBRSxFQUFDLElBQUksRUFBQyxDQUFDLENBQUMsQ0FBQztBQUN0QyxJQUFJLElBQVEsQ0FBQztBQUNiLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDO0FBSzFDLGNBQU0sQ0FBQyxZQUFZLENBQUMsOEJBQWtCLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0lBQ2pELElBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFDO1FBQ2IsSUFBRyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLFNBQVMsRUFBQztZQUMzQixJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7U0FDOUI7YUFBSyxJQUFHLE1BQU0sQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUM7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