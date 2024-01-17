import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { LocalPlayer, Noises, OfficeCameraCFrame, ScalarProduct } from "client/utils";
import { TweenService, Workspace } from "@rbxts/services";
import Signal from "@rbxts/signal";
import { PlayerController } from "client/controllers/PlayerController";

interface Attributes {}

const CameraRestriction = new ReadonlyMap<number, [number, number]>([[1, [170, 1]]]);

@Component({})
export class CameraComponent extends BaseComponent<Attributes, Camera> implements OnStart {
	private mouse: PlayerMouse = LocalPlayer.GetMouse();
	private cameraGui!: CameraGui;

	public canBack = true;

	private lastCamera = Workspace.map.Cameras.WaitForChild("1") as Part;
	public camerasEnabled = false;

	public cameraEnableChanged = new Signal<(enable: boolean) => void>();
	public CameraOfficePositionChanged = new Signal<(cframe: CFrame) => void>();

	private sensitivity: number = 2;
	public canRotate = false;

	private rightCameraRestriction?: number;
	private leftCameraRestriction?: number;

	private rightBorder!: number;
	private leftBorder!: number;

	constructor(private playerController: PlayerController) {
		super();
	}

	onStart(): void {
		this.rightBorder = this.instance.ViewportSize.X - this.instance.ViewportSize.X / 8;
		this.leftBorder = this.instance.ViewportSize.X / 8;
		this.instance.CameraType = Enum.CameraType.Scriptable;
		this.cameraGui = this.playerController.CameraGui;
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
				math.deg(this.instance.CFrame.Rotation.ToOrientation()["1"]) > this.rightCameraRestriction
			);
		}
		return mouse.X > this.rightBorder;
	}

	private canLeft(mouse: PlayerMouse) {
		if (this.leftCameraRestriction !== undefined) {
			return (
				mouse.X < this.leftBorder &&
				math.deg(this.instance.CFrame.Rotation.ToOrientation()["1"]) < this.leftCameraRestriction
			);
		}
		return mouse.X < this.leftBorder;
	}

	public MoveMouse() {
		if (!this.canRotate) return;
		if (this.canRight(this.mouse)) {
			this.instance.CFrame = this.instance.CFrame.mul(CFrame.Angles(0, math.rad(-this.sensitivity), 0));
		} else if (this.canLeft(this.mouse)) {
			this.instance.CFrame = this.instance.CFrame.mul(CFrame.Angles(0, math.rad(this.sensitivity), 0));
		}
	}
	public MoveToCamera(cframe: CFrame, tweenInfo: TweenInfo) {
		if (!this.canBack) return;
		this.canBack = false;
		const ts = TweenService.Create(this.instance, tweenInfo, { CFrame: cframe });
		ts.Play();
		ts.Completed.Connect(() => {
			this.canBack = true;
			this.CameraOfficePositionChanged.Fire(cframe);
		});
		return ts;
	}

	public ChangeCamera(button: TextButton) {
		const cameraPart = Workspace.map.Cameras.FindFirstChild(button.Name) as Part;
		this.instance.CFrame = cameraPart.CFrame;
		this.lastCamera = cameraPart;
	}

	public OpenCamera(monitorPos: Vector3) {
		if (!this.camerasEnabled) {
			if (
				this.instance.CFrame.Position !== OfficeCameraCFrame.Position ||
				math.acos(ScalarProduct(this.instance.CFrame, monitorPos)) > math.rad(30)
			)
				return;
			this.canRotate = false;
			this.cameraGui.Enabled = true;
			this.instance.CFrame = this.lastCamera.CFrame;
		} else {
			this.canRotate = true;
			this.cameraGui.Enabled = false;
			this.instance.CFrame = OfficeCameraCFrame;
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
