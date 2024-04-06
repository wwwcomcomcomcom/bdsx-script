
import { DimensionId } from "bdsx/bds/actor";
import { Block } from "bdsx/bds/block";
import { BlockPos } from "bdsx/bds/blockpos";
import { CommandPermissionLevel } from "bdsx/bds/command";
import { ContainerType, ItemStack } from "bdsx/bds/inventory";
import { NetworkIdentifier } from "bdsx/bds/networkidentifier";
import { MinecraftPacketIds } from "bdsx/bds/packetids";
import { ContainerClosePacket, ContainerOpenPacket, InventorySlotPacket, ItemStackRequestActionTransferBase, ItemStackRequestActionType, ItemStackRequestPacket, UpdateBlockPacket } from "bdsx/bds/packets";
import { ServerPlayer } from "bdsx/bds/player";
import { command } from "bdsx/command";
import { CANCEL } from "bdsx/common";
import { events } from "bdsx/event";
import { bedrockServer } from "bdsx/launcher";
import { uint32_t, uint8_t } from "bdsx/nativetype";
import { procHacker } from "bdsx/prochacker";

export const InventorySlotPacket$InventorySlotPacket = procHacker.js("??0InventorySlotPacket@@QEAA@W4ContainerID@@IAEBVItemStack@@@Z", InventorySlotPacket, null, InventorySlotPacket, uint8_t, uint32_t, ItemStack,);

export class FakeChestGUI {
    static delay = 0;

    private block = Block.create("minecraft:chest")!;
    private ni: NetworkIdentifier;
    private pos: BlockPos;
    private id: number;
    private blockBeforePlace: Block | undefined;


    protected itemStackRequestCb: (pk: ItemStackRequestPacket, ni: NetworkIdentifier) => CANCEL | void;
    protected containerCloseCb: (pk: ContainerClosePacket, ni: NetworkIdentifier) => CANCEL | void;
    protected disonnectCb: (ni: NetworkIdentifier) => void;

    constructor(pl: ServerPlayer, public slots: Record<number, ItemStack>, callback: (this: FakeChestGUI, slot: number, item: ItemStack) => void) {
        this.ni = pl.getNetworkIdentifier();
        const feetPos = pl.getFeetPos();
        feetPos.y += 5;
        this.pos = BlockPos.create(feetPos);
        this.id = pl.nextContainerCounter();
        this.placeChest();

        bedrockServer.serverInstance.nextTick().then(() => {
            setTimeout(() => {
                this.openChest();
                for (let [slot, item] of Object.entries(slots)) {
                    this.setItem(+slot, item);
                }
            }, FakeChestGUI.delay);
        });

        events.packetBefore(MinecraftPacketIds.ItemStackRequest).on(this.itemStackRequestCb = (pk, ni) => {
            if (ni.equals(this.ni)) {
                const data = pk.getRequestBatch().data.get(0);
                const action = data?.actions.get(0);
                if (action?.type === ItemStackRequestActionType.Take && action instanceof ItemStackRequestActionTransferBase) {
                    const slotInfo = action.getSrc();
                    let slot = slotInfo.slot;
                    if (this.slots[slot] === undefined) return;
                    callback.call(this, slot, this.slots[slot]);
                }
            }
        });
        events.packetBefore(MinecraftPacketIds.ContainerClose).on(this.containerCloseCb = (pk, ni) => {
            if (ni.equals(this.ni)) this.destruct();
        });
        events.networkDisconnected.on(this.disonnectCb = (pk) => {
            if (pk.equals(this.ni)) this.destruct();
        });
    }

    private destruct() {
        for (let [slot, item] of Object.entries(this.slots)) {
            item.destruct();
        }
        this.destroyChest();
        events.packetBefore(MinecraftPacketIds.ItemStackRequest).remove(this.itemStackRequestCb);
        events.packetBefore(MinecraftPacketIds.ContainerClose).remove(this.containerCloseCb);
        events.networkDisconnected.remove(this.disonnectCb);
    }

    private placeChest() {
        this.blockBeforePlace = bedrockServer.level.getDimension(DimensionId.Overworld)?.getBlockSource().getBlock(this.pos);
        const pk = UpdateBlockPacket.allocate();
        pk.blockPos.construct(this.pos);
        pk.dataLayerId = 0;
        pk.flags = UpdateBlockPacket.Flags.NoGraphic;
        pk.blockRuntimeId = this.block.getRuntimeId();
        pk.sendTo(this.ni);
        pk.dispose();
    }

    private destroyChest() {
        let pk = UpdateBlockPacket.allocate();
        pk.blockPos.construct(this.pos);
        pk.dataLayerId = 0;
        pk.flags = UpdateBlockPacket.Flags.NoGraphic;
        pk.blockRuntimeId = this.blockBeforePlace?.getRuntimeId() !== undefined ? this.blockBeforePlace.getRuntimeId() : -1;
        pk.sendTo(this.ni);
        pk.dispose();
    }

    private openChest() {
        const pk = ContainerOpenPacket.allocate();
        pk.containerId = this.id;
        pk.type = ContainerType.Container;
        pk.pos.construct(this.pos);
        pk.sendTo(this.ni);
        pk.dispose();
    }

    setItem(slot: number, item: ItemStack) {
        if (!this.slots[slot]?.sameItem(item) && this.slots[slot] !== undefined) this.slots[slot].destruct();
        this.slots[slot] = item;
        const pk = new InventorySlotPacket(true);
        InventorySlotPacket$InventorySlotPacket(pk, this.id, slot, item);
        pk.sendTo(this.ni);
        pk.destruct();
    }
    setItemAmount(slot: number, amount: number) {
        const item = this.slots[slot];
        item.amount = amount
        this.setItem(slot, item);
    }

    static sendToPlayer(pl: ServerPlayer, slots: Record<number, ItemStack>, callback: (this: FakeChestGUI, slot: number, item: ItemStack) => void) {
        new FakeChestGUI(pl, slots, callback);
    }
}

command.register("fake", "", CommandPermissionLevel.Operator).overload((params, origin, output) => {
    const pl = <ServerPlayer>origin.getEntity()!;
    const item = ItemStack.constructWith("minecraft:planks", 1, 1);
    item.setCustomName("aasdadadddsas");
    FakeChestGUI.sendToPlayer(pl, {
        1: item,
        2: ItemStack.constructWith("minecraft:planks", 2, 1),
        3: ItemStack.constructWith("minecraft:planks", 3, 1),
        4: ItemStack.constructWith("minecraft:planks", 4, 1),
        5: ItemStack.constructWith("minecraft:planks", 5, 1),
        6: ItemStack.constructWith("minecraft:planks", 6, 1),
        7: ItemStack.constructWith("minecraft:apple"),
        8: ItemStack.constructWith("minecraft:egg", 2),
    }, function (slot, item) {
        console.log(item.getName(), slot, this.slots[slot].amount);
        if (slot === 1) {
            this.setItem(slot, ItemStack.constructWith("minecraft:diamond"));
            this.setItemAmount(slot, this.slots[slot].amount);
        }
    });
}, {});