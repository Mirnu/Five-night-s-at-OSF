interface Lamp extends Model {
	Cylinder: MeshPart & {
		One: Attachment;
		Light: Attachment & {
			PointLight: PointLight;
		};
		Beam: Beam;
		Two: Attachment;
	};
}
