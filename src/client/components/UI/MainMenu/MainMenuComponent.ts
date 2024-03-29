import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { Workspace } from "@rbxts/services";
import { OnReplicaCreated } from "shared/decorators/ReplicaDecorators";
import { PlayerDataReplica } from "types/Mad";
import { SessionStatus } from "shared/types/SessionStatus";
import { Events } from "client/network";

interface Attributes {}

@Component({})
export class MainMenuComponent extends BaseComponent<Attributes, Menu> implements OnStart {
	private continueGame = this.instance.ContinueGame;
	private newGame = this.instance.NewGame;

	onStart() {
		this.instance.Enabled = true;
		this.initButtons();
	}

	public Init(replica: PlayerDataReplica) {
		print(replica.Data.Static.Night);
		if (replica.Data.Static.Night > 1) this.continueGame.Visible = true;
	}

	private initButtons() {
		this.newGame.Activated.Connect(() => {
			Events.NewGame.fire();
		});
		this.continueGame.Activated.Connect(() => {
			Events.ContinueGame.fire();
		});
	}
}
