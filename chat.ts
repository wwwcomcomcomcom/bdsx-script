import { MinecraftPacketIds } from "bdsx/bds/packetids";
import { CANCEL } from "bdsx/common";
import { events } from "bdsx/event";
import { bedrockServer } from "bdsx/launcher";
import { command } from "bdsx/command";
import { Form } from "bdsx/bds/form";
import { CommandPermissionLevel } from "../bdsx/bds/command";
let time : any = {};
let formResult:any = [true,30,1500,0];
let rank:any;
const system = server.registerSystem(0,0);




events.packetBefore(MinecraftPacketIds.Text).on(ev => {
    if(formResult[0]){
        if(time[ev.name] === undefined){
            time[ev.name] = new Date();
        }else if(Number(new Date()) - time[ev.name] < formResult[2]){
            let Day:any = new Date;
            let remainTime:any = (formResult[2]/1000)-(Day - time[ev.name])/1000;
            bedrockServer.executeCommand(`tellraw @a[name="${ev.name}"] {"rawtext":[{"text":"§e도배금지입니다 잠시후 다시시도해주세요\n§a${remainTime.toFixed(1)}초 남음"}]}`);
            console.log(`[경고]${ev.name}님의 도배경고-->경고사유:너무 빠른 채팅`);
            return CANCEL;
        }else {
            time[ev.name] = new Date();
        }
        
        if(ev.message.length >= formResult[1]){
            bedrockServer.executeCommand(`tellraw @a[name="${ev.name}"] {"rawtext":[{"text":"§e도배금지입니다 ${formResult[1]}자이상의 채팅은 자제해주세요"}]}`);
            console.log(`[경고]${ev.name}님의 도배경고-->경고사유:너무 긴 채팅`);
            return CANCEL;
        }
        
        if(ev.message.match("검열") != null){
            bedrockServer.executeCommand(`tellraw @a[name="${ev.name}"] {"rawtext":[{"text":"§e검열된 메시지로 보낼수가 없습니다\n§e검열 대상:'검열'"}]}`);
            console.log(`[경고] "검열" 메시지 감지/실행자:${ev.name}`);
            return CANCEL;
        }
        switch(formResult[3]){
            case 0:ev.message = `§r${ev.message}`; break;
            case 1:ev.message = `§b${ev.message}`; break;
            case 2:ev.message = `§e${ev.message}`; break;
            case 3:ev.message = `§a${ev.message}`; break;
            case 4:ev.message = `§c${ev.message}`; break;
        }
        system.executeCommand(`tag "${ev.name}" list`,(output)=>{
            let test1:any = output.data.statusMessage.match("_")?.index;
            let test2:any = output.data.statusMessage.match("-")?.index;
            rank = `${output.data.statusMessage.substring(test1+1,test2)}`
        });
        if(!rank.match("has no tags")){
            ev.message = `[§a${rank}§r] ${ev.message}`;
        }
    }
    console.log(`[채팅]<${ev.name}> ${ev.message}`);
});
command.register('settingchat', '채팅 관리 옵션을 봅니다.', CommandPermissionLevel.Operator).overload(async (param, origin, output) => {
    const actor = origin.getEntity();
    if (actor === null) {
        console.log("it's the command for players");
        return;
    }
    const ni = actor.getNetworkIdentifier();

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
                options: ['흰색', '§b파란색', '§e노란색','§a초록색','§c빨강색'],
                default: formResult[3]
            }
        ]
    });
if (res === null) return; // x pressed
        formResult = [res[0],res[1],res[2],res[3]];
        console.log(formResult);
},{});