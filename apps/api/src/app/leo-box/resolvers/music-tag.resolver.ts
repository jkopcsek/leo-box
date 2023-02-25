import { Inject } from '@nestjs/common'
import {
    Args,
    Context, Field, InputType, Mutation, Query, Resolver
} from '@nestjs/graphql'
import { plainToInstance } from 'class-transformer'
import 'reflect-metadata'
import { PrismaService } from '../../prisma/prisma.service'
import { MusicTagObject } from './music-tag.object'

@InputType()
class MusicTagCreateInput {
    @Field()
    uid: string

    @Field()
    name: string

    @Field()
    type: string

    @Field()
    imageUrl: string

    @Field()
    uri: string
}

@InputType()
class MusicTagUpdateInput {
    @Field()
    name: string

    @Field()
    type: string

    @Field()
    imageUrl: string

    @Field()
    uri: string
}

@Resolver(MusicTagObject)
export class MusicTagResolver {
    constructor(@Inject(PrismaService) private prisma: PrismaService) { }

    @Query((returns) => [MusicTagObject], { nullable: true })
    async musicTags(@Context() ctx): Promise<MusicTagObject[]> {
        return (await this.prisma.musicTag.findMany()).map((musicTag) => plainToInstance(MusicTagObject, musicTag));
    }

    @Mutation((returns) => MusicTagObject)
    async createMusicTag(
        @Args('data') data: MusicTagCreateInput,
        @Context() ctx,
    ): Promise<MusicTagObject | undefined> {
        return plainToInstance(MusicTagObject, await this.prisma.musicTag.create({
            data: {
                uid: data.uid,
                createdAt: new Date(),
                updatedAt: new Date(),
                name: data.name,
                type: data.type,
                uri: data.uri,
                imageUrl: data.imageUrl,
            },
        }));
    }

    @Mutation((returns) => MusicTagObject)
    async updateMusicTag(
        @Args('uid') uid: string,
        @Args('data') data: MusicTagUpdateInput,
        @Context() ctx,
    ): Promise<MusicTagObject | undefined> {
        return plainToInstance(MusicTagObject, await this.prisma.musicTag.update({
            where: { uid: uid },
            data: {
                uri: data.uri,
                imageUrl: data.imageUrl,
            },
        }));
    }

    @Mutation((returns) => MusicTagObject)
    async upsertMusicTag(
        @Args('uid') uid: string,
        @Args('data') data: MusicTagUpdateInput,
        @Context() ctx,
    ): Promise<MusicTagObject | undefined> {
        return plainToInstance(MusicTagObject, await this.prisma.musicTag.upsert({
            where: { uid: uid },
            create: {
                uid: uid,
                name: data.name,
                type: data.type,
                uri: data.uri,
                imageUrl: data.imageUrl,
            },
            update: {
                name: data.name,
                type: data.type,
                uri: data.uri,
                imageUrl: data.imageUrl,
            },
        }));
    }

    @Mutation((returns) => MusicTagObject)
    async deleteMusicTag(
        @Args('uid') uid: string,
        @Context() ctx,
    ): Promise<MusicTagObject | undefined> {
        return plainToInstance(MusicTagObject, await this.prisma.musicTag.delete({
            where: { uid }
        }));
    }
}