export class MusicTagDto {
    uid: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    type: string;
    imageUrl: string | null;
    uri: string;
    lastTrackUri: string | null;
    lastPositionMs: number | null;
}