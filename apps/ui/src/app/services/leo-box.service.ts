
import { Injectable } from '@angular/core';
import { ApolloQueryResult, FetchResult } from '@apollo/client/core';
import { Apollo, ApolloBase, gql, MutationResult } from 'apollo-angular';
import { Observable } from 'rxjs';

export interface Tag {
  uid: string;
}

export interface MusicTag {
  uid: string;
  name: string;
  spotifyUri: string;
  imageUrl?: string;
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

  public watchQueryCurrentTag(): Observable<ApolloQueryResult<{currentTag: Tag}>> {
    return this.apollo.watchQuery<{currentTag:Tag}>({
      query: gql`{
        currentTag {
          uid
        }
      }`,
      pollInterval: 1000,
    }).valueChanges;
  }
 
  public queryMusicTags(): Observable<ApolloQueryResult<{musicTags: MusicTag[]}>> {
    return this.apollo.query({
      query: gql`{
        musicTags {
          uid,
          name,
          spotifyUri,
          imageUrl
        }
      }`
    });
  }

  public upsertMusicTag(uid: string, name: string, type: string, spotifyUri: string, imageUrl?: string): Observable<MutationResult<{upsertMusicTag: MusicTag}>> {
    return this.apollo.mutate({
      mutation: gql`mutation upsertMusicTag($uid: String!, $data: MusicTagUpdateInput!) {
        upsertMusicTag(uid: $uid, data: $data) {
          uid,
          name,
          spotifyUri
          imageUrl
        }
      }`, 
      variables: {
        uid, data: {name, type, imageUrl, spotifyUri}
      }
    });
  }

  public deleteMusicTag(uid: string): Observable<MutationResult<{deleteMusicTag: MusicTag}>> {
    return this.apollo.mutate({
      mutation: gql`mutation deleteMusicTag($uid: String!) {
        deleteMusicTag(uid: $uid) {
          uid,
          name,
          spotifyUri,
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
}
