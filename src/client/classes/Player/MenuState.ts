import { Workspace } from "@rbxts/services";
import { State } from "../../StateMachine/State";
import { MenuCameraCFrame } from "client/utils";
import { MainMenuComponent } from "client/components/UI/MainMenu/MainMenuComponent";

export class MenuState extends State {
	public Enter(): void {
		const camera = this.playerController.playerCamera;
		camera.instance.CFrame = MenuCameraCFrame;
		this.components.addComponent<MainMenuComponent>(this.playerController.Menu);
	}
	public Exit(): void {
		this.components.removeComponent<MainMenuComponent>(this.playerController.Menu);
		this.playerController.Menu.Enabled = false;
	}
	public Update(): void {}
}
