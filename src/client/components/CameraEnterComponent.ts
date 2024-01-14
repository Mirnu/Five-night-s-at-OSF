import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { TweenService } from "@rbxts/services";
import { PlayerController } from "client/controllers/PlayerController";
import { CameraState } from "shared/types/CameraState";

interface Attributes {}

@Component({
	tag: "CameraEnter",
})
export class CameraEnterComponent extends BaseComponent<Attributes, CameraBox> implements OnStart {
	constructor(private playerController: PlayerController) {
		super();
	}

	private cameraState = this.instance.Name as CameraState;

	onStart() {
		this.instance.ClickDetector.MouseClick.Connect(() => {
			const camera = this.playerController.playerCamera;
			camera.SetCameraState(this.cameraState);
			camera.MoveToCamera(this.instance.Camera.CFrame, new TweenInfo(1));
			camera.canRotate = false;
		});
	}
}
