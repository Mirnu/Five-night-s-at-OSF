import { Components } from "@flamework/components";
import { Controller, OnStart, OnInit } from "@flamework/core";
import { ReplicaController } from "@rbxts/replicaservice";
import Signal from "@rbxts/signal";
import { PizzeriaCamera } from "client/classes/PizzeriaCamera";
import { PlayerCamera } from "client/classes/PlayerCamera";
import { GameInterfaceComponent } from "client/components/UI/MainMenu/GameInterfaceComponent";
import { MainMenuComponent } from "client/components/UI/MainMenu/MainMenuComponent";
import { LocalPlayer } from "client/utils";
import { PLayerStateData, PlayerDataReplica } from "types/Mad";

@Controller({})
export class PlayerController implements OnStart {
	public LastPlayerData?: PLayerStateData;
	public PlayerData!: PLayerStateData;
	private replica!: PlayerDataReplica;
	private waitingForReplica?: Signal;

	public playerCamera!: PlayerCamera;

	constructor(private components: Components) {}

	onStart() {
		this.init();
		this.initReplicaCreated();
		ReplicaController.RequestData();
	}

	private init() {
		const PlayerGui = LocalPlayer.WaitForChild("PlayerGui") as PlayerGui;
		const Menu = PlayerGui.WaitForChild("Menu") as Menu;
		const gameInterface = PlayerGui.WaitForChild("GameInterface") as GameInterface;
		this.components.addComponent<GameInterfaceComponent>(gameInterface);
		this.components.addComponent<MainMenuComponent>(Menu);
		this.playerCamera = new PlayerCamera();
		this.playerCamera.OnStart();
		const pizzeriaCamera = new PizzeriaCamera();
		pizzeriaCamera.Init(this.playerCamera);
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
