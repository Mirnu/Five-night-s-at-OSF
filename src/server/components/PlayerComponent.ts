import { OnStart } from "@flamework/core";
import { Replica, ReplicaService } from "@rbxts/replicaservice";
import { Component, BaseComponent } from "@flamework/components";
import { PLayerStateData } from "types/Mad";
import Signal from "@rbxts/signal";
import { SessionStatus } from "shared/types/SessionStatus";
import { PlayerService } from "server/services/PlayerService";

interface Attributes {}

const PlayerclassToken = ReplicaService.NewClassToken("PlayerState");

@Component({})
export class PlayerComponent extends BaseComponent<Attributes, Player> {
	constructor(private playerService: PlayerService) {
		super();
	}

	public PlayerStateReplica?: Replica<"PlayerState">;
	public PlayerStateChanged = new Signal<(data: PLayerStateData) => void>();
	public SessionStatusChangedSignal = new Signal<(data: PLayerStateData) => void>();

	private playerStateChange() {
		if (this.PlayerStateReplica?.Data) this.PlayerStateChanged.Fire(this.PlayerStateReplica?.Data);
	}

	public InitPlayerState() {
		const profile = this.playerService.getProfile(this.instance);
		this.PlayerStateReplica = ReplicaService.NewReplica({
			ClassToken: PlayerclassToken,
			Data: {
				Static: {
					Night: profile?.Data.Night ?? 1,
				},
				Dynamic: {
					SessionStatus: SessionStatus.Init,
					Time: 12,
				},
			},
			Replication: this.instance,
		});
	}

	public StartNight(): number {
		if (this.PlayerStateReplica?.Data.Static.Night === undefined) return -1;
		this.PlayerStateReplica.SetValue("Dynamic.SessionStatus", SessionStatus.Playing);
		this.playerStateChange();
		return this.PlayerStateReplica!.Data.Static.Night;
	}

	public SetTime(time: number) {
		this.PlayerStateReplica?.SetValue("Dynamic.Time", time);
	}

	public SetNight(night: number) {
		this.PlayerStateReplica?.SetValue("Static.Night", night);
		this.playerStateChange();
	}

	public SetSessionStatus(sessionStatus: SessionStatus) {
		this.PlayerStateReplica?.SetValue("Dynamic.SessionStatus", sessionStatus);
		this.SessionStatusChangedSignal.Fire(this.PlayerStateReplica!.Data);
	}

	public EndNight() {
		this.SetSessionStatus(SessionStatus.Menu);
		this.SetTime(12);
	}

	public FinishNight() {
		this.PlayerStateReplica?.SetValue("Static.Night", this.PlayerStateReplica.Data.Static.Night + 1);
		this.EndNight();
	}
}
