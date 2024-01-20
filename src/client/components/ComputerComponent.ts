import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { Noises, OfficeCameraCFrame, ScalarProduct } from "client/utils";
import { PlayerController } from "client/controllers/PlayerController";
import { Events } from "client/network";
import Maid from "@rbxts/maid";
import { CameraComponent } from "./CameraComponent";

interface Attributes {}

math.randomseed(tick());

const tajikID = "rbxassetid://10427371065";
const chanceTadjikAppearing = 10;
const angleVision = math.rad(60);

@Component({})
export class ComputerComponent extends BaseComponent<Attributes, Monitor> implements OnStart {
	constructor(private playerController: PlayerController) {
		super();
	}
	private noiseThread?: thread;
	private maid = new Maid();
	private complexity = 2;
	private attacked = false;
	private cameraComponent!: CameraComponent;

	onStart(): void {
		this.cameraComponent = this.playerController.playerCamera;
		this.makeNoise();
		this.maid.GiveTask(
			this.cameraComponent.CameraOfficePositionChanged.Connect((newCframe) => {
				if (
					newCframe.Position === OfficeCameraCFrame.Position &&
					math.random(1, 100) <= chanceTadjikAppearing
				) {
					this.prepareToAttack();
				}
			}),
		);
		this.maid.GiveTask(
			this.cameraComponent.cameraEnableChanged.Connect((enable) => {
				if (!enable && math.random(1, 100) <= chanceTadjikAppearing) {
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

		maid.GiveTask(
			task.delay(10 / this.complexity, () => {
				Events.KillPlayer.fire();
				maid.DoCleaning();
			}),
		);
		maid.GiveTask(
			this.cameraComponent.cameraEnableChanged.Connect((enable) => {
				if (enable) {
					Events.KillPlayer();
					maid.DoCleaning();
				}
			}),
		);

		maid.GiveTask(
			this.cameraComponent.CameraOfficePositionChanged.Connect((state) => {
				this.attacked = false;
				this.makeNoise();
				maid.DoCleaning();
			}),
		);

		maid.GiveTask(
			this.cameraComponent.instance.GetPropertyChangedSignal("CFrame").Connect(() => {
				if (this.cameraComponent.instance.CFrame.Position !== OfficeCameraCFrame.Position) return;
				if (
					math.acos(
						ScalarProduct(this.cameraComponent.instance.CFrame, this.instance.ScreenBlack.CFrame.Position),
					) > angleVision
				) {
					this.attacked = false;
					this.makeNoise();
					maid.DoCleaning();
				}
			}),
		);
	}

	destroy(): void {
		this.stopNoise();
		this.maid.DoCleaning();
		super.destroy();
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
