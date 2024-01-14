import { Networking } from "@flamework/networking";
import { CameraState } from "./types/CameraState";

interface ClientToServerEvents {
	NewGame(): void;
	ContinueGame(): void;
	CameraStateChanged(state: CameraState): void;
	DoorOpened(): void;
	DoorClosed(): void;
	KillPlayer(): void;
}

interface ServerToClientEvents {}

interface ClientToServerFunctions {}

interface ServerToClientFunctions {}

export const GlobalEvents = Networking.createEvent<ClientToServerEvents, ServerToClientEvents>();
export const GlobalFunctions = Networking.createFunction<ClientToServerFunctions, ServerToClientFunctions>();
