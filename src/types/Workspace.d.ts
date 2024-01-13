interface Workspace extends Instance {
	map: Folder & {
		Province: Folder & {
			StartPart: Part;
		};
		Insulator: Folder & {
			StartPart: Part;
		};
	};
}
