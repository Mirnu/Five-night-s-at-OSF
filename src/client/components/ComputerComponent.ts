import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { Noises } from "client/utils";
import { PlayerController } from "client/controllers/PlayerController";
import { CameraState } from "shared/types/CameraState";
import { OnReplicaCreated } from "shared/decorators/ReplicaDecorators";
import { PlayerDataReplica } from "types/Mad";
import { SessionStatus } from "shared/types/SessionStatus";
import { Events } from "client/network";

interface Attributes {}

const tajikID = "rbxassetid://10427371065";
const chanceTadjikAppearing = 5;
const angleVision = math.rad(70);

@Component({
	tag: "Computer",
})
export class ComputerComponent extends BaseComponent<Attributes, Monitor> {
	constructor(private playerController: PlayerController) {
		super();
	}

	private noiseThread?: thread;
	private cameraConnect?: RBXScriptConnection;
	private complexity = 2;
	private attacked = false;

	@OnReplicaCreated()
	private Init(replica: PlayerDataReplica) {
		replica.ListenToChange("Dynamic.SessionStatus", (newValue) => {
			if (newValue === SessionStatus.Playing) {
				this.start();
			} else {
				this.disconnect();
			}
		});
	}

	private disconnect() {
		if (this.noiseThread === undefined || this.cameraConnect === undefined) return;
		task.cancel(this.noiseThread);
		this.cameraConnect.Disconnect();
	}

	private start() {
		this.disconnect();
		this.noiseThread = task.spawn(() => this.makeNoise());
		this.cameraConnect = this.playerController.playerCamera.CameraStateChanged.Connect((state) => {
			if (state === CameraState.computer && math.random(1, 10) > chanceTadjikAppearing) {
				if (this.attacked) return;
				this.attacked = true;
				this.disconnect();
				this.instance.ScreenBlack.Decal.Texture = tajikID;
				this.startAttack();
			}
		});
	}

	private startAttack() {
		let connect: RBXScriptConnection | undefined = undefined;

		const thread = task.delay(10 / this.complexity, () => {
			this.attacked = false;
			const screenPosition = this.instance.ScreenBlack.CFrame.Position;
			const dirVector = screenPosition.sub(this.playerController.playerCamera.camera.CFrame.Position).Unit;
			const dotResult = dirVector.Dot(this.playerController.playerCamera.camera.CFrame.LookVector);

			if (math.acos(dotResult) < angleVision) {
				Events.KillPlayer.fire();
			} else {
				connect?.Disconnect();
				this.start();
			}
		});

		connect = this.playerController.playerCamera.CameraStateChanged.Connect((state) => {
			if (state === CameraState.camera) {
				Events.KillPlayer.fire();
				return;
			}
			if (state === CameraState.computer) return;
			task.cancel(thread);
			this.disconnect();
			connect?.Disconnect();
			this.start();
			this.attacked = false;
		});
	}

	private makeNoise() {
		while (task.wait(0.025)) {
			{
				for (let i = 0; i < Noises.size(); i++) {
					task.wait(0.025 / Noises.size());
					this.instance.ScreenBlack.Decal.Texture = Noises[i];
				}
			}
		}
	}
}
