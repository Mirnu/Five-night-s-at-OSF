import { Workspace } from "@rbxts/services";
import { LocalPlayer } from "client/utils";
import { OnReplicaCreated } from "shared/decorators/ReplicaDecorators";
import { SessionStatus } from "shared/types/SessionStatus";
import { PlayerDataReplica } from "types/Mad";

const CameraRestriction = new ReadonlyMap<number, [number, number]>([[1, [170, 1]]]);

export class Camera {
	private camera = Workspace.CurrentCamera!;
	private mouse: PlayerMouse = LocalPlayer.GetMouse();

	private sensitivity: number = 2;
	private isGaming = false;

	private rightCameraRestriction?: number;
	private leftCameraRestriction?: number;

	private rightBorder!: number;
	private leftBorder!: number;

	public OnStart() {
		this.rightBorder = this.camera.ViewportSize.X - this.camera.ViewportSize.X / 8;
		this.leftBorder = this.camera.ViewportSize.X / 8;
		this.camera.CameraType = Enum.CameraType.Scriptable;

		task.spawn(() => {
			// eslint-disable-next-line roblox-ts/lua-truthiness
			while (task.wait(0.01)) {
				this.Move(this.mouse);
			}
		});
	}

	@OnReplicaCreated()
	private Init(replica: PlayerDataReplica) {
		replica.ListenToChange("Dynamic.SessionStatus", (newValue) => {
			if (newValue === SessionStatus.Playing) {
				this.startGame();
				this.setCameraRestriction(replica.Data.Static.Night);
			} else if (newValue === SessionStatus.Menu) {
				this.endGame();
			}
		});
	}

	private setCameraRestriction(level: number) {
		const cameraRestriction = CameraRestriction.get(level);
		if (cameraRestriction === undefined) return;

		this.rightCameraRestriction = cameraRestriction[1];
		this.leftCameraRestriction = cameraRestriction[0];
	}

	private startGame() {
		this.camera.CFrame = Workspace.map.Province.StartPart.CFrame;
		this.isGaming = true;
	}

	private endGame() {
		this.camera.CFrame = Workspace.map.Insulator.StartPart.CFrame;
		this.isGaming = false;
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

	private Move(mouse: PlayerMouse) {
		if (!this.isGaming) return;
		if (this.camera === undefined) return;

		if (this.canRight(mouse)) {
			this.camera.CFrame = this.camera.CFrame.mul(CFrame.Angles(0, math.rad(-this.sensitivity), 0));
		} else if (this.canLeft(mouse)) {
			this.camera.CFrame = this.camera.CFrame.mul(CFrame.Angles(0, math.rad(this.sensitivity), 0));
		}
	}
}
