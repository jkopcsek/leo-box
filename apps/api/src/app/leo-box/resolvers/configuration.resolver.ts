import { Inject } from '@nestjs/common';
import {
  Args,
  Context, Field, Mutation, ObjectType, Query, Resolver
} from '@nestjs/graphql';
import 'reflect-metadata';
import { PrismaService } from '../../prisma/prisma.service';

@ObjectType()
export class ConfigurationObject {
  @Field()
  public deviceId?: string;
}
export enum ConfigurationKey {
  deviceId = 'deviceId',
}

@Resolver(ConfigurationObject)
export class ConfigurationResolver {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {
  }

  @Query((returns) => ConfigurationObject, { nullable: true })
  async configuration(@Context() ctx): Promise<ConfigurationObject> {
    const configuration: ConfigurationObject = {};
    const result = await this.prisma.configuration.findMany();
    result.filter((c) => Object.keys(ConfigurationObject).includes(c.key)).forEach((c) => configuration[c.key] = c.value);
    return configuration;
  }

  @Mutation((returns) => ConfigurationObject)
    async upsertConfiguration(
        @Args('data') data: ConfigurationObject,
        @Context() ctx,
    ): Promise<ConfigurationObject> {
      for (const key of Object.keys(ConfigurationObject).filter((c) => data[c])) {
        await this.prisma.configuration.upsert({
            where: { key },
            create: {
                key, 
                value: data[key],
            },
            update: {
                value: data[key],
            },
          });
      }

      return this.configuration(ctx);
    }
  
}