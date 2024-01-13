import Maid from "@rbxts/maid";
import Signal from "@rbxts/signal";
import { PlayerComponent } from "server/components/PlayerComponent";

const speedNight = 50;

export class Night {
	constructor(private playerComponent: PlayerComponent, private night: number) {}
	private time = 0;

	public Start() {
		task.spawn(() => {
			this.playerComponent.SetNight(this.night);
			this.playerComponent.StartNight();

			while (task.wait(60 / speedNight)) {
				this.time += 1;
				this.playerComponent.SetTime(this.time);

				if (this.time >= 6) {
					this.playerComponent.FinishNight();
					return;
				}
			}
		});
	}
}
