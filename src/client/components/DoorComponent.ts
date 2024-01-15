import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { PlayerController } from "client/controllers/PlayerController";
import { TweenService, UserInputService } from "@rbxts/services";
import { OfficeCameraCFrame } from "client/utils";

interface Attributes {}

@Component({})
export class DoorComponent extends BaseComponent<Attributes, Door> implements OnStart {
	public Opened = true;
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
			if (input.KeyCode === Enum.KeyCode.E) {
				this.close();
			}
			if (input.KeyCode === Enum.KeyCode.Q) {
				if (this.playerController.playerCamera.camera.CFrame.Position !== this.cameraPosition) return;
				this.open();
				this.playerController.playerCamera.canRotate = true;
				this.playerController.playerCamera.MoveToCamera(OfficeCameraCFrame, new TweenInfo(1));
			}
		});
		UserInputService.InputEnded.Connect((input) => {
			if (input.KeyCode === Enum.KeyCode.E) {
				this.open();
			}
		});
	}

	private open() {
		this.Opened = true;
		const ts = TweenService.Create(this.instance.Door.stick, new TweenInfo(0.5), {
			CFrame: CFrame.Angles(0, math.rad(45), 0).add(this.instance.Door.stick.Position),
		});
		ts.Play();
	}

	private close() {
		this.Opened = false;
		const ts = TweenService.Create(this.instance.Door.stick, new TweenInfo(0.5), {
			CFrame: CFrame.Angles(0, math.rad(90), 0).add(this.instance.Door.stick.Position),
		});
		ts.Play();
	}
}
