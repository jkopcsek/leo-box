import { MusicTag } from ".prisma/client";
import { Injectable, Logger } from "@nestjs/common";
import { Subscription } from "rxjs";
import { PrismaService } from "../prisma/prisma.service";
import { SpotifyMusicProvider } from "./spotify-music-provider";
import { TagScanner } from "./tag-scanner";

@Injectable()
export class LeoBoxService {
    public currentlyPlaying?: MusicTag;

    private readonly logger = new Logger(LeoBoxService.name);

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
            const musicTag = tagUid ? (await this.getMusicTagByUid(tagUid)) : undefined;
            if (musicTag) {
                this.logger.log("Found playable "+musicTag+" from tag "+tagUid+": starting");
                await this.startPlaying(musicTag);
            } else {
                this.logger.log("Found no playable from tag "+tagUid+": stopping");
                await this.stopPlaying();
            }
        } catch (error) {
            this.logger.error("An error occured while reacting to a tag change: ", error);
        }
    }

    public async getMusicTagByUid(uid: string): Promise<MusicTag | undefined> {
        return await this.prisma.musicTag.findUnique({ where: { uid } });
    }

    public async startPlaying(musicTag: MusicTag): Promise<void> {
        if (musicTag) {
            if (this.currentlyPlaying?.uri === musicTag.uri) {
                return;
            } else if (musicTag.lastTrackUri) {
                // continue
                await this.musicProvider.contine(musicTag, {trackUri: musicTag.lastTrackUri, trackName: musicTag.lastTrackName, positionMs: musicTag.lastPositionMs });
            } else {
                // start from beginning
                await this.musicProvider.play(musicTag);
            }
            this.currentlyPlaying = musicTag;
        }
    }

    public async updatePosition() {
        if (this.currentlyPlaying) {
            const position = await this.musicProvider.getCurrentlyPlaying();
            if (position.playable.uri === this.currentlyPlaying.uri) {
                await this.prisma.musicTag.update({
                    where: { uid: this.currentlyPlaying.uid },
                    data: {
                        lastTrackUri: position.position.trackUri,
                        lastTrackName: position.position.trackName,
                        lastPositionMs: position.position.positionMs,
                    }
                });
            }
        }
    }

    public async stopPlaying() {
        if (this.currentlyPlaying) {
            const lastPosition = await this.musicProvider.stop(this.currentlyPlaying);
            
            if (lastPosition.playable.uri === this.currentlyPlaying.uri) {
                await this.prisma.musicTag.update({
                    where: { uid: this.currentlyPlaying.uid },
                    data: {
                        lastTrackUri: lastPosition.position.trackUri,
                        lastTrackName: lastPosition.position.trackName,
                        lastPositionMs: lastPosition.position.positionMs,
                    }
                });
            }

            this.currentlyPlaying = undefined;
        }
    }
}