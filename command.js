"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("bdsx/command");
const form_1 = require("bdsx/bds/form");
const command_2 = require("../bdsx/bds/command");
const system = server.registerSystem(0, 0);
let originName;
command_1.command.register('spawn', '스폰으로 tp됩니다').overload((param, origin, output) => {
    originName = origin.getName();
    spawnTP(origin);
}, {});
command_1.command.register('스폰', '스폰으로 tp됩니다').overload((param, origin, output) => {
    originName = origin.getName();
    spawnTP(origin);
}, {});
command_1.command.register('도움말', '명령어로 할수있는 짓거리를 나타냅니다').overload((param, origin, output) => {
    system.executeCommand(`tellraw ${origin.getName()} {"rawtext":[{"text":"§a/도움말, //help§r: §e명령어로 할수있는 짓거리를 나타탭니다\n§a/spawn또는 /스폰§r: §e스폰으로 순간이동합니다\n"}]}`, () => { });
}, {});
command_1.command.register('/help', '명령어로 할수있는 짓거리를 나타냅니다').overload((param, origin, output) => {
    system.executeCommand(`tp ${origin.getName()} 155 69 91`, () => { });
}, {});
command_1.command.register('notice', '채팅형식의 공지를 올립니다', command_2.CommandPermissionLevel.Operator).overload((param, origin, output) => {
    system.executeCommand(`tellraw @a {"rawtext":[{"text":"§a<Server> §e${param}"}]}`, () => { });
    console.log(`[명령어사용] 공지 사용감지 사용자: ${origin}  내용:${param}`);
}, {});
async function spawnTP(origin) {
    const actor = origin.getEntity();
    if (actor === null) {
        console.log("It is for player");
        return;
    }
    const ni = actor.getNetworkIdentifier();
    const isYes = await form_1.Form.sendTo(ni, {
        type: 'modal',
        title: 'TP',
        content: '정말 스폰으로 이동하시겠습니까?',
        button1: '네',
        button2: '아니요'
    });
    if (isYes) {
        system.executeCommand(`tp ${originName} 155 69 91`, () => { });
    }
}
async function store(origin) {
    const actor = origin.getEntity();
    if (actor === null) {
        console.log("It is for player");
        return;
    }
    const ni = actor.getNetworkIdentifier();
    const isYes = await form_1.Form.sendTo(ni, {
        type: 'modal',
        title: 'TP',
        content: '정말 상점으로 이동하시겠습니까?',
        button1: '네',
        button2: '아니요'
    });
    if (isYes) {
        system.executeCommand(`tp ${originName} 155 69 91`, () => { });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNvbW1hbmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwwQ0FBdUM7QUFDdkMsd0NBQW1DO0FBQ25DLGlEQUE2RDtBQUc3RCxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQztBQUMxQyxJQUFJLFVBQWtCLENBQUM7QUFFdkIsaUJBQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLFlBQVksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFDLEVBQUU7SUFDdEUsVUFBVSxHQUFHLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUM5QixPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDcEIsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBRVAsaUJBQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFDLEVBQUU7SUFDbkUsVUFBVSxHQUFHLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUM5QixPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDcEIsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ1AsaUJBQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLHNCQUFzQixDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUMsRUFBRTtJQUM5RSxNQUFNLENBQUMsY0FBYyxDQUFDLFdBQVcsTUFBTSxDQUFDLE9BQU8sRUFBRSx3R0FBd0csRUFBQyxHQUFFLEVBQUUsR0FBQyxDQUFDLENBQUMsQ0FBQztBQUN0SyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFFUCxpQkFBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsc0JBQXNCLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBQyxFQUFFO0lBQ2hGLE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxNQUFNLENBQUMsT0FBTyxFQUFFLFlBQVksRUFBQyxHQUFFLEVBQUUsR0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFFUCxpQkFBTyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUMsZ0JBQWdCLEVBQUUsZ0NBQXNCLENBQUMsUUFBUSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUMsRUFBRTtJQUMzRyxNQUFNLENBQUMsY0FBYyxDQUFDLGdEQUFnRCxLQUFLLE1BQU0sRUFBQyxHQUFFLEVBQUUsR0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxRixPQUFPLENBQUMsR0FBRyxDQUFDLHdCQUF3QixNQUFNLFFBQVEsS0FBSyxFQUFFLENBQUMsQ0FBQztBQUMvRCxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFJUCxLQUFLLFVBQVUsT0FBTyxDQUFDLE1BQXFCO0lBQ3hDLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUNqQyxJQUFHLEtBQUssS0FBSyxJQUFJLEVBQUM7UUFDZCxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDaEMsT0FBTztLQUNWO0lBRUQsTUFBTSxFQUFFLEdBQUcsS0FBSyxDQUFDLG9CQUFvQixFQUFFLENBQUM7SUFFeEMsTUFBTSxLQUFLLEdBQUcsTUFBTSxXQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRTtRQUNoQyxJQUFJLEVBQUUsT0FBTztRQUNiLEtBQUssRUFBRSxJQUFJO1FBQ1gsT0FBTyxFQUFFLG1CQUFtQjtRQUM1QixPQUFPLEVBQUUsR0FBRztRQUNaLE9BQU8sRUFBRSxLQUFLO0tBQ2pCLENBQUMsQ0FBQztJQUNILElBQUksS0FBSyxFQUFFO1FBQ1AsTUFBTSxDQUFDLGNBQWMsQ0FBQyxNQUFNLFVBQVUsWUFBWSxFQUFDLEdBQUUsRUFBRSxHQUFDLENBQUMsQ0FBQyxDQUFDO0tBQzlEO0FBQ0wsQ0FBQztBQUNELEtBQUssVUFBVSxLQUFLLENBQUMsTUFBb0I7SUFDckMsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQ2pDLElBQUcsS0FBSyxLQUFLLElBQUksRUFBQztRQUNkLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUNoQyxPQUFPO0tBQ1Y7SUFDRCxNQUFNLEVBQUUsR0FBRyxLQUFLLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztJQUN4QyxNQUFNLEtBQUssR0FBRyxNQUFNLFdBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFO1FBQ2hDLElBQUksRUFBRSxPQUFPO1FBQ2IsS0FBSyxFQUFFLElBQUk7UUFDWCxPQUFPLEVBQUUsbUJBQW1CO1FBQzVCLE9BQU8sRUFBRSxHQUFHO1FBQ1osT0FBTyxFQUFFLEtBQUs7S0FDakIsQ0FBQyxDQUFDO0lBQ0gsSUFBSSxLQUFLLEVBQUU7UUFDUCxNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sVUFBVSxZQUFZLEVBQUMsR0FBRSxFQUFFLEdBQUMsQ0FBQyxDQUFDLENBQUM7S0FFOUQ7QUFDTCxDQUFDIn0=