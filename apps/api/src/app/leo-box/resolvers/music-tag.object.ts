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
    
    @Field(() => String)
    name?: string;
    
    @Field(() => String)
    imageUrl?: string;

    @Field(() => String)
    spotifyUri?: string;
}