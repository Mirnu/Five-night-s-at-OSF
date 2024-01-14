import { Components } from "@flamework/components";
import { Controller, OnStart } from "@flamework/core";
import { ReplicaController } from "@rbxts/replicaservice";
import Signal from "@rbxts/signal";
import { InputService } from "client/classes/InputService";
import { PizzeriaCamera } from "client/classes/PizzeriaCamera";
import { PlayerCamera } from "client/classes/PlayerCamera";
import { GameInterfaceComponent } from "client/components/UI/MainMenu/GameInterfaceComponent";
import { MainMenuComponent } from "client/components/UI/MainMenu/MainMenuComponent";
import { LocalPlayer } from "client/utils";
import { SessionStatus } from "shared/types/SessionStatus";
import { PLayerStateData, PlayerDataReplica } from "types/Mad";

@Controller({
	loadOrder: 0,
})
export class PlayerController implements OnStart {
	public LastPlayerData?: PLayerStateData;
	public PlayerData!: PLayerStateData;
	private replica!: PlayerDataReplica;
	private waitingForReplica?: Signal;

	public playerState = SessionStatus.Init;
	public playerStateChanged = new Signal<(replica: PlayerDataReplica) => void>();

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
		const CameraGui = PlayerGui.WaitForChild("Camera") as CameraGui;
		const gameInterface = PlayerGui.WaitForChild("GameInterface") as GameInterface;
		this.components.addComponent<GameInterfaceComponent>(gameInterface);
		this.components.addComponent<MainMenuComponent>(Menu);
		this.playerCamera = new PlayerCamera(this);
		this.playerCamera.OnStart();
		const pizzeriaCamera = new PizzeriaCamera();
		pizzeriaCamera.Init(this, CameraGui);
		new InputService(this).Init();
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

			replica.ListenToChange("Dynamic.SessionStatus", (newValue) => {
				print(newValue);
				this.playerState = newValue;
				this.playerStateChanged.Fire(replica);
			});
		});
	}
}
