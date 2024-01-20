import { OnStart, OnTick } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { LocalPlayer, Noises, OfficeCameraCFrame, ScalarProduct } from "client/utils";
import { RunService, TweenService, Workspace } from "@rbxts/services";
import Signal from "@rbxts/signal";
import { PlayerController } from "client/controllers/PlayerController";
import { PizzeriaCamera } from "types/PizzeriaCamera";
import Maid from "@rbxts/maid";

interface Attributes {}

const CameraRestriction = new ReadonlyMap<number, [number, number]>([[1, [170, 1]]]);

const PizzeriaCameraRectriction = new Map<string, [number, number, boolean, Boolean]>();

export enum CameraState {
	Pizzeria,
	Office,
}

@Component({})
export class CameraComponent extends BaseComponent<Attributes, Camera> implements OnStart {
	private mouse: PlayerMouse = LocalPlayer.GetMouse();
	private cameraGui!: CameraGui;
	private ts: Tween[] = [];

	private maid = new Maid();
	public canBack = true;

	private lastCamera = Workspace.map.Cameras.WaitForChild("1") as PizzeriaCamera;
	public pizzeriaCameraChanged = new Signal<(camera: PizzeriaCamera) => void>();
	public camerasEnabled = false;

	public cameraEnableChanged = new Signal<(enable: boolean) => void>();
	public CameraOfficePositionChanged = new Signal<(cframe: CFrame) => void>();

	public FlashLightEnabledSignal = new Signal<(room: string) => void>();
	public FlashLightDisabledSignal = new Signal<(room: string) => void>();

	public CameraState = CameraState.Office;

	public CameraMoving = false;

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
		this.instance.CameraType = Enum.CameraType.Scriptable;
		this.rightBorder = this.instance.ViewportSize.X - this.instance.ViewportSize.X / 8;
		this.leftBorder = this.instance.ViewportSize.X / 8;

