interface Door extends Part {
	Door: Model & {
		other: Folder & {
			Main: MeshPart;
			stick: MeshPart;
		};
		stick: MeshPart & {
			Weld: Weld;
		};
		Door: MeshPart;
	};

	ClickDetector: ClickDetector;
	Camera: Part;
}
