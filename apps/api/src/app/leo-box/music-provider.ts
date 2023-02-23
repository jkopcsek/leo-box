
export interface Playable {
    spotifyUri: string;
}

export interface Album extends Playable {
    id: string;
    name: string;
}

export interface Song extends Playable {
    id: string;
    name: string;
}

export interface Position {
    spotifyTrackUri: string;
    positionMs: number;
}

export interface MusicProvider {
    play(playable: Playable): Promise<void>;
    contine(playable: Playable, position: Position): Promise<void>;
    stop(playable: Playable): Promise<Position>;
}