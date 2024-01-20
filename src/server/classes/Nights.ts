import { Components } from "@flamework/components";
import { Dependency } from "@flamework/core";
import Maid from "@rbxts/maid";
import { Lighting } from "@rbxts/services";
import { PlayerComponent } from "server/components/PlayerComponent";
import { Events } from "server/network";
import { TimeScreenSaver } from "shared/utils/Settings";

const speedNight = 50;

export class Nights {
	constructor(private playerComponent: PlayerComponent) {}
	private maid = new Maid();
	private time = 0;

	public Init() {
		Lighting.ClockTime = 0;
		Events.NewGame.connect((player) => {
			print("Новая ночь");
			this.Start(1);
		});
		Events.KillPlayer.connect((player) => {
			print("Игрок умер");
			Lighting.ClockTime = 0;
			this.playerComponent.EndNight();
			this.maid.DoCleaning();
		});
		Events.ContinueGame.connect(() => {
			print("Продолжить ночь");
			this.Start(this.playerComponent.PlayerStateReplica!.Data.Static.Night);
		});
	}

	public Start(level: number) {
		Lighting.ClockTime = 0;
		this.time = 0;
		this.maid.DoCleaning();
		this.playerComponent.SetTime(12);
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
						this.Start(this.playerComponent.PlayerStateReplica!.Data.Static.Night);
						return;
					}
				}
			}),
		);
		this.maid.GiveTask(
			task.spawn(() => {
				task.wait(TimeScreenSaver);
				while (task.wait(1 / speedNight)) {
					Lighting.ClockTime += 1 / 60;
				}
			}),
		);
	}
}
