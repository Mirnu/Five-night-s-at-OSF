interface Menu extends ScreenGui {
	Setting: TextButton;
	NewGame: TextButton;
	Extra: TextButton;
	Frame: Frame;
	ContinueGame: TextButton;
}

interface GameInterface extends ScreenGui {
	Time: TextLabel;
	Start: Frame & {
		Time: TextLabel;
		Night: TextLabel;
	};
}

interface PlayerGui extends Instance {
	Menu: Menu;
	GameInterface: GameInterface;
}
