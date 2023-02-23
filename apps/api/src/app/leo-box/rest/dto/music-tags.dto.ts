import { MusicTagDto } from "./music-tag.dto";

export class MusicTagsDto {
    constructor(public readonly musicTags: MusicTagDto[]) {}
}