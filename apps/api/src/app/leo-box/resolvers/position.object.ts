import { Field, ObjectType } from "@nestjs/graphql";
import { Position } from "../music-provider";

@ObjectType()
export class PositionObject implements Position {
    @Field()
    trackUri: string;

    @Field({nullable: true})
    trackName: string;

    @Field()
    positionMs: number;
}
