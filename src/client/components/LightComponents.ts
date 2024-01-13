import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { RunService } from "@rbxts/services";

interface Attributes {}

@Component({
	tag: "lamp",
})
export class LightComponents extends BaseComponent<Attributes, Lamp> implements OnStart {
	private minIntensity = 0.1;
	private maxIntensity = 2.5;

	onStart() {
		RunService.Heartbeat.Connect(() => {
			const flickerIntensity = math.random(this.minIntensity * 100, this.maxIntensity * 100) / 100;
			this.instance.Cylinder.Beam.Brightness = flickerIntensity;
		});
	}
}
