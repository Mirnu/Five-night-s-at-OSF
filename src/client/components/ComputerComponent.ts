import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { RunService } from "@rbxts/services";
import { Noises } from "client/utils";

interface Attributes {}

const tajikID = "rbxassetid://10427371065";

@Component({
	tag: "Computer",
})
export class ComputerComponent extends BaseComponent<Attributes, Computer> implements OnStart {
	onStart() {
		while (task.wait(0.025)) {
			{
				for (let i = 0; i < Noises.size(); i++) {
					task.wait(0.025 / Noises.size());
					this.instance.ScreenBlack.Decal.Texture = Noises[i];
				}
			}
		}
	}
}
