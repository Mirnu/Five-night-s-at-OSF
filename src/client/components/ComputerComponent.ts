import { OnStart, OnTick } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { Noises, OfficeCameraCFrame } from "client/utils";
import { PlayerController } from "client/controllers/PlayerController";
import { CameraState } from "shared/types/CameraState";
import { OnReplicaCreated } from "shared/decorators/ReplicaDecorators";
import { PlayerDataReplica } from "types/Mad";
import { SessionStatus } from "shared/types/SessionStatus";
import { Events } from "client/network";
import Maid from "@rbxts/maid";

interface Attributes {}

const tajikID = "rbxassetid://10427371065";
const chanceTadjikAppearing = 5;
const angleVision = math.rad(70);

@Component({
	tag: "Computer",
})
export class ComputerComponent extends BaseComponent<Attributes, Monitor> implements OnStart {
	constructor(private playerController: PlayerController) {
		super();
	}
	private noiseThread?: thread;
	private maid = new Maid();
	private complexity = 2;
	private attacked = false;

	onStart(): void {
		this.makeNoise();
		this.maid.GiveTask(
			this.playerController.playerCamera.CameraPositionChanged.Connect((newCframe) => {
				if (newCframe.Position === OfficeCameraCFrame.Position && math.random(1, 10) > chanceTadjikAppearing) {
					this.prepareToAttack();
				}
			}),
		);
		this.maid.GiveTask(
			this.playerController.playerCamera.cameraEnableChanged.Connect((enable) => {
				if (!enable && math.random(1, 10) > chanceTadjikAppearing) {
					this.prepareToAttack();
				}
			}),
		);
	}

	private stopNoise() {
		if (this.noiseThread === undefined) return;
		task.cancel(this.noiseThread);
	}

	private prepareToAttack() {
		if (this.attacked) return;
		this.attacked = true;
		this.stopNoise();
		this.instance.ScreenBlack.Decal.Texture = tajikID;
		this.startAttack();
	}

	private startAttack() {
		const maid = new Maid();

		const thread = task.delay(10 / this.complexity, () => {
			this.attacked = false;
			const screenPosition = this.instance.ScreenBlack.CFrame.Position;
			const dirVector = screenPosition.sub(this.playerController.playerCamera.camera.CFrame.Position).Unit;
			const dotResult = dirVector.Dot(this.playerController.playerCamera.camera.CFrame.LookVector);

			if (math.acos(dotResult) < angleVision) {
				Events.KillPlayer.fire();
			} else {
				maid.DoCleaning();
				this.makeNoise();
			}
		});
		maid.GiveTask(
			this.playerController.playerCamera.cameraEnableChanged.Connect((enable) => {
				if (enable) {
					task.cancel(thread);
					maid.DoCleaning();
					Events.KillPlayer();
				}
			}),
		);

		maid.GiveTask(
			this.playerController.playerCamera.CameraPositionChanged.Connect((state) => {
				task.cancel(thread);
				maid.DoCleaning();
				this.attacked = false;
				this.makeNoise();
			}),
		);
	}

	public Clean() {
		this.stopNoise();
		this.maid.DoCleaning();
	}

	private makeNoise() {
		this.noiseThread = task.spawn(() => {
			while (task.wait(0.025)) {
				{
					for (let i = 0; i < Noises.size(); i++) {
						task.wait(0.025 / Noises.size());
						this.instance.ScreenBlack.Decal.Texture = Noises[i];
					}
				}
			}
		});
	}
}
