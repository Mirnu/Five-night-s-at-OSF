import { Players, Workspace } from "@rbxts/services";

export const LocalPlayer = Players.LocalPlayer;

export const Noises = [
	"rbxassetid://13696329232",
	"rbxassetid://13696328887",
	"rbxassetid://13696328356",
	"rbxassetid://13696328086",
	"rbxassetid://13696327731",
	"rbxassetid://13696327341",
	"rbxassetid://13696326900",
	"rbxassetid://13696326516",
];

export const OfficeCameraCFrame = (
	Workspace.WaitForChild("map").WaitForChild("Province").WaitForChild("StartPart") as BasePart
).CFrame;
export const MenuCameraCFrame = (
	Workspace.WaitForChild("map").WaitForChild("Insulator").WaitForChild("StartPart") as BasePart
).CFrame;

export function ScalarProduct(cframe: CFrame, position: Vector3) {
	const dirVector = position.sub(cframe.Position).Unit;
	return dirVector.Dot(cframe.LookVector);
}
