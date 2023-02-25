import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { LeoBoxService } from './leo-box/leo-box-service';
import { LeoBoxController } from './leo-box/rest/leo-box.controller';
import { SpotifyAuthController } from './leo-box/rest/spotify-auth.controller';
import { SpotifyController } from './leo-box/rest/spotify.controller';
import { SpotifyMusicProvider } from './leo-box/spotify-music-provider';
import { SpotifyService } from './leo-box/spotify.service';
import { PrismaModule } from './prisma/prisma.module';
import { MusicTagResolver } from './leo-box/resolvers/music-tag.resolver';
import { CurrentTagResolver } from './leo-box/resolvers/current-tag.resolver';
import { TagScanner } from './leo-box/tag-scanner';
import { SpotifyResolver } from './leo-box/resolvers/spotify.resolver';
import { SonosService } from './leo-box/sonos.service';
import { SonosController } from './leo-box/rest/sonos.controller';
import { SonosResolver } from './leo-box/resolvers/sonos.resolver';
import { ConfigurationService } from './leo-box/configuration.service';

@Module({
  imports: [
    HttpModule, 
    PrismaModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: true,
      subscriptions: {'graphql-ws': {path: '/graphql'}},
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      buildSchemaOptions: { dateScalarMode: 'timestamp' },
    }),
  ],
  controllers: [LeoBoxController, SpotifyAuthController, SpotifyController, SonosController],
  providers: [ConfigurationService, LeoBoxService, SpotifyService, SpotifyMusicProvider, SonosService, MusicTagResolver, CurrentTagResolver, SpotifyResolver, SonosResolver, TagScanner],
})
export class AppModule {}
