import { ActorType } from "bdsx/bds/actor";
import { IdByName } from "./connection";
import { NetworkIdentifier } from "bdsx/bds/networkidentifier";
import { SetHealthPacket, TextPacket } from "bdsx/bds/packets";
import { command } from "bdsx/command";
import { CommandPermissionLevel } from "../bdsx/bds/command";
import { events } from "bdsx/event";
function setHealth(networkIdentifier: NetworkIdentifier, value: number) {
    const HealthPacket = SetHealthPacket.create();
    HealthPacket.setInt32(value, 0x30);
    HealthPacket.sendTo(networkIdentifier, 0);
    HealthPacket.dispose();
}
function sendText(target: NetworkIdentifier|string, text: string, type?: number) {
    let networkIdentifier:NetworkIdentifier;
    if (target instanceof NetworkIdentifier) networkIdentifier = target;
    else {
        let id = IdByName(target);
        if (id instanceof NetworkIdentifier) networkIdentifier = id;
    }
    if ( type === undefined || typeof type !== "number") type = 0;
    const Packet = TextPacket.create();
    Packet.message = text;
    Packet.setUint32(type, 0x30);
    Packet.sendTo(networkIdentifier!, 0);
    Packet.dispose();
}
events.entityHurt.on((ev)=>{
    const type: number = ev.entity.getEntityTypeId();
    console.log(ActorType[type]);
});
//events.playerUseItem.on((ev)=>{
//});
events.playerJoin.on(ev => {
    ev.player.setScoreTag("지극히 평범한 평민");
    ev.player.setSize(0.5,1);
    if(ev.player.getName() == "wwwcomcom"){
        ev.player.setScoreTag("§a방장");
    }
});

command.register('text', 'test', CommandPermissionLevel.Operator).overload((param, origin, output) => {
    sendText('wwwcomcom','Testssssssss',1);
},{});