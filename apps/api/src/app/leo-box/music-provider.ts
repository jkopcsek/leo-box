
export interface Playable {
    uri: string;
    type: string;
    name: string;
    imageUrl?: string;
}

export interface Position {
    trackUri: string;
    positionMs: number;
}

export interface CurrentlyPlaying {
    playable: Playable;
    position: Position;
}

export interface MusicProvider {
    getCurrentlyPlaying(): Promise<CurrentlyPlaying>;
    search(query: String, type: String): Promise<Playable[]>;

    play(playable: Playable): Promise<void>;
    contine(playable: Playable, position: Position): Promise<void>;
    stop(playable: Playable): Promise<Position>;
}