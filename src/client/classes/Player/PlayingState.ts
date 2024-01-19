import { Noises, OfficeCameraCFrame } from "client/utils";
import { State } from "../../StateMachine/State";
import { GameInterfaceComponent } from "client/components/UI/GameInterfaceComponent";
import { UserInputService, Workspace } from "@rbxts/services";
import { DoorComponent } from "client/components/DoorComponent";
import { WindowComponent } from "client/components/WindowComponent";
import { CameraComponent } from "client/components/CameraComponent";
import { ComputerComponent } from "client/components/ComputerComponent";
import { WaitForPath } from "shared/utils/WaitPath";

export class PlayingState extends State {
	private camera!: CameraComponent;
	private province = WaitForPath(Workspace.WaitForChild("map"), "Province") as Workspace["map"]["Province"];
	private door = this.province.WaitForChild("Door") as Door;
	private window = this.province.WaitForChild("Window") as CameraBox;
	private monitor = this.province.WaitForChild("Monitor") as Monitor;

	public Enter(): void {
		this.camera = this.playerController.playerCamera;
		this.camera.instance.CFrame = OfficeCameraCFrame;
		this.camera.canRotate = true;
		this.camera.setCameraRestriction(this.playerController.replica.Data.Static.Night);
		this.maid.GiveTask(this.camera.StartNoises());
		this.components.addComponent<DoorComponent>(this.door);
		this.components.addComponent<WindowComponent>(this.window);
		this.components.addComponent<ComputerComponent>(this.monitor);

		this.maid.GiveTask(
			UserInputService.InputBegan.Connect((input) => {
				if (input.KeyCode === Enum.KeyCode.Space) {
					this.camera.OpenCamera(this.monitor.ScreenBlack.CFrame.Position);
				} else if (input.KeyCode === Enum.KeyCode.F) {
					this.camera.EnableFlashLight();
				}
			}),
		);
		this.maid.GiveTask(
			UserInputService.InputEnded.Connect((input) => {
				if (input.KeyCode === Enum.KeyCode.F) {
					this.camera.DisableFlashLight();
				}
			}),
		);

		this.playerController.CameraGui.Cameras.GetChildren().forEach((_button) => {
			const button = _button as TextButton;

			this.maid.GiveTask(
				button.Activated.Connect(() => {
					this.camera.ChangeCamera(button);
				}),
			);
		});
	}

	public Exit(): void {
		this.playerController.CameraGui.Enabled = false;
		this.playerController.GameInterface.Enabled = false;
		this.camera.camerasEnabled = false;

		this.components.removeComponent<GameInterfaceComponent>(this.playerController.GameInterface);
		this.components.removeComponent<DoorComponent>(Workspace.map.Province.Door);
		this.components.removeComponent<WindowComponent>(Workspace.map.Province.Window);
		this.components.removeComponent<ComputerComponent>(this.monitor);
		this.components.removeComponent<CameraComponent>(Workspace.CurrentCamera!);
		this.maid.DoCleaning();
		this.monitor.ScreenBlack.Decal.Texture = Noises[0];
	}
	public Update(): void {
		this.playerController.playerCamera.MoveMouse();
	}
}
