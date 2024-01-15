interface Workspace extends Instance {
	map: Folder & {
		Cameras: Folder;
		Province: Folder & {
			StartPart: Part;
			Window: CameraBox;
			Door: CameraBox;
			Monitor: Monitor;
		};
		Insulator: Folder & {
			StartPart: Part;
		};
	};
}
