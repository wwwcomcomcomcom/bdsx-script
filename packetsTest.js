"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const actor_1 = require("bdsx/bds/actor");
const connection_1 = require("./connection");
const networkidentifier_1 = require("bdsx/bds/networkidentifier");
const packets_1 = require("bdsx/bds/packets");
const command_1 = require("bdsx/command");
const command_2 = require("../bdsx/bds/command");
const event_1 = require("bdsx/event");
function setHealth(networkIdentifier, value) {
    const HealthPacket = packets_1.SetHealthPacket.create();
    HealthPacket.setInt32(value, 0x30);
    HealthPacket.sendTo(networkIdentifier, 0);
    HealthPacket.dispose();
}
function sendText(target, text, type) {
    let networkIdentifier;
    if (target instanceof networkidentifier_1.NetworkIdentifier)
        networkIdentifier = target;
    else {
        let id = connection_1.IdByName(target);
        if (id instanceof networkidentifier_1.NetworkIdentifier)
            networkIdentifier = id;
    }
    if (type === undefined || typeof type !== "number")
        type = 0;
    const Packet = packets_1.TextPacket.create();
    Packet.message = text;
    Packet.setUint32(type, 0x30);
    Packet.sendTo(networkIdentifier, 0);
    Packet.dispose();
}
event_1.events.entityHurt.on((ev) => {
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
command_1.command.register('text', 'test', command_2.CommandPermissionLevel.Operator).overload((param, origin, output) => {
    sendText('wwwcomcom', 'Testssssssss', 1);
}, {});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFja2V0c1Rlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJwYWNrZXRzVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDBDQUEyQztBQUMzQyw2Q0FBd0M7QUFDeEMsa0VBQStEO0FBQy9ELDhDQUErRDtBQUMvRCwwQ0FBdUM7QUFDdkMsaURBQTZEO0FBQzdELHNDQUFvQztBQUNwQyxTQUFTLFNBQVMsQ0FBQyxpQkFBb0MsRUFBRSxLQUFhO0lBQ2xFLE1BQU0sWUFBWSxHQUFHLHlCQUFlLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDOUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDbkMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUMxQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDM0IsQ0FBQztBQUNELFNBQVMsUUFBUSxDQUFDLE1BQWdDLEVBQUUsSUFBWSxFQUFFLElBQWE7SUFDM0UsSUFBSSxpQkFBbUMsQ0FBQztJQUN4QyxJQUFJLE1BQU0sWUFBWSxxQ0FBaUI7UUFBRSxpQkFBaUIsR0FBRyxNQUFNLENBQUM7U0FDL0Q7UUFDRCxJQUFJLEVBQUUsR0FBRyxxQkFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzFCLElBQUksRUFBRSxZQUFZLHFDQUFpQjtZQUFFLGlCQUFpQixHQUFHLEVBQUUsQ0FBQztLQUMvRDtJQUNELElBQUssSUFBSSxLQUFLLFNBQVMsSUFBSSxPQUFPLElBQUksS0FBSyxRQUFRO1FBQUUsSUFBSSxHQUFHLENBQUMsQ0FBQztJQUM5RCxNQUFNLE1BQU0sR0FBRyxvQkFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ25DLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0lBQ3RCLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzdCLE1BQU0sQ0FBQyxNQUFNLENBQUMsaUJBQWtCLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDckMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3JCLENBQUM7QUFDRCxjQUFNLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBQyxFQUFFO0lBQ3ZCLE1BQU0sSUFBSSxHQUFXLEVBQUUsQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLENBQUM7SUFDakQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDakMsQ0FBQyxDQUFDLENBQUM7QUFDSCxpQ0FBaUM7QUFDakMsS0FBSztBQUNMLGNBQU0sQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0lBQ3RCLEVBQUUsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ3BDLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBQyxDQUFDLENBQUMsQ0FBQztJQUN6QixJQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLElBQUksV0FBVyxFQUFDO1FBQ2xDLEVBQUUsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ2pDO0FBQ0wsQ0FBQyxDQUFDLENBQUM7QUFFSCxpQkFBTyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLGdDQUFzQixDQUFDLFFBQVEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEVBQUU7SUFDakcsUUFBUSxDQUFDLFdBQVcsRUFBQyxjQUFjLEVBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0MsQ0FBQyxFQUFDLEVBQUUsQ0FBQyxDQUFDIn0=