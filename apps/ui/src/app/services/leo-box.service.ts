
import { Injectable } from '@angular/core';
import { ApolloQueryResult, FetchResult } from '@apollo/client/core';
import { Apollo, ApolloBase, gql, MutationResult } from 'apollo-angular';
import { Observable } from 'rxjs';

export interface Tag {
  uid: string;
}

export interface Playable {
  uri: string;
  type: string;
  name: string;
  imageUrl?: string;
}

export interface Position {
  trackUri: string;
  trackName?: string;
  positionMs: number;
}

export interface State {
  tag?: Tag;
  overrideTag?: Tag;
  currentlyPlaying?: Playable;
  lastPlayed?: Playable;
  lastPosition?: Position;
}

export interface MusicTag {
  uid: string;
  name: string;
  type: string;
  uri: string;
  imageUrl?: string;
  lastTrackUri?: string;
  lastTrackName?: string;
  lastPositionMs?: number;
}

export interface SpotifyItem {
  uri: string;
  name: string;
  type: string;
  imageUrl?: string;
}

@Injectable()
export class LeoBoxService {
  private apollo: ApolloBase;
 
  constructor(private apolloProvider: Apollo) {
    this.apollo = this.apolloProvider;
  }

  public watchQueryCurrentState(): Observable<ApolloQueryResult<{currentState: State}>> {
    return this.apollo.watchQuery<{currentState:State}>({
      query: gql`{
        currentState {
          tag {
            uid
          },
          overrideTag {
            uid
          }
          currentlyPlaying {
            uri,
            type,
            name,
            imageUrl
          },
          lastPlayed {
            uri,
            type,
            name,
            imageUrl
          },
          lastPosition {
            trackUri
            trackName
            positionMs
          }
        }
      }`,
      pollInterval: 1000,
    }).valueChanges;
  }
 
  public watchQueryMusicTags(): Observable<ApolloQueryResult<{musicTags: MusicTag[]}>> {
    return this.apollo.watchQuery<{musicTags: MusicTag[]}>({
      query: gql`{
        musicTags {
          uid
          name
          type
          uri
          imageUrl
          lastTrackUri
          lastTrackName
          lastPositionMs
        }
      }`,
      pollInterval: 5000,
    }).valueChanges;
  }

  public upsertMusicTag(uid: string, name: string, type: string, uri: string, imageUrl?: string): Observable<MutationResult<{upsertMusicTag: MusicTag}>> {
    return this.apollo.mutate({
      mutation: gql`mutation upsertMusicTag($uid: String!, $data: MusicTagUpdateInput!) {
        upsertMusicTag(uid: $uid, data: $data) {
          uid,
          name,
          type,
          uri,
          imageUrl
        }
      }`, 
      variables: {
        uid, data: {name, type, imageUrl, uri}
      }
    });
  }

  public deleteMusicTag(uid: string): Observable<MutationResult<{deleteMusicTag: MusicTag}>> {
    return this.apollo.mutate({
      mutation: gql`mutation deleteMusicTag($uid: String!) {
        deleteMusicTag(uid: $uid) {
          uid,
          name,
          type,
          uri,
          imageUrl
        }
      }`, 
      variables: {
        uid
      }
    });
  }

  public querySpotifyAuthentication(): Observable<ApolloQueryResult<{spotifyAuth: {url: string}}>> {
    return this.apollo.query({
      query: gql`query SpotifyAuth {
        spotifyAuth {
          url
        }
      }`,
    });
  }

  public querySpotify(query: string, type: string): Observable<ApolloQueryResult<{spotifySearch: SpotifyItem[]}>> {
    return this.apollo.query({
      query: gql`query SpotifySearch($query: String!, $type: String!) {
        spotifySearch(query: $query, type: $type) {
          uri,
          name,
          type,
          imageUrl
        }
      }`,
      variables: {
        query, type
      }
    });
  }

  public querySonosAuthentication(): Observable<ApolloQueryResult<{sonosAuth: {url: string}}>> {
    return this.apollo.query({
      query: gql`query SonosAuth {
        sonosAuth {
          url
        }
      }`,
    });
  }

  public querySonos(query: string, type: string): Observable<ApolloQueryResult<{sonosSearch: SpotifyItem[]}>> {
    return this.apollo.query({
      query: gql`query SonosSearch($query: String!, $type: String!) {
        sonosSearch(query: $query, type: $type) {
          uri,
          name,
          type,
          imageUrl
        }
      }`,
      variables: {
        query, type
      }
    });
  }

  public subscribeCurrentTag(): Observable<FetchResult<string>> {
    return this.apollo.subscribe({
      query: gql`{
        {}
      }`
    });
  }

  //#region Music Controls
  public fastForward(): Observable<MutationResult<{result: string, error?: string}>> {
    return this.apollo.mutate({
      mutation: gql`mutation fastForward {
        fastForward {
          result
          error
        }
      }`
    });
  }

  public fastBackward(): Observable<MutationResult<{result: string, error?: string}>> {
    return this.apollo.mutate({
      mutation: gql`mutation fastBackward {
        fastBackward {
          result
          error
        }
      }`
    });
  }

  public overrideTagUid(item?: MusicTag): Observable<MutationResult<{result: string, error?: string}>> {
    return this.apollo.mutate({
      mutation: gql`mutation overrideTagUid($uid: String) {
        overrideTagUid(uid: $uid) {
          uid
        }
      }`,
      variables: {
        uid: item?.uid
      }
    });    
}

  public play(item: SpotifyItem | MusicTag): Observable<MutationResult<{result: string, error?: string}>> {
      return this.apollo.mutate({
        mutation: gql`mutation play($uri: String!) {
          play(uri: $uri) {
            result
            error
          }
        }`,
        variables: {
          uri: item.uri
        }
      });    
  }

  public resume(): Observable<MutationResult<{result: string, error?: string}>> {
    return this.apollo.mutate({
      mutation: gql`mutation resume {
        resume {
          result
          error
        }
      }`
    });
  }

  public pause(): Observable<MutationResult<{result: string, error?: string}>> {
    return this.apollo.mutate({
      mutation: gql`mutation pause {
        pause {
          result
          error
        }
      }`
    });
  }
  //#endregion
}
