declare module "mfrc522-rpi" {
	export default class Mfrc522 {
		constructor(spi: any);
		reset(): void;
		findCard(): { status?: boolean; bitSize?: number; };
		getUid(): { status?: boolean; bitSize?: number; data?: number[]; };
	}
}
