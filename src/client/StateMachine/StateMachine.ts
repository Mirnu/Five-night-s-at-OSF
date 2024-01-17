import { State } from "client/StateMachine/State";

export class StateMachine {
	public CurrentState?: State;

	public Initialize(startState: State) {
		this.CurrentState = startState;
		this.CurrentState.Enter();
	}

	public ChangeState(newState: State) {
		this.CurrentState?.Exit();
		this.CurrentState = newState;
		this.CurrentState.Enter();
	}
}
