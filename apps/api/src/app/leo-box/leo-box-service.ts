import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Playable, Position } from "./music-provider";
import { SpotifyMusicProvider } from "./spotify-music-provider";

@Injectable()
export class LeoBoxService {
    public currentlyPlaying?: Playable;

    public lastPlayed?: Playable;
    public lastMusicPosition?: Position;

    constructor(private readonly prisma: PrismaService, private readonly musicProvider: SpotifyMusicProvider) {
    }

    public tagChanged(tagUid?: string) {
        const playable = tagUid ? this.getMusicTagByUid[tagUid] : undefined;
        if (playable) {
            this.startPlaying(playable);
        } else {
            this.stopPlaying();
        }
    }

    public async getMusicTagByUid(uid: string): Promise<Playable | undefined> {
        return await this.prisma.musicTag.findUnique({where: { uid }});
    }
    
    public async startPlaying(playable: Playable): Promise<void> {
        if (playable) {
            if (this.currentlyPlaying === playable) {
                return;
            } else if (this.lastPlayed === playable && this.lastMusicPosition) {
                // continue
                this.musicProvider.contine(playable, this.lastMusicPosition);
            } else {
                // start from beginning
                this.musicProvider.play(playable);
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