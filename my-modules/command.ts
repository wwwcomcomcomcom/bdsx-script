import { command } from "bdsx/command";
import { ActorCommandSelector, ActorWildcardCommandSelector, CommandMessage, CommandPermissionLevel, CommandPositionFloat, PlayerCommandSelector } from "bdsx/bds/command";
import { bool_t, CxxString, float32_t, int32_t } from "bdsx/nativetype";
import { bedrockServer } from "bdsx/launcher";
import { NetworkIdentifier } from "bdsx/bds/networkidentifier";
import { events } from "bdsx/event";
import { BossEventPacket } from "bdsx/bds/packets";
import { Vec3 } from "bdsx/bds/blockpos";
import { ServerPlayer } from "bdsx/bds/player";
import { AttributeId } from "bdsx/bds/attribute";
import { NBT } from "bdsx/bds/nbt";
import { Particle } from "./particle";

command.register('leave', '플레이어를 내보냅니다. 언제든 제접할수 있습니다.', CommandPermissionLevel.Operator).overload((param, origin) => {
    const actors = param.target.newResults(origin);
    for (let i = 0; i < actors.length; i++) {
        const value = actors[i];
        if (!value.isPlayer()) continue;
        const ni: NetworkIdentifier = value.getNetworkIdentifier();
        bedrockServer.serverInstance.disconnectClient(ni, param.string, false);
    }
}, {
    target: ActorWildcardCommandSelector,
    string: CxxString
});

command.register('notice', '채팅형식의 공지를 올립니다', CommandPermissionLevel.Operator).overload((param, origin) => {
    const string = param.string.getMessage(origin);
    bedrockServer.executeCommand(`tellraw @a {"rawtext":[{"text":"§a<Server> §e${string}"}]}`);
    console.log(`[명령어사용] (공지 사용) 사용자: ${origin}  내용:${string}`);
}, {
    string: CommandMessage
});


const particles = command.register('particles', 'particle/more function', CommandPermissionLevel.Operator);

particles.overload((param, origin) => {
    const targets = param.target.newResults(origin);
    const position = param.pos.getPosition(origin);
    if (position === undefined) return;
    Particle.cube(position, param.range, param.range, param.range, param.amount, param.particle, targets)
}, {
    mode: command.enum('simple', 'simple'),
    pos: CommandPositionFloat,
    particle: CxxString,
    range: float32_t,
    amount: int32_t,
    target: PlayerCommandSelector
});

particles.overload((param, origin, output) => {
    const targets = param.target.newResults(origin, ServerPlayer);
    const position = param.pos.getPosition(origin);
    if (position === undefined) return;
    Particle.cube(position, param.x_range, param.y_range, param.z_range, param.amount, param.particle, targets);
}, {
    mode: command.enum('normal', 'normal'),
    pos: CommandPositionFloat,
    x_range: float32_t,
    y_range: float32_t,
    z_range: float32_t,
    amount: int32_t,
    particle: CxxString,
    target: PlayerCommandSelector
});

//6
particles.overload((param, origin, output) => {
    const targets = param.target.newResults(origin);
    for (const target of targets) {
        if (!target.isPlayer()) continue;

        for (let i = 0; i < param.amount; i++) {
            const posX = Math.random() * (param.x_range - -param.x_range) + (-param.x_range);
            const posY = Math.random() * (param.y_range - -param.y_range) + (-param.y_range);
            const posZ = Math.random() * param.z_range;
            bedrockServer.executeCommand(`execute "${target.getName()}" ~ ~1 ~ particle ${param.particle} ^${posX} ^${posY} ^${posZ}`);
        }
    }
}, {
    mode: command.enum('execute-facing', 'execute-facing'),
    target: PlayerCommandSelector,
    x_range: float32_t,
    y_range: float32_t,
    z_range: float32_t,
    amount: int32_t,
    particle: CxxString,
    targets: PlayerCommandSelector
});

particles.overload((param, origin) => {
    const targets = param.target.newResults(origin, ServerPlayer);
    const fromPos = param.from.getPosition(origin);
    const toPos = param.to.getPosition(origin);
    Particle.line(fromPos, toPos, param.amount, param.particle, param.time, targets);
}, {
    mode: command.enum('line', 'line'),
    from: CommandPositionFloat,
    to: CommandPositionFloat,
    amount: int32_t,
    particle: CxxString,
    time: float32_t,
    target: PlayerCommandSelector
});

