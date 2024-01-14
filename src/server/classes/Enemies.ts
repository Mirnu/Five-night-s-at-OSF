import { Components } from "@flamework/components";
import { Dependency } from "@flamework/core";
import { PlayerComponent } from "server/components/PlayerComponent";
import { Events } from "server/network";

const components = Dependency<Components>();

export class Enemies {
	public Init() {
		this.handleEvents();
	}

	private handleEvents() {
		Events.KillPlayer.connect((player) => {
			const component = components.getComponent<PlayerComponent>(player);
			component?.EndNight();
		});
	}
}
