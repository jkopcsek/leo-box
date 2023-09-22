
export interface Playable {
    uri: string;
    type: string;
    name: string;
    imageUrl?: string;
}

export interface Position {
    trackUri: string;
    trackName: string;
    positionMs: number;
}

export interface PlayablePosition {
    playable: Playable;
    position: Position;
}

export interface MusicProvider {
    getCurrentlyPlaying(): Promise<PlayablePosition>;
    search(query: String, type: String): Promise<Playable[]>;

    play(playable: Playable): Promise<void>;
    contine(playable: Playable, position: Position): Promise<void>;
    stop(playable: Playable): Promise<PlayablePosition>;
}