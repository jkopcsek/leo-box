import { Controller, Get, Query } from "@nestjs/common";
import { SpotifyService } from "../spotify.service";

@Controller('spotify-auth')
export class SpotifyAuthController {
  constructor(private readonly spotifyService: SpotifyService) {}

  @Get('/login')
  public async login(): Promise<{ url: string }> {
    return { url: await this.spotifyService.authenticateOAuth() };
  }

  @Get('/callback')
  public async callback(@Query('code') code: string, @Query('state') state: string): Promise<string> {
    return await this.spotifyService.authenticateCallback(code, state);
  }
}
