"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdByName = exports.DataById = exports.NameById = exports.DeviceById = exports.XuidByName = void 0;
let nIt = new Map();
let nMt = new Map();
let nXt = new Map();
let nSt = new Map();
function XuidByName(PlayerName) {
    let Rlt = nXt.get(PlayerName);
    if (Rlt === undefined)
        Rlt = '';
    return Rlt;
}
exports.XuidByName = XuidByName;
/**
  *get playerXuid by Name
*/
function DeviceById(networkIdentifier) {
    let Rlt = nSt.get(networkIdentifier);
    if (Rlt === undefined)
        Rlt = '';
    return Rlt;
}
exports.DeviceById = DeviceById;
/**
  *get playerName by Id
*/
function NameById(networkIdentifier) {
    let actor = networkIdentifier.getActor();
    let playerName;
    try {
        playerName = actor.getName();
    }
    catch (_a) {
        playerName = nMt.get(networkIdentifier);
    }
    return playerName;
}
exports.NameById = NameById;
/**
  *get playerData by Id
  *result = [name,actor,entity, xuid]
*/
function DataById(networkIdentifier) {
    let actor = networkIdentifier.getActor();
    let entity = actor.getEntity();
    let name = actor.getName();
    let xuid = nXt.get(name);
    return [name, actor, entity, xuid];
}
exports.DataById = DataById;
/**
  *get playerId by Name
*/
function IdByName(PlayerName) {
    let Rlt = nIt.get(PlayerName);
    return Rlt;
}
exports.IdByName = IdByName;
//from 2913 module...
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29ubmVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNvbm5lY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEsSUFBSSxHQUFHLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUNwQixJQUFJLEdBQUcsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQ3BCLElBQUksR0FBRyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDcEIsSUFBSSxHQUFHLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUVwQixTQUFnQixVQUFVLENBQUMsVUFBa0I7SUFDekMsSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUM5QixJQUFJLEdBQUcsS0FBSyxTQUFTO1FBQUUsR0FBRyxHQUFHLEVBQUUsQ0FBQztJQUNoQyxPQUFPLEdBQUcsQ0FBQztBQUNmLENBQUM7QUFKRCxnQ0FJQztBQUNEOztFQUVFO0FBQ0YsU0FBZ0IsVUFBVSxDQUFDLGlCQUFvQztJQUMzRCxJQUFJLEdBQUcsR0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDekMsSUFBSSxHQUFHLEtBQUssU0FBUztRQUFFLEdBQUcsR0FBRyxFQUFFLENBQUM7SUFDaEMsT0FBTyxHQUFHLENBQUM7QUFDZixDQUFDO0FBSkQsZ0NBSUM7QUFDRDs7RUFFRTtBQUNGLFNBQWdCLFFBQVEsQ0FBQyxpQkFBb0M7SUFDekQsSUFBSSxLQUFLLEdBQUcsaUJBQWlCLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDekMsSUFBSSxVQUFpQixDQUFDO0lBQ3RCLElBQUk7UUFDQSxVQUFVLEdBQUcsS0FBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ2pDO0lBQUMsV0FBTTtRQUNKLFVBQVUsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7S0FDM0M7SUFDRCxPQUFPLFVBQVUsQ0FBQztBQUN0QixDQUFDO0FBVEQsNEJBU0M7QUFDRDs7O0VBR0U7QUFDRixTQUFnQixRQUFRLENBQUMsaUJBQW9DO0lBQ3pELElBQUksS0FBSyxHQUFHLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3pDLElBQUksTUFBTSxHQUFHLEtBQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUNoQyxJQUFJLElBQUksR0FBRyxLQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDNUIsSUFBSSxJQUFJLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN6QixPQUFPLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDdkMsQ0FBQztBQU5ELDRCQU1DO0FBQ0Q7O0VBRUU7QUFDRixTQUFnQixRQUFRLENBQUMsVUFBa0I7SUFDdkMsSUFBSSxHQUFHLEdBQXFCLEdBQUcsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDaEQsT0FBTyxHQUFHLENBQUM7QUFDZixDQUFDO0FBSEQsNEJBR0M7QUFFRCxxQkFBcUIifQ==