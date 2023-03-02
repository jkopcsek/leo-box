import { Field, ObjectType } from "@nestjs/graphql";
import { Playable } from "../music-provider";

@ObjectType()
export class PlayableObject implements Playable {
    @Field()
    uri: string;
    
    @Field()
    type: string;
    
    @Field()
    name: string;

    @Field()
    imageUrl?: string;
}
