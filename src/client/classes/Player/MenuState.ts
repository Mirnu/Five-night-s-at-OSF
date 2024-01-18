import { State } from "../../StateMachine/State";
import { MenuCameraCFrame } from "client/utils";
import { MainMenuComponent } from "client/components/UI/MainMenu/MainMenuComponent";

export class MenuState extends State {
	public Enter(): void {
		const camera = this.playerController.playerCamera;
		camera.instance.CFrame = MenuCameraCFrame;
		print(this.playerController.Menu);
		this.components.addComponent<MainMenuComponent>(this.playerController.Menu);
	}
	public Exit(): void {
		this.components.removeComponent<MainMenuComponent>(this.playerController.Menu);
		this.playerController.Menu.Enabled = false;
	}
	public Update(): void {}
}
