import { Components } from "@flamework/components";
import { Dependency } from "@flamework/core";
import Maid from "@rbxts/maid";
import { PlayerComponent } from "server/components/PlayerComponent";
import { Events } from "server/network";
import { TimeScreenSaver } from "shared/utils/Settings";

const speedNight = 50;
const components = Dependency<Components>();

export class Nights {
	constructor(private playerComponent: PlayerComponent) {}
	private maid = new Maid();
	private time = 0;

	public Init() {
		Events.NewGame.connect((player) => {
			this.maid.DoCleaning();
			this.playerComponent.SetTime(12);
			this.time = 0;
			this.Start(1);
		});
		Events.KillPlayer.connect((player) => {
			this.maid.DoCleaning();
		});
	}

	public Start(level: number) {
		this.maid.GiveTask(
			task.spawn(() => {
				this.playerComponent.SetNight(level);
				this.playerComponent.StartNight();
				task.wait(TimeScreenSaver);

				while (task.wait(60 / speedNight)) {
					this.time += 1;
					this.playerComponent.SetTime(this.time);

					if (this.time >= 6) {
						this.playerComponent.FinishNight();
						return;
					}
				}
			}),
		);
	}
}
