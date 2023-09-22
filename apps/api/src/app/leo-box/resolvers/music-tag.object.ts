import { Field, ObjectType } from "@nestjs/graphql";
import 'reflect-metadata';

@ObjectType()
export class MusicTagObject {
    @Field(() => String)
    uid: string;
    
    @Field(() => Date)
    createdAt: Date;
    
    @Field(() => Date)
    modifiedAt: Date;

    @Field(() => String, { nullable: true })
    name?: string;
    
    @Field(() => String, { nullable: true })
    type?: string;
    
    @Field(() => String, { nullable: true })
    imageUrl?: string;

    @Field(() => String, { nullable: true })
    uri?: string;

    @Field(() => String, { nullable: true })
    lastTrackUri?: string;

    @Field(() => String, { nullable: true })
    lastTrackName?: string;

    @Field(() => Number, { nullable: true })
    lastPositionMs?: number;
}