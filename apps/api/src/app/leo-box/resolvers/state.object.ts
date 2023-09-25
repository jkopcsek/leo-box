import { Field, ObjectType } from "@nestjs/graphql";
import { PlayableObject } from "./playable.object";
import { PositionObject } from "./position.object";
import { TagObject } from "./tag.object";
import { PlayablePosition } from "../music-provider";

@ObjectType()
export class StateObject {
    @Field({nullable: true})
    tag?: TagObject;

    @Field({nullable: true})
    overrideTag?: TagObject;

    @Field({nullable: true})
    currentlyPlaying?: PlayableObject;

    @Field({nullable: true})
    lastPlayed?: PlayableObject;

    @Field({nullable: true})
    lastPosition?: PositionObject;
}
