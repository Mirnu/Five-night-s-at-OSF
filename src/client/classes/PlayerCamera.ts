import { TweenService, UserInputService, Workspace } from "@rbxts/services";
import { Events } from "client/network";
import { LocalPlayer } from "client/utils";
import { OnReplicaCreated } from "shared/decorators/ReplicaDecorators";
import { CameraState } from "shared/types/CameraState";
import { SessionStatus } from "shared/types/SessionStatus";
import { PlayerDataReplica } from "types/Mad";

const CameraRestriction = new ReadonlyMap<number, [number, number]>([[1, [170, 1]]]);

export class PlayerCamera {
	private camera = Workspace.CurrentCamera!;
	private mouse: PlayerMouse = LocalPlayer.GetMouse();

	public canBack = true;

	public CameraState = CameraState.menu;

	public readonly officeCameraCFrame = (
		Workspace.WaitForChild("map").WaitForChild("Province").WaitForChild("StartPart") as BasePart
	).CFrame;
	public readonly menuCamereCFrame = (
		Workspace.WaitForChild("map").WaitForChild("Insulator").WaitForChild("StartPart") as BasePart
	).CFrame;

	private sensitivity: number = 2;
	public canRotate = false;

	private rightCameraRestriction?: number;
	private leftCameraRestriction?: number;

	private rightBorder!: number;
	private leftBorder!: number;

	public OnStart() {
		this.rightBorder = this.camera.ViewportSize.X - this.camera.ViewportSize.X / 8;
		this.leftBorder = this.camera.ViewportSize.X / 8;
		this.camera.CameraType = Enum.CameraType.Scriptable;

		UserInputService.InputBegan.Connect((input, gameProcessed) => {
			if (input.KeyCode === Enum.KeyCode.Q) {
				if (this.canRotate || !this.canBack || this.CameraState === CameraState.computer) return;
				this.canRotate = true;
				this.MoveToCamera(this.officeCameraCFrame, new TweenInfo(1));
				this.SetCameraState(CameraState.computer);
			}
		});

		task.spawn(() => {
			// eslint-disable-next-line roblox-ts/lua-truthiness
			while (task.wait(0.01)) {
				this.MoveMouse(this.mouse);
			}
		});
	}

	@OnReplicaCreated()
	private Init(replica: PlayerDataReplica) {
		replica.ListenToChange("Dynamic.SessionStatus", (newValue) => {
			if (newValue === SessionStatus.Playing) {
				this.CameraState = CameraState.computer;
				this.SetCameraCFrame(this.officeCameraCFrame);
				this.canRotate = true;
				this.setCameraRestriction(replica.Data.Static.Night);
			} else if (newValue === SessionStatus.Menu) {
				this.CameraState = CameraState.menu;
				this.SetCameraCFrame(this.menuCamereCFrame);
				this.canRotate = false;
			}
		});
	}

	private setCameraRestriction(level: number) {
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

	private MoveMouse(mouse: PlayerMouse) {
		if (!this.canRotate) return;
		if (this.camera === undefined) return;

		if (this.canRight(mouse)) {
			this.camera.CFrame = this.camera.CFrame.mul(CFrame.Angles(0, math.rad(-this.sensitivity), 0));
		} else if (this.canLeft(mouse)) {
			this.camera.CFrame = this.camera.CFrame.mul(CFrame.Angles(0, math.rad(this.sensitivity), 0));
		}
	}

	public SetCameraState(state: CameraState) {
		print(state);
		this.CameraState = state;
		Events.CameraStateChanged.fire(this.CameraState);
	}

	public SetCameraCFrame(cframe: CFrame) {
		this.camera.CFrame = cframe;
	}

	public MoveToCamera(cframe: CFrame, tweenInfo: TweenInfo) {
		if (!this.canBack) return;
		this.canBack = false;
		const ts = TweenService.Create(this.camera, tweenInfo, { CFrame: cframe });
		ts.Play();
		ts.Completed.Connect(() => (this.canBack = true));
		return ts;
	}
}
