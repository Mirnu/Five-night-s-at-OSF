import { UserInputService } from "@rbxts/services";
import { PlayerController } from "client/controllers/PlayerController";
import { Events } from "client/network";
import { CameraState } from "shared/types/CameraState";

export class InputService {
	constructor(private playerService: PlayerController) {}

	public Init() {
		UserInputService.InputBegan.Connect((input) => {
			if (input.KeyCode === Enum.KeyCode.E && this.playerService.playerCamera.CameraState === CameraState.door) {
				Events.DoorClosed();
			}
		});
		UserInputService.InputEnded.Connect((input) => {
			if (input.KeyCode === Enum.KeyCode.E && this.playerService.playerCamera.CameraState === CameraState.door) {
				Events.DoorOpened();
			}
		});
	}
}
