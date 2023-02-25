import { Inject } from '@nestjs/common';
import {
  Args, Field, ObjectType, Query, Resolver
} from '@nestjs/graphql';
import 'reflect-metadata';
import { SonosService } from '../sonos.service';

@ObjectType()
export class SonosItemObject {
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
export class SonosAuthObject {
  @Field()
  url: string;
}

@Resolver(SonosItemObject, {})
export class SonosResolver {
  constructor(@Inject(SonosService) private readonly sonosService: SonosService) {
  }

  @Query((returns) => SonosAuthObject)
  async sonosAuth(): Promise<SonosAuthObject> {
    const result = await this.sonosService.authenticateOAuth();

    return { url: result };
  }

  @Query((returns) => [SonosItemObject])
  async sonosSearch(
    @Args('query') query: string,
    @Args('type') type?: string,
  ): Promise<SonosItemObject[]> {
    // const result = await this.sonosService.search(query, type);

    // return [
    //   ...result.albums?.items.map((i) => this.toItem(i)) ?? [],
    //   ...result.tracks?.items.map((i) => this.trackToItem(i)) ?? [],
    //   ...result.playlists?.items.map((i) => this.toItem(i)) ?? [],
    //   ...result.audiobooks?.items.map((i) => this.toItem(i)) ?? [],
    // ]
    return [];
  }

}