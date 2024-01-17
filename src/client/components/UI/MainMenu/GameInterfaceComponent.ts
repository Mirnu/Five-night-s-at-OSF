import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { OnReplicaCreated } from "shared/decorators/ReplicaDecorators";
import { PlayerDataReplica } from "types/Mad";
import { SessionStatus } from "shared/types/SessionStatus";
import Maid from "@rbxts/maid";

interface Attributes {}

@Component({})
export class GameInterfaceComponent extends BaseComponent<Attributes, GameInterface> implements OnStart {
	private time = this.instance.Time;
	private end = this.instance.Start;

	onStart(): void {
		this.instance.Enabled = true;
	}

	@OnReplicaCreated()
	public Init(replica: PlayerDataReplica) {
		replica.ListenToChange("Dynamic.Time", (newValue) => {
			let text = "AM";
			if (newValue === 12) text = "PM";
			this.time.Text = newValue + text;

			if (newValue >= 6) {
				this.end.Night.Text = "Night:" + tostring(replica.Data.Static.Night);
				this.end.Visible = true;
				task.wait(5);
				this.end.Visible = false;
				this.instance.Enabled = false;
			}
		});
	}
}
