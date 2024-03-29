import { Inject, Logger } from '@nestjs/common'
import {
  Args,
  Context, Mutation, Query, Resolver, Subscription
} from '@nestjs/graphql'
import { PubSub } from 'graphql-subscriptions'
import 'reflect-metadata'
import { LeoBoxService } from '../leo-box.service'
import { TagScanner } from '../tag-scanner'
import { StateObject } from './state.object'
import { TagObject } from './tag.object'

const pubSub = new PubSub();

@Resolver(TagObject)
export class CurrentStateResolver {
  private readonly logger = new Logger(CurrentStateResolver.name);

  constructor(
    @Inject(TagScanner) private readonly tagScanner: TagScanner, 
    @Inject(LeoBoxService) private readonly leobox: LeoBoxService
  ) {
    tagScanner.currentTag.subscribe((currentTag) => pubSub.publish('currentTagChanged', {currentTagChanged: currentTag}));
  }

  @Query((returns) => TagObject, { nullable: true })
  async currentTag(@Context() ctx): Promise<TagObject> {
    return this.tagScanner.currentTag.value;
  }

  @Query((returns) => StateObject)
  async currentState(@Context() ctx): Promise<StateObject> {
    const lastPosition = this.leobox.currentlyPlaying?.lastTrackUri ? { 
      trackName: this.leobox.currentlyPlaying?.lastTrackName, 
      trackUri: this.leobox.currentlyPlaying?.lastTrackUri, 
      positionMs: this.leobox.currentlyPlaying?.lastPositionMs 
    } : undefined;

    return {
      tag: this.tagScanner.currentTag.value,
      overrideTag: this.tagScanner.overrideTagUid ? { uid: this.tagScanner.overrideTagUid } : undefined,
      currentlyPlaying: this.leobox.currentlyPlaying,
      lastPosition
    };
  }

  @Mutation((returns) => TagObject, {nullable: true})
  async overrideTagUid(
      @Args('uid', {nullable: true}) uid?: string,
  ): Promise<TagObject | undefined> {
      this.tagScanner.overrideTagUid = uid;
      return uid ? { uid } : undefined;
  }

  @Subscription((returns) => TagObject) 
  async currentTagChanged() {
    return pubSub.asyncIterator('currentTagChanged');
  }

}