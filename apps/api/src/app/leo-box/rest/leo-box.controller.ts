import { Body, Controller, Get, Put } from "@nestjs/common";
import { ApiBody } from "@nestjs/swagger";
import { LeoBoxService } from "../leo-box.service";
import { MusicTagDto } from "./dto/music-tag.dto";

@Controller('api/leo-box')
export class LeoBoxController {
  constructor(private readonly leoboxService: LeoBoxService) {}

  @Get('/state')
  public async currentlyPlaying(): Promise<any> {
    return {
      currentlyPlaying: this.leoboxService.currentlyPlaying,
    };
  }

  @Put('/play')
  @ApiBody({})
  public async play(@Body() body: MusicTagDto): Promise<void> {
    return this.leoboxService.startPlaying(body);
  }

  @Put('/pause')
  @ApiBody({})
  public async pause(): Promise<void> {
    return this.leoboxService.stopPlaying();
  }
}
