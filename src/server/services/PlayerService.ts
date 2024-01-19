import { Components } from "@flamework/components";
import { Service, OnStart } from "@flamework/core";
import ProfileService from "@rbxts/profileservice";
import { Profile } from "@rbxts/profileservice/globals";
import { Players, RunService } from "@rbxts/services";
import { Enemies } from "server/classes/Enemies";
import { Nights } from "server/classes/Nights";
import { PlayerComponent } from "server/components/PlayerComponent";
import { Events } from "server/network";
import { SessionStatus } from "shared/types/SessionStatus";

let DataStoreName = "Production";
const KEY_TEMPLATE = "%d_Data";

if (RunService.IsStudio()) DataStoreName = "Testing";

const defaultSaveData: Replicas["PlayerState"]["Data"]["Static"] = {
	Night: 1,
};

@Service({})
export class PlayerService implements OnStart {
	private profileStore = ProfileService.GetProfileStore(DataStoreName, defaultSaveData);
	private profiles = new Map<Player, Profile<Replicas["PlayerState"]["Data"]["Static"]>>();

	constructor(private components: Components) {}
	onStart() {
		Players.PlayerAdded.Connect((player) => {
			const component = this.components.addComponent<PlayerComponent>(player);
			this.createProfile(player, component);
			task.wait(3);
			component.SetSessionStatus(SessionStatus.Menu);
			new Nights(component).Init();
		});
		Players.PlayerRemoving.Connect((player) => {
			this.removeProfile(player);
		});
		new Enemies().Init();
	}

	private createProfile(player: Player, playerComponent: PlayerComponent) {
		const userId = player.UserId;
		const profileKey = KEY_TEMPLATE.format(userId);
		const profile = this.profileStore.LoadProfileAsync(profileKey);

		if (!profile) return player.Kick();

		profile.ListenToRelease(() => {
			this.profiles.delete(player);
			player.Kick();
		});

		profile.AddUserId(userId);
		profile.Reconcile();

		this.profiles.set(player, profile);

		const connect = playerComponent.PlayerStateChanged.Connect((data) => {
			profile.Data = data.Static;
		});

		Players.PlayerRemoving.Connect((_player) => {
			if (player === _player) connect.Disconnect();
		});
	}

	private removeProfile(player: Player) {
		const profile = this.profiles.get(player);
		profile?.Release();
	}

	public getProfile(player: Player) {
		return this.profiles.get(player);
	}
}
