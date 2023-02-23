/**
 * This is an example of a basic node.js script that performs
 * the Client Credentials oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#client_credentials_flow
 */

import { Injectable } from '@nestjs/common';
import { MusicProvider, Playable, Position } from './music-provider';
import { SpotifyService } from './spotify.service';

@Injectable()
export class SpotifyMusicProvider implements MusicProvider {

  constructor(private readonly spotifyService: SpotifyService) {
  }
  
  public async play(playable: Playable): Promise<void> {
    await this.spotifyService.play(playable.spotifyUri);
  }

  public async contine(playable: Playable, position: Position): Promise<void> {
    await this.spotifyService.play(playable.spotifyUri, position.spotifyTrackUri, position.positionMs);
  }

  public async stop(playable: Playable): Promise<Position> {
    const currentlyPlaying = await this.spotifyService.getCurrentlyPlaying();
    const result = await this.spotifyService.pause();
    return { spotifyTrackUri: currentlyPlaying.item.uri, positionMs: currentlyPlaying.progress_ms };
  }
}