import { Components } from "@flamework/components";
import { Dependency } from "@flamework/core";
import Maid from "@rbxts/maid";
import { PlayerComponent } from "server/components/PlayerComponent";
import { Events } from "server/network";

const speedNight = 5;
const components = Dependency<Components>();

export class Nights {
	constructor(private playerComponent: PlayerComponent) {}
	private maid = new Maid();
	private time = 0;

	public Init() {
		Events.NewGame.connect((player) => {
			this.maid.DoCleaning();
			const playerComponent = components.getComponent<PlayerComponent>(player)!;
			this.Start(1);
		});
	}

	public Start(level: number) {
		this.maid.GiveTask(
			task.spawn(() => {
				this.playerComponent.SetNight(level);
				this.playerComponent.StartNight();

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
