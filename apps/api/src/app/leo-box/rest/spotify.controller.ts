import { Controller, Get, Query } from "@nestjs/common";
import { SpotifyService } from "../spotify.service";

@Controller('spotify')
export class SpotifyController {
  constructor(private readonly spotifyService: SpotifyService) {}

  @Get('/devices')
  public async devices(): Promise<any> {
    return this.spotifyService.getDevices();
  }

  @Get('/search')
  public async search(@Query('q') q: string, @Query('type') type: string): Promise<any> {
    return this.spotifyService.search(q, type);
  }
}