function floor(x: number): number {
    return Math.floor(x * 1000) / 1000;
}
particles.overload((param, origin) => {
    const pos = param.pos.getPosition(origin);
    const targets = param.target.newResults(origin, ServerPlayer);
    Particle.circle(pos, param.range, param.amount, param.particle, param.direction, param.mode2, param.time, targets);
}, {
    mode: command.enum('circle', 'circle'),
    pos: CommandPositionFloat,
    range: float32_t,
    amount: int32_t,
    particle: CxxString,
    direction: command.enum('direction', "x", "y", "z"),
    mode2: command.enum("shape", "surface", "normal"),
    time: float32_t,
    target: PlayerCommandSelector
});

particles.overload((param, origin) => {
    const pos = param.pos.getPosition(origin);
    const targets = param.target.newResults(origin, ServerPlayer);
    Particle.sphere(pos, param.range, param.amount, param.particle, param.mode2, targets);
}, {
    mode: command.enum('sphere', 'sphere'),
    pos: CommandPositionFloat,
    range: float32_t,
    amount: int32_t,
    particle: CxxString,
    mode2: command.enum("shape", "surface", "normal"),
    target: PlayerCommandSelector
});

const tpaList: { [key: string]: { tName: string, allowed: boolean } | undefined } = {}

command.register('tpa', 'tp요청 수락시 3초뒤 자동tp').overload((param, origin) => {
    const targets = param.target.newResults(origin, ServerPlayer);
    let target: ServerPlayer;
    const player = origin.getEntity();
    if (targets.length === 1 && player?.isPlayer()) {
        target = targets[0];
    } else return;
    if (!target.isPlayer()) return;
    const playerName = player.getName();
    const targetName = target.getName();
    if (tpaList[targetName] !== undefined) {
        player.sendMessage("§e다른사람의 tpa가 이미 요청되었습니다");
        return;
    }
    target.sendMessage(`§e${playerName}님의 tp 요청\n수락:/tpallow 또는 15초뒤 자동거절`);
    tpaList[targetName] = { tName: playerName, allowed: false };
    setTimeout(() => {
        if (tpaList[targetName]?.tName === playerName) {
            tpaList[targetName] = undefined;
            if (bedrockServer.serverInstance.getPlayers().includes(player)) {
                player.sendMessage("§etpa요청이 시간 만료로 자동 거절되었습니다.");
            }
            if (bedrockServer.serverInstance.getPlayers().includes(target)) {
                target.sendMessage("§etpa가 자동거절 되었습니다.")
            }
        }
    }, 15000);
}, {
    target: PlayerCommandSelector
});
command.register('tpallow', 'tpa수락').overload((param, origin) => {
    const player = origin.getEntity();
    if (player === null || !player.isPlayer()) return;
    const name = player.getName();
    if (tpaList[name] === undefined) {
        player.sendMessage('§e수락할 tpa요청이 없습니다.');
        return;
    }
    const targetName = tpaList[name]?.tName;
    bedrockServer.executeCommand(`tp "${targetName}" "${name}"`);
    tpaList[name] = undefined;
}, {});

command.register('setname', 'setname - It can make bugs', CommandPermissionLevel.Operator).overload((param, origin) => {
    const players = param.target.newResults(origin);
    players.map((player) => {
        if (player.isPlayer()) {
            player.setName(param.string);
        }
    });
}, {
    target: PlayerCommandSelector,
    string: CxxString
});
command.register('setnametag', 'setnametag - It can make bugs', CommandPermissionLevel.Operator).overload((param, origin) => {
    const players = param.target.newResults(origin);
    players.map((player) => {
        player.setNameTag(param.string);
    });
}, {
    target: ActorCommandSelector,
    string: CxxString
});
command.register('setscoretag', 'setscoretag - It can make bugs', CommandPermissionLevel.Operator).overload((param, origin) => {
    const players = param.target.newResults(origin);
    players.map((player) => {
        if (player.isPlayer()) {
            player.setScoreTag(param.string);
        }
    });
}, {
    target: PlayerCommandSelector,
    string: CxxString
});
command.register('setnametagvisible', 'setnameetagvisible - It can make bugs', CommandPermissionLevel.Operator).overload((param, origin) => {
    const players = param.target.newResults(origin);
    players.map((player) => {
        if (player.isPlayer()) {
            player.setNameTagVisible(param.bool);
        }
    });
}, {
    target: PlayerCommandSelector,
    bool: bool_t
});

