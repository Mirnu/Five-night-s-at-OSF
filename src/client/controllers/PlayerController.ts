import { Components } from "@flamework/components";
import { Controller, OnStart, OnTick } from "@flamework/core";
import { ReplicaController } from "@rbxts/replicaservice";
import Signal from "@rbxts/signal";
import { State } from "client/classes/State";
import { PlayerCamera } from "client/classes/camera/PlayerCamera";
import { LocalPlayer } from "client/utils";
import { SessionStatus } from "shared/types/SessionStatus";
import { PLayerStateData, PlayerDataReplica } from "types/Mad";
import { Constructor } from "@flamework/core/out/utility";
import { MenuState } from "client/classes/Player/MenuState";
import { PlayingState } from "client/classes/Player/PlayingState";

class a extends State {
	public Enter(): void {
	}
	public Exit(): void {
	}
	public Update(): void {
	}
}

const States = { [SessionStatus.Init]: a, 
	[SessionStatus.Menu]: MenuState, 
	[SessionStatus.Playing]: PlayingState
} satisfies Record<SessionStatus, Constructor<State>>


@Controller({
	loadOrder: 0,
})
export class PlayerController implements OnStart, OnTick {
	public LastPlayerData?: PLayerStateData;
	public PlayerData!: PLayerStateData;
	public replica!: PlayerDataReplica;
	private waitingForReplica?: Signal;

	private PlayerGui = LocalPlayer.WaitForChild("PlayerGui") as PlayerGui;
	public Menu = this.PlayerGui.WaitForChild("Menu") as Menu;
	public CameraGui = this.PlayerGui.WaitForChild("Camera") as CameraGui;
	public GameInterface = this.PlayerGui.WaitForChild("GameInterface") as GameInterface;


	public playerCamera = new PlayerCamera(this);
	public CurrentState?: State;

	constructor(private components: Components) {}

	onStart() {
		this.initReplicaCreated();
		ReplicaController.RequestData();
		this.CurrentState = new States[SessionStatus.Init](this);
		this.CurrentState.Enter();
	}

	onTick(dt: number): void {
		this.CurrentState?.Update()
	}

	private ChangeState(newState: State) {
		this.CurrentState?.Exit()
		this.CurrentState = newState;
		this.CurrentState.Enter();
	}

	private initReplca(replica: PlayerDataReplica) {
		replica.ListenToChange("Dynamic.SessionStatus", (newValue) => {
			const newState = new States[newValue](this) 
			this.ChangeState(newState)
		});
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

			this.initReplca(replica);
		});
	}
}
