interface Menu extends ScreenGui {
	Contine: TextButton;
	Extra: TextButton;
	Frame: Frame;
	NewGame: TextButton;
}

interface PlayerGui extends Instance {
	Menu: Menu;
	Camera: ScreenGui & {
		Glitch: ImageLabel;
		Zaklych: TextButton;
		TexPod: TextButton;
		Izolyator: TextButton;
	};
}
