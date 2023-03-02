import { Field, ObjectType } from "@nestjs/graphql";
import { PlayableObject } from "./playable.object";
import { PositionObject } from "./position.object";
import { TagObject } from "./tag.object";

@ObjectType()
export class StateObject {
    @Field({nullable: true})
    tag?: TagObject;

    @Field({nullable: true})
    currentlyPlaying?: PlayableObject;

    @Field({nullable: true})
    lastPlayed?: PlayableObject;

    @Field({nullable: true})
    lastPosition?: PositionObject;
}
