import { UserInputService, Workspace } from "@rbxts/services";
import { PlayerCamera } from "./PlayerCamera";

export class PizzeriaCamera {
	private cameras: Part[] = [];
	private playerCamera!: PlayerCamera;

	private camerasEnabled = false;
	private lastCamera!: Part;

	public Init(camera: PlayerCamera) {
		this.playerCamera = camera;
		Workspace.map.Cameras.GetChildren().forEach((camera) => {
			const index = tonumber(camera.Name)!;
			if (index === 1) this.lastCamera = camera as Part;
			this.cameras.insert(index, camera as Part);
		});

		UserInputService.InputBegan.Connect((input, gameProcessed) => {
			if (input.KeyCode === Enum.KeyCode.Space) this.spacePressed();
		});
	}

	private spacePressed() {
		if (!this.camerasEnabled) {
			this.playerCamera.canRotate = false;
			this.playerCamera.SetCameraCFrame(this.lastCamera.CFrame);
		} else {
			this.playerCamera.canRotate = true;
			this.playerCamera.SetCameraCFrame(this.playerCamera.officeCameraCFrame);
		}
		this.camerasEnabled = !this.camerasEnabled;
	}
}
