import { Injectable } from "@nestjs/common";
import { Subscription } from "rxjs";
import { PrismaService } from "../prisma/prisma.service";
import { Playable, Position } from "./music-provider";
import { SpotifyMusicProvider } from "./spotify-music-provider";
import { TagScanner } from "./tag-scanner";

@Injectable()
export class LeoBoxService {
    public currentlyPlaying?: Playable;

    public lastPlayed?: Playable;
    public lastMusicPosition?: Position;

    private tagScannerSubscription: Subscription;

    constructor(
        private readonly prisma: PrismaService,
        private readonly musicProvider: SpotifyMusicProvider,
        private readonly tagScanner: TagScanner,
    ) {
        this.tagScannerSubscription = tagScanner.currentTag.subscribe(async (tag) => await this.tagChanged(tag?.uid))
    }

    public async tagChanged(tagUid?: string): Promise<void> {
        try {
            const playable = tagUid ? (await this.getMusicTagByUid(tagUid)) : undefined;
            if (playable) {
                console.log("Found playable "+playable+" from tag "+tagUid+": starting");
                await this.startPlaying(playable);
            } else {
                console.log("Found no playable from tag "+tagUid+": stopping");
                await this.stopPlaying();
            }
        } catch (error) {
            console.error("An error occured while reacting to a tag change: ", error);
        }
    }

    public async getMusicTagByUid(uid: string): Promise<Playable | undefined> {
        return await this.prisma.musicTag.findUnique({ where: { uid } });
    }

    public async startPlaying(playable: Playable): Promise<void> {
        if (playable) {
            if (this.currentlyPlaying?.uri === playable.uri) {
                return;
            } else if (this.lastPlayed?.uri === playable.uri && this.lastMusicPosition) {
                // continue
                await this.musicProvider.contine(playable, this.lastMusicPosition);
            } else {
                // start from beginning
                await this.musicProvider.play(playable);
            }
            this.currentlyPlaying = playable;
            this.lastPlayed = undefined;
            this.lastMusicPosition = undefined;
        }
    }

    public async stopPlaying() {
        if (this.currentlyPlaying) {
            this.lastPlayed = this.currentlyPlaying;
            this.lastMusicPosition = await this.musicProvider.stop(this.currentlyPlaying);
            this.currentlyPlaying = undefined;
        }
    }
}