import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { OnReplicaCreated } from "shared/decorators/ReplicaDecorators";
import { PlayerDataReplica } from "types/Mad";
import { TimeScreenSaver } from "shared/utils/Settings";
import { PlayerController } from "client/controllers/PlayerController";

interface Attributes {}

@Component({})
export class GameInterfaceComponent extends BaseComponent<Attributes, GameInterface> implements OnStart {
	constructor(private playerController: PlayerController) {
		super();
	}

	private time = this.instance.Time;
	private end = this.instance.Start;

	onStart(): void {
		this.instance.Enabled = true;
	}

	public EnableStarting() {
		this.end.Night.Text = "Night:" + tostring(this.playerController.Night);
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
