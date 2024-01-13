import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { OnReplicaCreated } from "shared/decorators/ReplicaDecorators";
import { PlayerDataReplica } from "types/Mad";
import { SessionStatus } from "shared/types/SessionStatus";

interface Attributes {}

@Component({})
export class GameInterfaceComponent extends BaseComponent<Attributes, GameInterface> {
	private time = this.instance.Time;
	private end = this.instance.Start;

	@OnReplicaCreated()
	private init(replica: PlayerDataReplica) {
		replica.ListenToChange("Dynamic.SessionStatus", (newValue) => {
			if (newValue === SessionStatus.Playing) this.instance.Enabled = true;
		});
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
