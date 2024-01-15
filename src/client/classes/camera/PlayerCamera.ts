import { TweenService, UserInputService, Workspace } from "@rbxts/services";
import Signal from "@rbxts/signal";
import { PlayerController } from "client/controllers/PlayerController";
import { Events } from "client/network";
import { LocalPlayer, Noises, OfficeCameraCFrame, ScalarProduct } from "client/utils";
import { OnReplicaCreated } from "shared/decorators/ReplicaDecorators";
import { CameraState } from "shared/types/CameraState";
import { SessionStatus } from "shared/types/SessionStatus";
import { PlayerDataReplica } from "types/Mad";

const CameraRestriction = new ReadonlyMap<number, [number, number]>([[1, [170, 1]]]);

export class PlayerCamera {
	public camera = Workspace.CurrentCamera!;
	private mouse: PlayerMouse = LocalPlayer.GetMouse();
	private cameraGui!: CameraGui;

	public canBack = true;

	public readonly officeCameraCFrame = (
		Workspace.WaitForChild("map").WaitForChild("Province").WaitForChild("StartPart") as BasePart
	).CFrame;
	public readonly menuCamereCFrame = (
		Workspace.WaitForChild("map").WaitForChild("Insulator").WaitForChild("StartPart") as BasePart
	).CFrame;
	private lastCamera = Workspace.map.Cameras.WaitForChild("1") as Part;
	public camerasEnabled = false;
	public cameraEnableChanged = new Signal<(enable: boolean) => void>();

	public CameraPositionChanged = new Signal<(cframe: CFrame) => void>();

	private sensitivity: number = 2;
	public canRotate = false;

	private rightCameraRestriction?: number;
	private leftCameraRestriction?: number;

	private rightBorder!: number;
	private leftBorder!: number;

	constructor(private playerController: PlayerController) {
		this.rightBorder = this.camera.ViewportSize.X - this.camera.ViewportSize.X / 8;
		this.leftBorder = this.camera.ViewportSize.X / 8;
		this.camera.CameraType = Enum.CameraType.Scriptable;
		this.cameraGui = playerController.CameraGui;
	}

	public setCameraRestriction(level: number) {
		const cameraRestriction = CameraRestriction.get(level);
		if (cameraRestriction === undefined) return;

		this.rightCameraRestriction = cameraRestriction[1];
		this.leftCameraRestriction = cameraRestriction[0];
	}

	private canRight(mouse: PlayerMouse) {
		if (this.rightCameraRestriction !== undefined) {
			return (
				mouse.X > this.rightBorder &&
				math.deg(this.camera!.CFrame.Rotation.ToOrientation()["1"]) > this.rightCameraRestriction
			);
		}
		return mouse.X > this.rightBorder;
	}

	private canLeft(mouse: PlayerMouse) {
		if (this.leftCameraRestriction !== undefined) {
			return (
				mouse.X < this.leftBorder &&
				math.deg(this.camera!.CFrame.Rotation.ToOrientation()["1"]) < this.leftCameraRestriction
			);
		}
		return mouse.X < this.leftBorder;
	}

	public MoveMouse() {
		if (!this.canRotate) return;
		if (this.camera === undefined) return;

		if (this.canRight(this.mouse)) {
			this.camera.CFrame = this.camera.CFrame.mul(CFrame.Angles(0, math.rad(-this.sensitivity), 0));
		} else if (this.canLeft(this.mouse)) {
			this.camera.CFrame = this.camera.CFrame.mul(CFrame.Angles(0, math.rad(this.sensitivity), 0));
		}
	}

	public SetCameraCFrame(cframe: CFrame) {
		this.camera.CFrame = cframe;
	}

	public MoveToCamera(cframe: CFrame, tweenInfo: TweenInfo) {
		if (!this.canBack) return;
		this.canBack = false;
		const ts = TweenService.Create(this.camera, tweenInfo, { CFrame: cframe });
		ts.Play();
		ts.Completed.Connect(() => {
			this.canBack = true;
			this.CameraPositionChanged.Fire(cframe);
		});
		return ts;
	}

	public ChangeCamera(button: TextButton) {
		const cameraPart = Workspace.map.Cameras.FindFirstChild(button.Name) as Part;
		this.SetCameraCFrame(cameraPart.CFrame);
		this.lastCamera = cameraPart;
	}

	public OpenCamera(monitorPos: Vector3) {
		if (!this.camerasEnabled) {
			if (
				this.camera.CFrame.Position !== OfficeCameraCFrame.Position ||
				math.acos(ScalarProduct(this.camera.CFrame, monitorPos)) > math.rad(30)
			)
				return;
			this.canRotate = false;
			this.cameraGui.Enabled = true;
			this.SetCameraCFrame(this.lastCamera.CFrame);
		} else {
			this.canRotate = true;
			this.cameraGui.Enabled = false;
			this.SetCameraCFrame(OfficeCameraCFrame);
		}
		this.camerasEnabled = !this.camerasEnabled;
		this.cameraEnableChanged.Fire(this.camerasEnabled);
	}

	public StartNoises() {
		return task.spawn(() => {
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
}
