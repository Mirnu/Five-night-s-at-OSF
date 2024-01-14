interface Menu extends ScreenGui {
	Setting: TextButton;
	NewGame: TextButton;
	Extra: TextButton;
	Frame: Frame;
	ContinueGame: TextButton;
}

interface CameraGui extends ScreenGui {
	Cameras: Folder;
	Glitch: ImageLabel;
}

interface GameInterface extends ScreenGui {
	Time: TextLabel;
	Start: Frame & {
		Time: TextLabel;
		Night: TextLabel;
	};
}

interface PlayerGui extends Instance {
	Camera: Camera;
	Menu: Menu;
	GameInterface: GameInterface;
}
