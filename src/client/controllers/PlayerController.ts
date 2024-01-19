import { Components } from "@flamework/components";
import { Controller, OnStart, OnTick } from "@flamework/core";
import { ReplicaController } from "@rbxts/replicaservice";
import Signal from "@rbxts/signal";
import { State } from "client/StateMachine/State";
import { LocalPlayer } from "client/utils";
import { SessionStatus } from "shared/types/SessionStatus";
import { PLayerStateData, PlayerDataReplica } from "types/Mad";
import { Constructor } from "@flamework/core/out/utility";
import { MenuState } from "client/classes/Player/MenuState";
import { PlayingState } from "client/classes/Player/PlayingState";
import { CameraComponent } from "client/components/CameraComponent";
import { StateMachine } from "client/StateMachine/StateMachine";
import { WaitForPath } from "shared/utils/WaitPath";

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

	private PlayerGui!: PlayerGui;
	public Menu!: Menu;
	public CameraGui!: CameraGui;
	public GameInterface!: GameInterface;

	public playerCamera!: CameraComponent;

	public SessionStateMachine = new StateMachine()

	constructor(private components: Components) {}

	onStart() {
		this.initReplicaCreated();
		this.PlayerGui = WaitForPath(LocalPlayer, "PlayerGui", 5) as PlayerGui
		this.Menu = WaitForPath(this.PlayerGui, "Menu", 5) as Menu
		this.CameraGui = WaitForPath(this.PlayerGui, "Camera", 5) as CameraGui
		this.GameInterface = WaitForPath(this.PlayerGui, "GameInterface", 5) as GameInterface
		ReplicaController.RequestData();
		this.SessionStateMachine.Initialize(new States[SessionStatus.Init](this.components, this))
	}

	onTick(dt: number): void {
		this.SessionStateMachine.CurrentState?.Update()
	}

	private initReplca(replica: PlayerDataReplica) {
		replica.ListenToChange("Dynamic.SessionStatus", (newValue) => {
			const newState = new States[newValue](this.components, this) 
			this.SessionStateMachine.ChangeState(newState)
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
