interface Workspace extends Instance {
	map: Folder & {
		Cameras: Folder;
		Province: Folder & {
			StartPart: Part;
		};
		Insulator: Folder & {
			StartPart: Part;
		};
	};
}
