import { BaseComponent, Component } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { UserInputService } from "@rbxts/services";
import { PlayerController } from "client/controllers/PlayerController";
import { OfficeCameraCFrame } from "client/utils";

interface Attributes {}

@Component({})
export class WindowComponent extends BaseComponent<Attributes, CameraBox> implements OnStart {
	private cameraPosition = this.instance.Camera.CFrame.Position;

	constructor(private playerController: PlayerController) {
		super();
	}
	onStart() {
		this.instance.ClickDetector.MouseClick.Connect(() => {
			const camera = this.playerController.playerCamera;
			camera.MoveToCamera(this.instance.Camera.CFrame, new TweenInfo(1));
			camera.canRotate = false;
		});

		UserInputService.InputBegan.Connect((input) => {
			if (input.KeyCode === Enum.KeyCode.Q) {
				if (this.playerController.playerCamera.camera.CFrame.Position !== this.cameraPosition) return;
				this.playerController.playerCamera.canRotate = true;
				this.playerController.playerCamera.MoveToCamera(OfficeCameraCFrame, new TweenInfo(1));
			}
		});
	}
}
