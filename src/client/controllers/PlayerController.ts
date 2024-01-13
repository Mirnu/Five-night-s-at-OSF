import { Components } from "@flamework/components";
import { Controller, OnStart, OnInit } from "@flamework/core";
import { ReplicaController } from "@rbxts/replicaservice";
import Signal from "@rbxts/signal";
import { MainMenu } from "client/components/UI/MainMenu/MainMenu";
import { LocalPlayer } from "client/utils";
import { PLayerStateData, PlayerDataReplica } from "types/Replica";

@Controller({})
export class PlayerController implements OnStart {
	public LastPlayerData?: PLayerStateData;
	public PlayerData!: PLayerStateData;
	private replica!: PlayerDataReplica;
	private waitingForReplica?: Signal;

	constructor(private components: Components) {}

	onStart() {
		this.init();
		this.initReplicaCreated();
		ReplicaController.RequestData();
	}

	private init() {
		const PlayerGui = LocalPlayer.WaitForChild("PlayerGui") as PlayerGui;
		const Menu = PlayerGui.WaitForChild("Menu") as Menu;
		this.components.addComponent<MainMenu>(Menu);
	}

	public GetReplicaAsync() {
		if (this.replica) return this.replica;
		if (!this.waitingForReplica) {
			this.waitingForReplica = new Signal();
		}
		this.waitingForReplica.Wait();
		return this.replica;
	}

	private initReplicaCreated() {
		ReplicaController.ReplicaOfClassCreated("PlayerState", (replica) => {
			this.replica = replica;
			this.waitingForReplica?.Fire();
			this.waitingForReplica?.Destroy();
		});
	}
}
