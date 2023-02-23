declare module "rpi-softspi" {
	export default class SoftSPI {
		constructor({ clock: number; mosi: number; miso: number; client: number; });
	}
}
