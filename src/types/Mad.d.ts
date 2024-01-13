import { Replica } from "@rbxts/replicaservice";
import { SessionStatus } from "shared/types/SessionStatus";

declare global {
	interface Replicas {
		PlayerState: {
			Data: {
				Static: {
					Night: number;
				};
				Dynamic: {
					SessionStatus: SessionStatus;
				};
			};
		};
	}
}

export type PLayerStateData = {
	Static: {
		Night: number;
	};
	Dynamic: {
		SessionStatus: SessionStatus;
	};
};
export type PlayerDataReplica = Replica<"PlayerState">;
