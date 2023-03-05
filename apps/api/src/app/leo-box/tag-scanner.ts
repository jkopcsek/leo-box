/// <reference path="../mfrc522-rpi/mfrc522-rpi.d.ts"/>
/// <reference path="../rpi-softspi/rpi-softspi.d.ts"/>
import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import Mfrc522 from 'mfrc522-rpi';
import SoftSPI from 'rpi-softspi';
import { BehaviorSubject } from 'rxjs';

export type Tag = { uid: string };

@Injectable()
export class TagScanner implements OnApplicationBootstrap, OnApplicationShutdown {
    public currentTag = new BehaviorSubject<Tag | undefined>(undefined);
    public overrideTagUid?: string;

    private readonly logger = new Logger(TagScanner.name);
    private softSPI: SoftSPI;
    private mfrc522: Mfrc522;
    private timer?: NodeJS.Timer;


    constructor() {
        this.softSPI = new SoftSPI({
            clock: 23, // pin number of SCLK
            mosi: 19, // pin number of MOSI
            miso: 21, // pin number of MISO
            client: 24 // pin number of CS
        });

        this.mfrc522 = new Mfrc522(this.softSPI);
    }

    public onApplicationBootstrap() {
        this.start();
    }

    public onApplicationShutdown() {
        this.stop();
    }

    public start(): void {
        this.timer = setInterval(() => this.check(), 1000);
    }

    public stop(): void {
        if (this.timer) {
            clearInterval(this.timer);
        }
    }

    private check(): void {
        const currentTagUid = this.overrideTagUid ?? this.readTagUid();
        if (currentTagUid !== this.currentTag.value?.uid) {
            this.logger.log("Identified tag: "+currentTagUid+" (override: "+this.overrideTagUid+")");
            this.currentTag.next( currentTagUid ? { uid: currentTagUid } : undefined );
        }
    }

    private readTagUid(): string | undefined {
        //# reset card
        this.mfrc522.reset();

        //# Scan for cards
        const response = this.mfrc522.findCard();
        if (!response.status) {
            return;
        }

        //# Get the UID of the card
        const response2 = this.mfrc522.getUid();
        if (!response2.status) {
            this.logger.log("UID Scan Error");
            return;
        }
        //# If we have the UID, continue
        const uid = response2.data;
        if (uid) {
            return uid.map((a) => a.toString(16)).join('');
        }

        //# Stop
        // mfrc522.stopCrypto();
    }
}