import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { Events } from "server/network";
import { TweenService } from "@rbxts/services";
import { CameraState } from "shared/types/CameraState";

interface Attributes {}

@Component({
	tag: "Door",
})
export class DoorComponent extends BaseComponent<Attributes, Door> implements OnStart {
	public Opened = true;

	onStart() {
		Events.DoorOpened.connect(() => {
			this.open();
		});
		Events.DoorClosed.connect(() => {
			this.close();
		});
		Events.CameraStateChanged.connect((player, state) => {
			if (state !== CameraState.door && !this.Opened) {
				this.open();
			}
		});
	}

	private open() {
		this.Opened = true;
		const ts = TweenService.Create(this.instance.stick, new TweenInfo(0.5), {
			CFrame: CFrame.Angles(0, math.rad(45), 0).add(this.instance.stick.Position),
		});
		ts.Play();
	}

	private close() {
		this.Opened = false;
		const ts = TweenService.Create(this.instance.stick, new TweenInfo(0.5), {
			CFrame: CFrame.Angles(0, math.rad(90), 0).add(this.instance.stick.Position),
		});
		ts.Play();
	}
}