command.register('bossbar', '', CommandPermissionLevel.Operator).overload((param, origin) => {
    const players = param.target.newResults(origin, ServerPlayer);
    players.forEach((player) => {
        player.setBossBar(param.title, param.percent / 100, param.color);
    });
}, {
    target: PlayerCommandSelector,
    title: CxxString,
    percent: int32_t,
    color: command.enum('color', BossEventPacket.Colors)
});

command.register('removebossbar', '', CommandPermissionLevel.Operator).overload((param, origin) => {
    const players = param.target.newResults(origin, ServerPlayer);
    players.forEach((player) => {
        player.removeBossBar();
    });
}, {
    target: PlayerCommandSelector
});

command.register('setattribute', "it changes entity's attribute", CommandPermissionLevel.Operator).overload((param, origin) => {
    const targets = param.target.newResults(origin);
    targets.forEach(actor => {
        actor.setAttribute(param.attribute, param.value);
    });
}, {
    target: ActorCommandSelector,
    attribute: command.enum('Attribute', AttributeId),
    value: float32_t
});

const velocity = command.register('setvelocity', 'set velocity', CommandPermissionLevel.Operator);

velocity.overload((param, origin) => {
    const actors = param.target.newResults(origin);
    actors.forEach(actor => {
        actor.setVelocity(Vec3.create(param.x, param.y, param.z));
    });
}, {
    mode: command.enum('normal', 'normal'),
    target: ActorCommandSelector,
    x: float32_t,
    y: float32_t,
    z: float32_t
});

velocity.overload((param, origin) => {
    const actors = param.target.newResults(origin);
    const pos = param.pos.getPosition(origin);
    actors.forEach(actor => {
        let actorPos = actor.getFeetPos();
        const relativePos = { x: actorPos.x + 0.5 - pos.x, y: actorPos.y + 0.5 - pos.y, z: actorPos.z + 0.5 - pos.z }

        const position = Vec3.create(relativePos.x, relativePos.y, relativePos.z);

        position.x = Math.pow(position.x, 2);
        position.y = Math.pow(position.y, 2);
        position.z = Math.pow(position.z, 2);

        position.x = Math.sqrt(position.x / (position.x + position.y + position.z));
        position.y = Math.sqrt(position.y / (position.x + position.y + position.z));
        position.z = Math.sqrt(position.z / (position.x + position.y + position.z));
        if (relativePos.x < 0) position.x = -position.x;
        if (relativePos.y < 0) position.y = -position.y;
        if (relativePos.z < 0) position.z = -position.z;

        position.x *= param.speed;
        position.y *= param.speed;
        position.z *= param.speed;

        if (param.verticalCorrection !== undefined) position.y += param.verticalCorrection;

        actor.setVelocity(position);
    });
}, {
    mode: command.enum('topos', 'topos'),
    target: ActorCommandSelector,
    pos: CommandPositionFloat,
    speed: float32_t,
    verticalCorrection: [float32_t, true]
});

command.register("unbreaking", "make your item unbreaking", CommandPermissionLevel.Operator).overload((param, origin) => {
    const player = origin.getEntity();
    if (!player?.isPlayer()) return;
    const item = player.getMainhandSlot();
    const oldTag = item.save();
    const TAG: NBT.Compound = {
        ...oldTag,
        tag: {
            ...oldTag.tag,
            Unbreakable: true,
        },
    };
    item.load(TAG);
    player.sendInventory();
}, {});

let targetPlayerCount: number | undefined;
events.queryRegenerate.on((ev) => {
    if (targetPlayerCount) ev.currentPlayers = targetPlayerCount;
});
const playerCommand = command.register("setplayer", "Set player count which is shown with motd", CommandPermissionLevel.Operator);

playerCommand.overload((param) => {
    targetPlayerCount = param.playerCount;
    bedrockServer.serverNetworkHandler.updateServerAnnouncement();
}, {
    playerCount: int32_t
});

playerCommand.overload(() => {
    targetPlayerCount = undefined;
    bedrockServer.serverNetworkHandler.updateServerAnnouncement();
}, {
    playerCount: command.enum("realcount", "realcount")
});