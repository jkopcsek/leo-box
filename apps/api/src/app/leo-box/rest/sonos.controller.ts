import { Controller, Get, Post, Query } from "@nestjs/common";
import { group } from "console";
import { SonosService } from "../sonos.service";

@Controller('sonos')
export class SonosController {
  constructor(private readonly sonosService: SonosService) {}

  @Get('/login')
  public async login(): Promise<{ url: string }> {
    return { url: await this.sonosService.authenticateOAuth() };
  }

  @Get('/callback')
  public async callback(@Query('code') code: string, @Query('state') state: string): Promise<string> {
    return await this.sonosService.authenticateCallback(code, state);
  }

  @Get('/refresh')
  public async refresh(): Promise<void> {
    return await this.sonosService.refreshToken();
  }

  @Get('/households') 
  public async getHouseholds(): Promise<any> {
    return this.sonosService.getHouseholds();
  }
  
  @Get('/groups') 
  public async getGroups(@Query('householdId') householdId: string): Promise<any> {
    return this.sonosService.getGroups(householdId);
  }

  @Get('/playback') 
  public async getPlaybackState(@Query('groupId') groupId: string): Promise<any> {
    return this.sonosService.getPlaybackState(groupId);
  }

  @Get('/playbackMetadata') 
  public async getPlaybackMetadata(@Query('groupId') groupId: string): Promise<any> {
    return this.sonosService.getPlaybackMetadata(groupId);
  }
  
  @Post('/play') 
  public async play(@Query('groupId') groupId: string): Promise<any> {
    return this.sonosService.play(groupId);
  }  

}
