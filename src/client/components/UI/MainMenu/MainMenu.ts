import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { Workspace } from "@rbxts/services";

interface Attributes {}

@Component({})
export class MainMenu extends BaseComponent<Attributes, Menu> implements OnStart {
	private camera = Workspace.CurrentCamera!;

	onStart() {
		print(1);
		this.enable();
	}

	private enable() {
		this.camera.CameraType = Enum.CameraType.Scriptable;
		this.camera.CFrame = Workspace.map.Insulator.StartPart.CFrame;
		this.instance.Enabled = true;
	}
}
