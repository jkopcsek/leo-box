
import { Injectable } from '@angular/core';
import { ApolloQueryResult, FetchResult } from '@apollo/client/core';
import { Apollo, ApolloBase, gql } from 'apollo-angular';
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

  public upsertMusicTag(uid: string, name: string, spotifyUri: string, imageUrl?: string): Observable<ApolloQueryResult<{upsertMusicTag: MusicTag}>> {
    return this.apollo.query({
      query: gql`mutation upsertMusicTag($uid: String!, $name: String, $imageUrl: String, $spotifyUri: String) {
        upsertMusicTag(uid: $uid, name: $name, imageUrl: $imageUrl, spotifyUri: $spotifyUri) {
          uid,
          name,
          spotifyUri
          imageUrl
        }
      }`, 
      variables: {
        uid, name, imageUrl, spotifyUri
      }
    });
  }

  public deleteMusicTag(uid: string): Observable<ApolloQueryResult<{deleteMusicTag: MusicTag}>> {
    return this.apollo.query({
      query: gql`mutation deleteMusicTag($uid: String!) {
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

  public querySpotify(query: string, type: string): Observable<ApolloQueryResult<{search: SpotifyItem[]}>> {
    return this.apollo.query({
      query: gql`query Search($query: String!, $type: String!) {
        search(query: $query, type: $type) {
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
