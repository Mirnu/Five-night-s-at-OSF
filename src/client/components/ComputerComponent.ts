import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { RunService } from "@rbxts/services";

interface Attributes {}

@Component({
	tag: "Computer",
})
export class ComputerComponent extends BaseComponent<Attributes, Computer> implements OnStart {
	private images = [
		"rbxassetid://13696329232",
		"rbxassetid://13696328887",
		"rbxassetid://13696328356",
		"rbxassetid://13696328086",
		"rbxassetid://13696327731",
		"rbxassetid://13696327341",
		"rbxassetid://13696326900",
		"rbxassetid://13696326516",
	];
	onStart() {
		while (task.wait(0.1)) {
			{
				for (let i = 0; i < this.images.size(); i++) {
					task.wait(0.1 / this.images.size());
					this.instance.ScreenBlack.Decal.Texture = this.images[i];
				}
			}
		}
	}
}
