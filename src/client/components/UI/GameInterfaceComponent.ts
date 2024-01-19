import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { OnReplicaCreated } from "shared/decorators/ReplicaDecorators";
import { PlayerDataReplica } from "types/Mad";
import Maid from "@rbxts/maid";
import { TimeScreenSaver } from "shared/utils/Settings";

interface Attributes {}

@Component({})
export class GameInterfaceComponent extends BaseComponent<Attributes, GameInterface> implements OnStart {
	private time = this.instance.Time;
	private end = this.instance.Start;
	private maid = new Maid();
	private night = 1;

	onStart(): void {
		this.instance.Enabled = true;
	}

	public EnableStarting() {
		this.end.Night.Text = "Night:" + tostring(this.night);
		this.end.Visible = true;
		task.wait(TimeScreenSaver);
		this.end.Visible = false;
	}

	destroy(): void {
		this.instance.Enabled = false;
		super.destroy();
	}

	@OnReplicaCreated()
	public Init(replica: PlayerDataReplica) {
		replica.ListenToChange("Dynamic.Time", (newValue) => {
			this.night = replica.Data.Static.Night;
			let text = "AM";
			if (newValue === 12) {
				text = "PM";
			}
			this.time.Text = newValue + text;

			if (newValue >= 6) {
				this.instance.Enabled = false;
			}
		});
	}
}
