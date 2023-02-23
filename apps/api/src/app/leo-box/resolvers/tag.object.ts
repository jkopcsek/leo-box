import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class TagObject {
    @Field()
    uid: string;
}
