import { Inject, Logger } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import 'reflect-metadata'
import { SpotifyService } from '../spotify.service'
import { MusicControlResult } from './music-control-result.object'

@Resolver(MusicControlResult)
export class MusicControlsResolver {
  private readonly logger = new Logger(MusicControlsResolver.name);

  constructor(
    @Inject(SpotifyService) private readonly spotifyService: SpotifyService
  ) {}

  @Mutation((returns) => MusicControlResult)
  async fastForward(): Promise<MusicControlResult> {
    await this.spotifyService.fastForward();
    return { result: "OK" };
  }

  @Mutation((returns) => MusicControlResult)
  async fastBackward(): Promise<MusicControlResult> {
    await this.spotifyService.fastForward();
    return { result: "OK" };
  }

  @Mutation((returns) => MusicControlResult)
  async play(@Args("uri") uri: string): Promise<MusicControlResult> {
    await this.spotifyService.play(uri);
    return { result: "OK" };
  }

  @Mutation((returns) => MusicControlResult)
  async resume(): Promise<MusicControlResult> {
    await this.spotifyService.resume();
    return { result: "OK" };
  }

  @Mutation((returns) => MusicControlResult)
  async pause(): Promise<MusicControlResult> {
    await this.spotifyService.pause();
    return { result: "OK" };
  }
}