import { Components } from "@flamework/components";
import { Dependency } from "@flamework/core";
import Maid from "@rbxts/maid";
import { PlayerController } from "client/controllers/PlayerController";

export abstract class State {
	protected maid = new Maid();

	constructor(protected readonly components: Components, protected readonly playerController: PlayerController) {}

	public abstract Enter(): void;
	public abstract Exit(): void;
	public abstract Update(): void;
}
