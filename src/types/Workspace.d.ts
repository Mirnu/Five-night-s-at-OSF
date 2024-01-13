interface Workspace extends Instance {
	map: Folder & {
		Insulator: Folder & {
			StartPart: Part;
		};
	};
}
