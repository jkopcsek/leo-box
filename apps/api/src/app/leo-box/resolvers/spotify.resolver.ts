import { Inject } from '@nestjs/common';
import {
  Args, Field, ObjectType, Query, Resolver
} from '@nestjs/graphql';
import 'reflect-metadata';
import { AlbumResponse, AudioBookResponse, ImageResponse, PlaylistResponse, SpotifyService, TrackResponse } from '../spotify.service';

@ObjectType()
export class SpotifyItemObject {
  @Field()
  type: string;
  
  @Field()
  name: string;
  
  @Field()
  uri: string;

  @Field({nullable: true})
  imageUrl?: string;
}


@ObjectType()
export class SpotifyAuthObject {
  @Field()
  url: string;
}

@Resolver(SpotifyItemObject, {})
export class SpotifyResolver {
  constructor(@Inject(SpotifyService) private readonly spotifyService: SpotifyService) {
  }

  @Query((returns) => [SpotifyItemObject])
  async search(
    @Args('query') query: string,
    @Args('type') type?: string,
  ): Promise<SpotifyItemObject[]> {
    const result = await this.spotifyService.search(query, type);

    return [
      ...result.albums?.items.map((i) => this.toItem(i)) ?? [],
      ...result.tracks?.items.map((i) => this.trackToItem(i)) ?? [],
      ...result.playlists?.items.map((i) => this.toItem(i)) ?? [],
      ...result.audiobooks?.items.map((i) => this.toItem(i)) ?? [],
    ]
  }

  @Query((returns) => SpotifyAuthObject)
  async spotifyAuth(): Promise<SpotifyAuthObject> {
    const result = await this.spotifyService.authenticateOAuth();

    return { url: result };
  }
  
  trackToItem(i: TrackResponse) {
    return {
      type: i.type,
      name: i.name,
      uri: i.uri,
      imageUrl: i.album ? this.selectBestImageUrl(i.album.images) : undefined,
    }
  }

  toItem(i: AlbumResponse | PlaylistResponse | AudioBookResponse): SpotifyItemObject {
    return {
      type: i.type,
      name: i.name,
      uri: i.uri,
      imageUrl: i.images ? this.selectBestImageUrl(i.images) : undefined,
    }
  }

  selectBestImageUrl(images?: ImageResponse[]): string | undefined {
    if (!images) {
      return undefined;
    }

    return images.filter((a) => a.height > 63).sort((a, b) => a.height - b.height).at(0)?.url;
  }

}