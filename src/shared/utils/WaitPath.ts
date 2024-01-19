export function WaitForPath(target: Instance, path: string, maxWait?: number) {
	let latest;
	const start = tick();
	if (maxWait !== undefined) {
		latest = target.WaitForChild(path, start + maxWait - tick());
	} else {
		latest = target.WaitForChild(path);
	}
	if (latest) {
		target = latest;
	} else {
		return undefined;
	}

	return latest;
}
