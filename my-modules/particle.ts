import { DimensionId } from "bdsx/bds/actor";
import { Vec3 } from "bdsx/bds/blockpos";
import { NetworkIdentifier } from "bdsx/bds/networkidentifier";
import { SpawnParticleEffectPacket } from "bdsx/bds/packets";
import { ServerPlayer } from "bdsx/bds/player";
import { bedrockServer } from "bdsx/launcher";

function floor(x: number): number {
    return Math.floor(x * 1000) / 1000;
}
export const allPlayers = () => {
    return bedrockServer.serverInstance.getPlayers();
};
export const allEntities = () => {
    return bedrockServer.level.getEntities();
};
export namespace Particle {

    export function particle(pos: Vec3, particle: string, targets: ServerPlayer[] = allPlayers()) {
        const playerList = allPlayers();

        for (const player of targets) {
            if (!playerList.includes(player)) continue;
            const ni = player.getNetworkIdentifier();
            Particle._particle(ni, particle, pos);
        }
    }

    export function _particle(target: NetworkIdentifier, particle: string, pos: Vec3, dimensionId = DimensionId.Overworld) {
        if (target.isNull()) return;
        const pkt = SpawnParticleEffectPacket.create();
        pkt.particleName = particle;
        pkt.pos.set(pos);
        pkt.dimensionId = dimensionId;
        pkt.actorId = "";
        pkt.sendTo(target);
        pkt.dispose();
    }

    export function cube(
        pos: Vec3,
        x_range: number,
        y_range: number,
        z_range: number,
        amount: number,
        particlename: string,
        targets: ServerPlayer[] = allPlayers()
    ) {
        for (let i = 0; i < amount; i++) {
            const posX = pos.x + (Math.random() * (x_range - -x_range) + (-x_range));
            const posY = pos.y + (Math.random() * (y_range - -y_range) + (-y_range));
            const posZ = pos.z + (Math.random() * (z_range - -z_range) + (-z_range));
            const position = Vec3.create(posX, posY, posZ);

            particle(position, particlename, targets);
        }
    }

    export function line(
        from: Vec3,
        to: Vec3,
        amount: number,
        particlename: string,
        time: number,
        targets: ServerPlayer[] = allPlayers()
    ) {
        if (from === undefined || to === undefined) return;
        const xMove = (to.x - from.x) / amount;
        const yMove = (to.y - from.y) / amount;
        const zMove = (to.z - from.z) / amount;
        const tick = time * 1000 / amount;

        for (let i = 1; i <= amount; i++) {
            setTimeout(() => {
                const x = from.x + xMove * i;
                const y = from.y + yMove * i;
                const z = from.z + zMove * i;
                const pos = Vec3.create(x, y, z);
                particle(pos, particlename, targets);
            }, i * tick);
        }
    }
    export function circle(
        pos: Vec3,
        range: number,
        amount: number,
        particlename: string,
        direction: "x" | "y" | "z",
        mode: "surface" | "normal" = "normal",
        time: number = 0,
        targets: ServerPlayer[] = allPlayers()
    ) {
        const tick = time * 1000 / amount;
        switch (direction) {
            case "x": {
                for (let i = 0; i < 360;) {
                    i += floor(360 / amount);
                    setTimeout(() => {
                        const rad = floor(i * Math.PI / 180);
                        let sin = floor(Math.sin(rad));
                        let cos = floor(Math.cos(rad));
                        sin *= range;
                        cos *= range;
                        if (mode === "normal") {
                            sin *= Math.random();
                            cos *= Math.random();
                        }
                        const position = Vec3.create(pos.x, pos.y + sin, pos.z + cos);
                        particle(position, particlename, targets);
                    }, i / (360 / amount) * tick);
                }
                break;
            }
            case "y": {
                for (let i = 0; i < 360;) {
                    i += floor(360 / amount);
                    setTimeout(() => {
                        const rad = floor(i * Math.PI / 180);
                        let sin = floor(Math.sin(rad));
                        let cos = floor(Math.cos(rad));
                        sin *= range;
                        cos *= range;
                        if (mode === "normal") {
                            sin *= Math.random();
                            cos *= Math.random();
                        }
                        const position = Vec3.create(pos.x + sin, pos.y, pos.z + cos);
                        particle(position, particlename, targets);
                    }, i / (360 / amount) * tick);
                }
                break;
            }
            case "z": {
                for (let i = 0; i < 360;) {
                    i += floor(360 / amount);
                    setTimeout(() => {
                        const rad = floor(i * Math.PI / 180);
                        let sin = floor(Math.sin(rad));
                        let cos = floor(Math.cos(rad));
                        sin *= range;
                        cos *= range;
                        if (mode === "normal") {
                            sin *= Math.random();
                            cos *= Math.random();
                        }
                        const position = Vec3.create(pos.x + sin, pos.y + cos, pos.z);
                        particle(position, particlename, targets);
                    }, i / (360 / amount) * tick);
                }
                break;
            }
        }
    }
    export function sphere(
        pos: Vec3,
        range: number,
        amount: number,
        particlename: string,
        mode: "surface" | "normal" = "normal",
        targets: ServerPlayer[] = allPlayers()
    ) {
        for (let i = 0; i < amount; i++) {
            const randomRad1 = Math.floor(Math.random() * (361)) * Math.PI / 180;
            //const randomRad2 = Math.floor(Math.random() * (361))*Math.PI/180;
            const randomRad3 = Math.floor(Math.random() * (361)) * Math.PI / 180;
            let x = Math.sin(randomRad1) * Math.cos(randomRad3) * range;
            let z = Math.cos(randomRad1) * Math.cos(randomRad3) * range;
            let y = Math.sin(randomRad3) * range;
            if (mode === "normal") {
                x *= Math.random(); y *= Math.random(); z *= Math.random();
            }
            const position = Vec3.construct(pos);
            position.x += x; position.y += y; position.z += z;
            particle(position, particlename, targets);
        }
    }
}