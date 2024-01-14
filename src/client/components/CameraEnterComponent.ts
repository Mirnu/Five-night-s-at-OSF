import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { TweenService } from "@rbxts/services";
import { PlayerController } from "client/controllers/PlayerController";

interface Attributes {}

@Component({
	tag: "CameraEnter",
})
export class CameraEnterComponent extends BaseComponent<Attributes, CameraBox> implements OnStart {
	constructor(private playerController: PlayerController) {
		super();
	}

	onStart() {
		this.instance.ClickDetector.MouseClick.Connect(() => {
			const camera = this.playerController.playerCamera;
			camera.MoveToCamera(this.instance.Camera.CFrame, new TweenInfo(1));
			camera.canRotate = false;
		});
	}
}
