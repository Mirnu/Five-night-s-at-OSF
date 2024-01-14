interface Door extends Model {
	other: Folder & {
		Main: MeshPart;
		stick: MeshPart;
	};
	stick: MeshPart & {
		Weld: Weld;
	};
	Door: MeshPart;
}
