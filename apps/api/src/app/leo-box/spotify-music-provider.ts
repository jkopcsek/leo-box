/**
 * This is an example of a basic node.js script that performs
 * the Client Credentials oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#client_credentials_flow
 */

import { Injectable } from '@nestjs/common';
import { CurrentlyPlaying, MusicProvider, Playable, Position } from './music-provider';
import { AlbumResponse, AudioBookResponse, ImageResponse, PlaylistResponse, SpotifyService, TrackResponse } from './spotify.service';

@Injectable()
export class SpotifyMusicProvider implements MusicProvider {

  constructor(private readonly spotifyService: SpotifyService) {
  }

  public async getCurrentlyPlaying(): Promise<CurrentlyPlaying> {
    const playing = await this.spotifyService.getCurrentlyPlaying();
    return {
      playable: playing.item.album,
      position: {
        trackUri: playing.item.uri,
        positionMs: playing.progress_ms,
      }
    };
  }

  public async search(query: string, type: string): Promise<Playable[]> {
    const result = await this.spotifyService.search(query, type);

    return [
      ...result.albums?.items.map((i) => this.toItem(i)) ?? [],
      ...result.tracks?.items.map((i) => this.trackToItem(i)) ?? [],
      ...result.playlists?.items.map((i) => this.toItem(i)) ?? [],
      ...result.audiobooks?.items.map((i) => this.toItem(i)) ?? [],
    ]
  }

  public async play(playable: Playable): Promise<void> {
    await this.spotifyService.play(playable.uri);
  }

  public async contine(playable: Playable, position: Position): Promise<void> {
    console.log("Continue with: "+JSON.stringify({uri: playable.uri, position}));
    await this.spotifyService.play(playable.uri, position.trackUri, position.positionMs);
  }

  public async stop(playable: Playable): Promise<Position> {
    const currentlyPlaying = await this.spotifyService.getCurrentlyPlaying();
    await this.spotifyService.pause();
    console.log("Stopped at: "+JSON.stringify({ trackUri: currentlyPlaying.item.uri, positionMs: currentlyPlaying.progress_ms }));
    return { trackUri: currentlyPlaying.item.uri, positionMs: currentlyPlaying.progress_ms };
  }


  private trackToItem(i: TrackResponse) {
    return {
      type: i.type,
      name: i.name,
      uri: i.uri,
      imageUrl: i.album ? this.selectBestImageUrl(i.album.images) : undefined,
    }
  }

  private toItem(i: AlbumResponse | PlaylistResponse | AudioBookResponse): Playable {
    return {
      type: i.type,
      name: i.name,
      uri: i.uri,
      imageUrl: i.images ? this.selectBestImageUrl(i.images) : undefined,
    }
  }

  private selectBestImageUrl(images?: ImageResponse[]): string | undefined {
    if (!images) {
      return undefined;
    }

    return images.filter((a) => a.height > 63).sort((a, b) => a.height - b.height).at(0)?.url;
  }

}