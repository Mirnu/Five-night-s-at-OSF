import { UserInputService, Workspace } from "@rbxts/services";
import { PlayerCamera } from "./PlayerCamera";
import { CameraState } from "shared/types/CameraState";
import { Noises } from "client/utils";

export class PizzeriaCamera {
	private playerCamera!: PlayerCamera;
	private cameraGui!: CameraGui;
	private camerasEnabled = false;
	private lastCamera = Workspace.map.Cameras.WaitForChild("1") as Part;

	private noisesthread?: thread;

	private startNoises() {
		this.noisesthread = task.spawn(() => {
			while (task.wait(0.025)) {
				{
					for (let i = 0; i < Noises.size(); i++) {
						task.wait(0.025 / Noises.size());
						this.cameraGui.Glitch.Image = Noises[i];
					}
				}
			}
		});
	}

	public Init(camera: PlayerCamera, cameraGui: CameraGui) {
		this.playerCamera = camera;
		this.cameraGui = cameraGui;
		UserInputService.InputBegan.Connect((input) => {
			if (input.KeyCode === Enum.KeyCode.Space) this.spacePressed();
		});

		cameraGui.Cameras.GetChildren().forEach((_button) => {
			const button = _button as TextButton;

			button.Activated.Connect(() => {
				const cameraPart = Workspace.map.Cameras.FindFirstChild(button.Name) as Part;
				if (this.camerasEnabled) {
					camera.SetCameraCFrame(cameraPart.CFrame);
					this.lastCamera = cameraPart;
				}
			});
		});
	}

	private spacePressed() {
		if (!this.camerasEnabled) {
			if (this.playerCamera.CameraState !== CameraState.computer) return;
			this.playerCamera.canRotate = false;
			this.playerCamera.SetCameraState(CameraState.camera);
			this.startNoises();
			this.cameraGui.Enabled = true;
			this.playerCamera.SetCameraCFrame(this.lastCamera.CFrame);
		} else {
			this.playerCamera.canRotate = true;
			this.playerCamera.SetCameraState(CameraState.computer);
			task.cancel(this.noisesthread!);
			this.cameraGui.Enabled = false;
			this.playerCamera.SetCameraCFrame(this.playerCamera.officeCameraCFrame);
		}
		this.camerasEnabled = !this.camerasEnabled;
	}
}
