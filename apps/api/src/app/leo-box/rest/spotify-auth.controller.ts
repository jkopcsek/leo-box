import { Controller, Get, Query, Redirect } from "@nestjs/common";
import { SpotifyService } from "../spotify.service";

@Controller('spotify-auth')
export class SpotifyAuthController {
  constructor(private readonly spotifyService: SpotifyService) {}

  @Get('/login')
  public async login(): Promise<{ url: string }> {
    return { url: await this.spotifyService.authenticateOAuth() };
  }

  @Get('/callback')
  @Redirect()
  public async callback(@Query('code') code: string, @Query('state') state: string): Promise<{ url: string }> {
    return { url: await this.spotifyService.authenticateCallback(code, state) };
  }

  @Get('/refresh')
  public async refresh(): Promise<void> {
    return await this.spotifyService.refreshToken();
  }
}
