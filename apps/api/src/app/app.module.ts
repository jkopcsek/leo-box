import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { ScheduleModule } from '@nestjs/schedule';
import { join } from 'path';
import { ConfigurationService } from './leo-box/configuration.service';
import { LeoBoxScheduler } from './leo-box/leo-box.scheduler';
import { LeoBoxService } from './leo-box/leo-box.service';
import { CurrentStateResolver } from './leo-box/resolvers/current-state.resolver';
import { MusicControlsResolver } from './leo-box/resolvers/music-control.resolver';
import { MusicTagResolver } from './leo-box/resolvers/music-tag.resolver';
import { SonosResolver } from './leo-box/resolvers/sonos.resolver';
import { SpotifyResolver } from './leo-box/resolvers/spotify.resolver';
import { LeoBoxController } from './leo-box/rest/leo-box.controller';
import { SonosController } from './leo-box/rest/sonos.controller';
import { SpotifyAuthController } from './leo-box/rest/spotify-auth.controller';
import { SpotifyController } from './leo-box/rest/spotify.controller';
import { SonosService } from './leo-box/sonos.service';
import { SpotifyMusicProvider } from './leo-box/spotify-music-provider';
import { SpotifyService } from './leo-box/spotify.service';
import { TagScanner } from './leo-box/tag-scanner';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    HttpModule, 
    PrismaModule,
    ScheduleModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: true,
      subscriptions: {'graphql-ws': {path: '/graphql'}},
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      buildSchemaOptions: { dateScalarMode: 'timestamp' },
    }),
  ],
  controllers: [LeoBoxController, SpotifyAuthController, SpotifyController, SonosController],
  providers: [ConfigurationService, LeoBoxService, LeoBoxScheduler, SpotifyService, SpotifyMusicProvider, SonosService, MusicTagResolver, CurrentStateResolver, SpotifyResolver, SonosResolver, MusicControlsResolver, TagScanner],
})
export class AppModule {}
