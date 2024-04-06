import { CommandPermissionLevel } from "bdsx/bds/command";
import { JsonValue } from "bdsx/bds/connreq";
import { NBT } from "bdsx/bds/nbt";
import { command } from "bdsx/command";
import { CxxString, int32_t } from "bdsx/nativetype";



command.register("setlore", "you can set your item's lore", CommandPermissionLevel.Operator).overload((param, origin) => {
    const player = origin.getEntity();
    if (!player?.isPlayer()) return;
    const item = player.getMainhandSlot();
    const itemTag = item.save();
    if (itemTag.tag === undefined) {
        itemTag.tag = { display: { Lore: [`${param.string}`] } };
    } else {
        itemTag.tag.display = { Lore: [`${param.string}`] };
    }

    item.load(itemTag);
    player.sendInventory();
}, {
    string: CxxString
});

const getmovingblock = command.register('getmovingblock', 'You can get Hidden Block. Ex) Overlap two blocks', CommandPermissionLevel.Operator);
getmovingblock.overload((param, origin) => {
    const player = origin.getEntity();
    if (!player?.isPlayer()) return;
    const item = player.getMainhandSlot();
    const movingBlockItemTag = {
        Block: {
            states: {},
            version: NBT.int(17879555),
            name: "minecraft:movingblock"
        },
        tag: {
            display: {
                name: "movingblock"
            },
            movingBlock: {
                name: param.movingblock
            },
            movingBlockExtra: {
                name: param.movingblockExtra
            }
        },
        Count: NBT.byte(1),
        Damage: NBT.short(0),
        WasPickedUp: NBT.byte(0),
        Name: "minecraft:movingblock"
    }
    item.load(movingBlockItemTag);
    player.sendInventory();
}, {
    mode: command.enum('block', 'block'),
    movingblock: CxxString,
    movingblockExtra: CxxString
});

getmovingblock.overload((param, origin) => {
    const player = origin.getEntity();
    if (!player?.isPlayer()) return;
    const item = player.getMainhandSlot();
    const movingBlock = param.movingblock.value();
    const movingBlockExtra = param.movingblockExtra.value();
    let movingBlockItemTag: any = {
        Block: {
            states: {},
            version: NBT.int(17879555),
            name: "minecraft:movingblock"
        },
        tag: {
            display: {
                name: "movingblock"
            },
            movingBlock: movingBlock,
            movingBlockExtra: movingBlockExtra
        },
        Count: NBT.byte(1),
        Damage: NBT.short(0),
        WasPickedUp: NBT.byte(0),
        Name: "minecraft:movingblock"
    };
    if (movingBlockItemTag.tag.movingBlock.states !== undefined) {
        Object.keys(movingBlockItemTag.tag.movingBlock.states).forEach((key) => {
            const value = movingBlockItemTag.tag.movingBlock.states[key];
            if (value.match("b")) {
                const num = Number(value.substring(1));
                if (Number.isNaN(num)) { return; }
                movingBlockItemTag.tag.movingBlock.states[key] = NBT.byte(num);
                console.log(3);
            } else
                if (value.match("s")) {
                    const num = Number(value.substring(1));
                    if (Number.isNaN(num)) { return; }
                    movingBlockItemTag.tag.movingBlock.states[key] = NBT.short(num);
                } else
                    if (value.match("i")) {
                        const num = Number(value.substring(1));
                        if (Number.isNaN(num)) { return; }
                        movingBlockItemTag.tag.movingBlock.states[key] = NBT.int(num);
                    } else
                        if (value.match("d")) {
                            const num = Number(value.substring(1));
                            if (Number.isNaN(num)) { return; }
                            movingBlockItemTag.tag.movingBlock.states[key] = NBT.double(num);
                        }
        });
    }
    item.load(movingBlockItemTag);
    player.sendInventory();
}, {
    mode: command.enum('json', 'json'),
    movingblock: JsonValue,
    movingblockExtra: JsonValue
});

command.register("enchantlvl", "Set your item's enchant level", CommandPermissionLevel.Operator).overload((param, origin) => {
    const player = origin.getEntity();
    if (!player?.isPlayer()) return;
    const item = player.getMainhandSlot();
    const itemTag = item.save();
    if (itemTag.tag.ench === undefined) return;
    itemTag.tag.ench.forEach((enchant: { id: NBT.Short, lvl: NBT.Short }) => {
        enchant.lvl.value = param.lvl;
    });
    item.load(itemTag);
    player.sendInventory();
}, {
    lvl: int32_t
});