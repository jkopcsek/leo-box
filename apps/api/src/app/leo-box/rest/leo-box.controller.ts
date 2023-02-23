import { Body, Controller, Get, Put } from "@nestjs/common";
import { ApiBody } from "@nestjs/swagger";
import { LeoBoxService } from "../leo-box-service";
import { Playable } from "../music-provider";

@Controller('api/leo-box')
export class LeoBoxController {
  constructor(private readonly leoboxService: LeoBoxService) {}

  @Get('/state')
  public async currentlyPlaying(): Promise<any> {
    return {
      currentlyPlaying: this.leoboxService.currentlyPlaying,
      lastPlayed: this.leoboxService.lastPlayed,
      lastPosition: this.leoboxService.lastMusicPosition,
    };
  }

  @Put('/play')
  @ApiBody({})
  public async play(@Body() body: Playable): Promise<void> {
    return this.leoboxService.startPlaying(body);
  }

  @Put('/pause')
  @ApiBody({})
  public async pause(): Promise<void> {
    return this.leoboxService.stopPlaying();
  }
}