		this.cameraGui = this.playerController.CameraGui;
		this.cameraNoisesInit();
		this.turnPizzeriaCamera();
		this.setPizzeriaCameraRestriction(this.lastCamera);
	}

	destroy(): void {
		this.maid.DoCleaning();
		this.ts.forEach((ts) => ts.Pause());
		super.destroy();
	}

	private setPizzeriaCameraRestriction(camera: PizzeriaCamera) {
		if (PizzeriaCameraRectriction.get(camera.Name)) return;
		const firstCameraY = math.deg(camera.CFrame.ToEulerAnglesYXZ()["1"]);
		const left = firstCameraY + 30 >= 180;
		const right = firstCameraY - 30 <= -180;
		PizzeriaCameraRectriction.set(camera.Name, [
			left ? -180 + (firstCameraY - 150) : firstCameraY + 30,
			right ? 180 + (firstCameraY + 150) : firstCameraY - 30,
			left,
			right,
		]);
	}

	private turnPizzeriaCamera() {
		const maid = new Maid();
		this.maid.GiveTask(maid);
		maid.GiveTask(
			this.lastCamera.GetPropertyChangedSignal("CFrame").Connect(() => {
				assert(this.CameraState === CameraState.Pizzeria, "CameraState in not Pizzeria");
				this.instance.CFrame = this.lastCamera.CFrame;
			}),
		);

		this.pizzeriaCameraChanged.Connect((camera) => {
			maid.DoCleaning();
			maid.GiveTask(
				this.lastCamera.GetPropertyChangedSignal("CFrame").Connect(() => {
					assert(this.CameraState === CameraState.Pizzeria, "CameraState in not Pizzeria");
					this.instance.CFrame = this.lastCamera.CFrame;
				}),
			);
		});
	}

	public setCameraRestriction(level: number) {
		const cameraRestriction = CameraRestriction.get(level);
		if (cameraRestriction === undefined) return;

		this.rightCameraRestriction = cameraRestriction[1];
		this.leftCameraRestriction = cameraRestriction[0];
	}

	private canPizzeriaCameraRight() {
		const restriction = PizzeriaCameraRectriction.get(this.lastCamera.Name)!;
		const cameraY = restriction["1"];
		const hasRestriction =
			cameraY < -180 || restriction["3"]
				? math.deg(this.lastCamera.CFrame.ToEulerAnglesYXZ()["1"]) < cameraY
				: math.deg(this.lastCamera.CFrame.ToEulerAnglesYXZ()["1"]) > cameraY;
		return this.mouse.X > this.rightBorder && hasRestriction;
	}

	private canPizzeriaCameraLeft() {
		const restriction = PizzeriaCameraRectriction.get(this.lastCamera.Name)!;
		const cameraY = restriction["0"];
		const hasRestriction =
			cameraY > 180
				? math.deg(this.lastCamera.CFrame.ToEulerAnglesYXZ()["1"]) > cameraY
				: math.deg(this.lastCamera.CFrame.ToEulerAnglesYXZ()["1"]) < cameraY;

		return this.mouse.X < this.leftBorder && hasRestriction;
	}

	private canOfficeCameraRight() {
		if (this.rightCameraRestriction !== undefined) {
			return (
				this.mouse.X > this.rightBorder &&
				math.deg(this.instance.CFrame.ToEulerAnglesYXZ()["1"]) > this.rightCameraRestriction
			);
		}
		return this.mouse.X > this.rightBorder;
	}

	private canOfficeCameraLeft() {
		if (this.leftCameraRestriction !== undefined) {
			return (
				this.mouse.X < this.leftBorder &&
				math.deg(this.instance.CFrame.ToEulerAnglesYXZ()["1"]) < this.leftCameraRestriction
			);
		}
		return this.mouse.X < this.leftBorder;
	}

	public MoveMouse() {
		if (this.CameraState === CameraState.Office) {
			if (!this.canRotate) return;
			if (this.canOfficeCameraRight()) {
				this.instance.CFrame = this.instance.CFrame.mul(CFrame.Angles(0, math.rad(-this.sensitivity), 0));
			} else if (this.canOfficeCameraLeft()) {
				this.instance.CFrame = this.instance.CFrame.mul(CFrame.Angles(0, math.rad(this.sensitivity), 0));
			}
		} else {
			if (this.canPizzeriaCameraRight()) {
				this.lastCamera.CFrame = this.lastCamera.CFrame.mul(CFrame.Angles(0, math.rad(-this.sensitivity), 0));
			} else if (this.canPizzeriaCameraLeft()) {
				this.lastCamera.CFrame = this.lastCamera.CFrame.mul(CFrame.Angles(0, math.rad(this.sensitivity), 0));
			}
		}
	}
	public MoveToCamera(cframe: CFrame, tweenInfo: TweenInfo) {
		if (!this.canBack) return;
		this.canBack = false;
		print("Moving");
		const ts = TweenService.Create(this.instance, tweenInfo, { CFrame: cframe });
		this.ts.push(ts);
		ts.Play();
		ts.Completed.Connect(() => {
			this.canBack = true;
		});
		this.CameraOfficePositionChanged.Fire(cframe);
		return ts;
	}

	public ChangeCamera(button: TextButton) {
		const cameraPart = Workspace.map.Cameras.FindFirstChild(button.Name) as PizzeriaCamera;
		this.setPizzeriaCameraRestriction(cameraPart);
		this.instance.CFrame = cameraPart.CFrame;
		this.DisableFlashLight();
		this.lastCamera = cameraPart;
		this.pizzeriaCameraChanged.Fire(this.lastCamera);
	}

	public OpenCamera(monitorPos: Vector3) {
		if (this.CameraMoving) return;
		if (!this.camerasEnabled) {
			if (
				this.instance.CFrame.Position !== OfficeCameraCFrame.Position ||
				math.acos(ScalarProduct(this.instance.CFrame, monitorPos)) > math.rad(30)
			)
				return;
			this.CameraMoving = true;
			const ts = TweenService.Create(this.instance, new TweenInfo(1.5), {
				CFrame: Workspace.map.Province.Monitor.ScreenBlack.CFrame,
			});
			this.ts.push(ts);
			ts.Play();
			this.canRotate = false;
			this.maid.GiveTask(
				task.delay(1, () => {
					ts.Pause();
					this.cameraGui.Enabled = true;
					this.instance.CFrame = this.lastCamera.CFrame;
					this.CameraMoving = false;
				}),
			);
		} else {
			if (this.lastCamera.SpotLight.Enabled) this.DisableFlashLight();
			this.instance.CFrame = Workspace.map.Province.Monitor.ScreenBlack.CFrame;
			this.CameraMoving = true;
			const ts = TweenService.Create(this.instance, new TweenInfo(1.5), { CFrame: OfficeCameraCFrame });
			this.ts.push(ts);
			ts.Play();
			this.cameraGui.Enabled = false;
			this.maid.GiveTask(
				ts.Completed.Connect(() => {
					this.canRotate = true;
					this.instance.CFrame = OfficeCameraCFrame;
					this.CameraMoving = false;
				}),
			);
		}
		this.camerasEnabled = !this.camerasEnabled;
		this.CameraState = this.camerasEnabled ? CameraState.Pizzeria : CameraState.Office;
		this.cameraEnableChanged.Fire(this.camerasEnabled);
	}

	private cameraNoisesInit() {
		let ts: Tween;
		const noiseCamera = () => {
			if (ts !== undefined && ts.PlaybackState === Enum.PlaybackState.Playing) ts.Pause();
			this.cameraGui.Glitch.Transparency = 0.8;
			ts = TweenService.Create(this.cameraGui.Glitch, new TweenInfo(0.5), { Transparency: 0.3 });
			ts.Play();
			ts.Completed.Connect(() => {
				ts = TweenService.Create(
					this.cameraGui.Glitch,
					new TweenInfo(0.5, Enum.EasingStyle.Quad, Enum.EasingDirection.InOut, 99999999999, true),
					{ Transparency: 0.45 },
				);
				ts.Play();
			});
		};

		this.cameraEnableChanged.Connect((enable) => {
			if (enable) {
				noiseCamera();
			}
		});
		this.pizzeriaCameraChanged.Connect(() => {
			noiseCamera();
		});
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

	public EnableFlashLight() {
		if (this.CameraState !== CameraState.Pizzeria || this.lastCamera.SpotLight.Enabled) return;
		this.lastCamera.SpotLight.Enabled = true;
		this.FlashLightEnabledSignal.Fire(this.lastCamera.Name);
	}

	public DisableFlashLight() {
		if (this.CameraState !== CameraState.Pizzeria || !this.lastCamera.SpotLight.Enabled) return;
		this.lastCamera.SpotLight.Enabled = false;
		this.FlashLightDisabledSignal.Fire(this.lastCamera.Name);
	}
}
