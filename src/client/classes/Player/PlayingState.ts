import { OfficeCameraCFrame, ScalarProduct } from "client/utils";
import { State } from "../State";
import { GameInterfaceComponent } from "client/components/UI/MainMenu/GameInterfaceComponent";
import { UserInputService, Workspace } from "@rbxts/services";
import { DoorComponent } from "client/components/DoorComponent";
import { WindowComponent } from "client/components/WindowComponent";
import { PlayerCamera } from "../camera/PlayerCamera";
import { ComputerComponent } from "client/components/ComputerComponent";

export class PlayingState extends State {
	private camera!: PlayerCamera;
	private province = Workspace.WaitForChild("map").WaitForChild("Province") as Workspace["map"]["Province"];
	private door = this.province.WaitForChild("Door") as Door;
	private window = this.province.WaitForChild("Window") as CameraBox;
	private monitor = this.province.WaitForChild("Monitor") as Monitor;

	public Enter(): void {
		this.camera = this.playerController.playerCamera;
		this.camera.SetCameraCFrame(OfficeCameraCFrame);
		this.camera.canRotate = true;
		this.camera.setCameraRestriction(this.playerController.replica.Data.Static.Night);
		this.camera.StartNoises();
		this.components.addComponent<GameInterfaceComponent>(this.playerController.GameInterface);
		this.components.addComponent<DoorComponent>(this.door);
		this.components.addComponent<WindowComponent>(this.window);
		this.components.addComponent<ComputerComponent>(this.monitor);

		this.maid.GiveTask(
			UserInputService.InputBegan.Connect((input) => {
				if (input.KeyCode === Enum.KeyCode.Space) {
					this.playerController.playerCamera.OpenCamera(this.monitor.ScreenBlack.CFrame.Position);
				}
			}),
		);

		this.playerController.CameraGui.Cameras.GetChildren().forEach((_button) => {
			const button = _button as TextButton;

			button.Activated.Connect(() => {
				this.playerController.playerCamera.ChangeCamera(button);
			});
		});
	}

	public Exit(): void {
		this.playerController.CameraGui.Enabled = false;
		this.playerController.playerCamera.camerasEnabled = false;
		this.components.removeComponent<GameInterfaceComponent>(this.playerController.GameInterface);
		this.components.removeComponent<DoorComponent>(Workspace.map.Province.Door);
		this.components.removeComponent<WindowComponent>(Workspace.map.Province.Window);
		this.components.removeComponent<ComputerComponent>(Workspace.map.Province.Monitor);
		this.maid.DoCleaning();
	}
	public Update(): void {
		this.playerController.playerCamera.MoveMouse();
	}
}
