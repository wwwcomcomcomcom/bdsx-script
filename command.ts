import { command } from "bdsx/command";
import { Form } from "bdsx/bds/form";
import { CommandPermissionLevel } from "../bdsx/bds/command";
import { CommandOrigin } from "../bdsx/bds/commandorigin";

const system = server.registerSystem(0,0);
let originName: string;

command.register('spawn', '스폰으로 tp됩니다').overload((param, origin, output)=>{
    originName = origin.getName();
    spawnTP(origin);
}, {});

command.register('스폰', '스폰으로 tp됩니다').overload((param, origin, output)=>{
    originName = origin.getName();
    spawnTP(origin);
}, {});
command.register('도움말', '명령어로 할수있는 짓거리를 나타냅니다').overload((param, origin, output)=>{
    system.executeCommand(`tellraw ${origin.getName()} {"rawtext":[{"text":"§a/도움말, //help§r: §e명령어로 할수있는 짓거리를 나타탭니다\n§a/spawn또는 /스폰§r: §e스폰으로 순간이동합니다\n"}]}`,()=>{});
}, {});

command.register('/help', '명령어로 할수있는 짓거리를 나타냅니다').overload((param, origin, output)=>{
    console.log(origin.getEntity().getCommandPermissionLevel());
    system.executeCommand(`tellraw ${origin.getName()} {"rawtext":[{"text":"§a/도움말, //help§r: §e명령어로 할수있는 짓거리를 나타탭니다\n§a/spawn또는 /스폰§r: §e스폰으로 순간이동합니다\n"}]}`,()=>{});
}, {});

command.register('notice','채팅형식의 공지를 올립니다', CommandPermissionLevel.Operator).overload((param, origin, output)=>{
    system.executeCommand(`tellraw @a {"rawtext":[{"text":"§a<Server> §e${param}"}]}`,()=>{});
    console.log(`[명령어사용] (공지 사용) 사용자: ${origin}  내용:${param}`);
}, {});



async function spawnTP(origin: CommandOrigin){
    const actor = origin.getEntity();
    if(actor === null){
        console.log("It is for player");
        return;
    }

    const ni = actor.getNetworkIdentifier();

    const isYes = await Form.sendTo(ni, {
        type: 'modal',
        title: 'TP',
        content: '정말 스폰으로 이동하시겠습니까?',
        button1: '네',
        button2: '아니요'
    });
    if (isYes) {
        system.executeCommand(`tp ${originName} 155 69 91`,()=>{});
    }
}
async function store(origin:CommandOrigin) {
    const actor = origin.getEntity();
    if(actor === null){
        console.log("It is for player");
        return;
    }
    const ni = actor.getNetworkIdentifier();
    const isYes = await Form.sendTo(ni, {
        type: 'modal',
        title: 'TP',
        content: '정말 상점으로 이동하시겠습니까?',
        button1: '네',
        button2: '아니요'
    });
    if (isYes) {
        system.executeCommand(`tp ${originName} 155 69 91`,()=>{});
        
    }
}