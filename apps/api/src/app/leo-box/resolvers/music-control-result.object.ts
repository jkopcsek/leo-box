import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class MusicControlResult {
  @Field()
  result: string;

  @Field()
  error?: string;
}