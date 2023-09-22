

import { Injectable, Logger } from '@nestjs/common';
import { MusicProvider, Playable, PlayablePosition, Position } from './music-provider';
import { AlbumResponse, AudioBookResponse, ImageResponse, PlaylistResponse, SpotifyService, TrackResponse } from './spotify.service';

@Injectable()
export class SpotifyMusicProvider implements MusicProvider {
  private readonly logger = new Logger(SpotifyMusicProvider.name);

  constructor(private readonly spotifyService: SpotifyService) {
  }

  public async getCurrentlyPlaying(): Promise<PlayablePosition> {
    const playing = await this.spotifyService.getCurrentlyPlaying();
    return {
      playable: playing.item.album,
      position: {
        trackUri: playing.item.uri,
        trackName: playing.item.name,
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
    this.logger.log("Continue with: "+JSON.stringify({uri: playable.uri, position}));
    await this.spotifyService.play(playable.uri, position.trackUri, position.positionMs);
  }

  public async stop(playable: Playable): Promise<PlayablePosition | undefined> {
    const currentlyPlaying = await this.getCurrentlyPlaying();
    await this.spotifyService.pause();
    this.logger.log("Stopped at: "+JSON.stringify(currentlyPlaying));
    return currentlyPlaying;
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