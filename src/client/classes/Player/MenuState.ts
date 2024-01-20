import { State } from "../../StateMachine/State";
import { MenuCameraCFrame, Noises } from "client/utils";
import { MainMenuComponent } from "client/components/UI/MainMenu/MainMenuComponent";
import { CameraComponent, CameraState } from "client/components/CameraComponent";
import { Workspace } from "@rbxts/services";
import { GameInterfaceComponent } from "client/components/UI/GameInterfaceComponent";

export class MenuState extends State {
	public Enter(): void {
		this.playerController.playerCamera = this.components.addComponent<CameraComponent>(Workspace.CurrentCamera!);
		Workspace.CurrentCamera!.CameraType = Enum.CameraType.Scriptable;
		const camera = this.playerController.playerCamera;
		camera.CameraState === CameraState.Office;
		camera.instance.CFrame = MenuCameraCFrame;
		this.components.addComponent<MainMenuComponent>(this.playerController.Menu).Init(this.playerController.replica);
	}
	public Exit(): void {
		for (let i = 0; i < Noises.size(); i++) {
			Workspace.map.Province.Monitor.ScreenBlack.Decal.Texture = Noises[i];
		}
		this.components.addComponent<GameInterfaceComponent>(this.playerController.GameInterface);
		const gameInterface = this.components.getComponent<GameInterfaceComponent>(this.playerController.GameInterface);
		gameInterface?.EnableStarting();
		this.components.removeComponent<MainMenuComponent>(this.playerController.Menu);
		this.playerController.Menu.Enabled = false;
	}
	public Update(): void {}
}
