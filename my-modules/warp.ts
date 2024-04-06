import { command } from "bdsx/command";
import { CommandMessage, CommandPermissionLevel, CommandPositionFloat } from "bdsx/bds/command";
import { bedrockServer } from "bdsx/launcher";
import { events } from "bdsx/event";
import { FormButton, SimpleForm } from "bdsx/bds/form";
import fs = require("fs");
import { CommandOrigin } from "bdsx/bds/commandorigin";
import { Vec3 } from "bdsx/bds/blockpos";

const jsonfile = fs.readFileSync('../my-modules/warpList.json', 'utf-8');
const warpList: { warps: { name: string, pos: { x: number, y: number, z: number } }[] } = JSON.parse(jsonfile);
const warpCommand = command.register('settingwarp', '워프 설정', CommandPermissionLevel.Operator);

warpCommand.overload(async (param, origin, output) => {
    const message: string = param.name.getMessage(origin);
    const position = param.pos.getPosition(origin);
    if (position === undefined) return;
    const warp = { name: message, pos: position }
    warpList.warps.push(warp);
}, {
    mode: command.enum("add", "add"),
    pos: CommandPositionFloat,
    name: CommandMessage
});

warpCommand.overload(async (param, origin, output) => {
    const actor = origin.getEntity();
    if (actor === null) return;
    if (!actor.isPlayer()) return;
    const ni = actor.getNetworkIdentifier()
    const form = new SimpleForm;
    form.setTitle("워프삭제");
    warpList.warps.map((value) => {
        const button = new FormButton(`${value.name}\n${value.pos}`, "path", "textures/blocks/barrier");
        form.addButton(button);
    });
    form.sendTo(ni, (result) => {
        const Result: number | null = result.response;
        if (Result === null) return;
        warpList.warps.splice(Result, 1);
    });
}, {
    mode: command.enum("remove", "remove")
});
let time: any = {};
events.entityHurt.on((ev) => {
    if (!ev.entity.isPlayer()) return;
    time[ev.entity.getName()] = new Date();
});
function warp(origin: CommandOrigin) {
    const actor = origin.getEntity();
    if (actor === null) return;
    if (!actor.isPlayer()) return;
    const name = actor.getName();
    if (time[name] === undefined) {
        time[name] = new Date();
    } else if (Number(new Date()) - time[name] < 3000) {
        let Day: any = new Date;
        let remainTime: any = 3 - (Day - time[name]) / 1000;
        bedrockServer.executeCommand(`tellraw ${name} {"rawtext":[{"text":"§e전투중(최근 데미지를입은경우)에는 워프할 수 없습니다.\n§a${remainTime.toFixed(1)}초 남음"}]}`);
        return;
    }
    const ni = actor.getNetworkIdentifier();
    const form = new SimpleForm;
    form.setTitle("워프");
    warpList.warps.map((value) => {
        const button = new FormButton(value.name);
        form.addButton(button);
    });
    form.sendTo(ni, (result) => {
        const Result: number | null = result.response;
        if (Result === null) return;
        actor.teleport(Vec3.create(warpList.warps[Result].pos.x, warpList.warps[Result].pos.y, warpList.warps[Result].pos.z));
    });
}
command.register('warp', '워프').overload((param, origin) => { warp(origin) }, {});
command.register('워프', '워프').overload((param, origin) => { warp(origin) }, {});
const saveInterval = setInterval(() => {
    fs.writeFileSync("../my-modules/warpList.json", JSON.stringify(warpList));
}, 100000);
events.serverLeave.on(() => {
    clearInterval(saveInterval);
    fs.writeFileSync("../my-modules/warpList.json", JSON.stringify(warpList));
});