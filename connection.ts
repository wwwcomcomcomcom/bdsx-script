import { NetworkIdentifier } from "bdsx/bds/networkidentifier";

let nIt = new Map();
let nMt = new Map();
let nXt = new Map();
let nSt = new Map();

export function XuidByName(PlayerName: string) {
    let Rlt = nXt.get(PlayerName);
    if (Rlt === undefined) Rlt = '';
    return Rlt;
}
/**
  *get playerXuid by Name
*/
export function DeviceById(networkIdentifier: NetworkIdentifier):string{
    let Rlt:any = nSt.get(networkIdentifier);
    if (Rlt === undefined) Rlt = '';
    return Rlt;
}
/**
  *get playerName by Id
*/
export function NameById(networkIdentifier: NetworkIdentifier) {
    let actor = networkIdentifier.getActor();
    let playerName:string;
    try {
        playerName = actor!.getName();
    } catch {
        playerName = nMt.get(networkIdentifier);
    }
    return playerName;
}
/**
  *get playerData by Id
  *result = [name,actor,entity, xuid]
*/
export function DataById(networkIdentifier: NetworkIdentifier) {
    let actor = networkIdentifier.getActor();
    let entity = actor!.getEntity();
    let name = actor!.getName();
    let xuid = nXt.get(name);
    return [name, actor, entity, xuid];
}
/**
  *get playerId by Name
*/
export function IdByName(PlayerName: string) {
    let Rlt:NetworkIdentifier = nIt.get(PlayerName);
    return Rlt;
}

//from 2913 module...