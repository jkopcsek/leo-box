import { Inject } from '@nestjs/common'
import {
  Context, Query, Resolver, Subscription
} from '@nestjs/graphql'
import { PubSub } from 'graphql-subscriptions'
import 'reflect-metadata'
import { TagScanner } from '../tag-scanner'
import { TagObject } from './tag.object'

const pubSub = new PubSub();

@Resolver(TagObject)
export class CurrentTagResolver {
  constructor(@Inject(TagScanner) private tagScanner: TagScanner) {
    tagScanner.currentTag.subscribe((currentTag) => pubSub.publish('currentTagChanged', {currentTagChanged: currentTag}));
  }

  @Query((returns) => TagObject, { nullable: true })
  async currentTag(@Context() ctx): Promise<TagObject> {
    return this.tagScanner.currentTag.value;
  }

  @Subscription((returns) => TagObject) 
  async currentTagChanged() {
    return pubSub.asyncIterator('currentTagChanged');
  }

}