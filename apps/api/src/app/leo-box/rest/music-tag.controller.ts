import { Body, Controller, Get, Put } from "@nestjs/common";
import { ApiBody } from "@nestjs/swagger";
import { MusicTagsDto } from "./dto/music-tags.dto";
import { MusicTagService } from "./music-tag.service";

@Controller('api/music-tag')
export class MusicTagController {
  constructor(private readonly musicTagService: MusicTagService) {}

  @Get('/')
  public async getMusicTags(): Promise<MusicTagsDto> {
    return this.musicTagService.getMusicTags();
  }

}
