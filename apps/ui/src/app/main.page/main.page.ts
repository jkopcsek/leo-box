import { Component, OnDestroy, OnInit } from '@angular/core';
import { lastValueFrom, Subscription } from 'rxjs';
import { LeoBoxService, MusicTag, SpotifyItem, Tag } from '../services/leo-box.service';

@Component({
  selector: 'ui-main.page',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit, OnDestroy {
  public currentTag?: Tag;
  public musicTags: MusicTag[] = []
  public spotifyResults: SpotifyItem[] = []
  public sonosResults: SpotifyItem[] = []

  private currentTagSubscription?: Subscription;
  private musicTagsSubscription?: Subscription;

  constructor(
    private readonly leoBoxService: LeoBoxService) {
  }

  public ngOnInit(): void {
    this.subscribeCurrentTag();
    this.subscribeMusicTags();
  }

  ngOnDestroy(): void {
      this.currentTagSubscription?.unsubscribe();
      this.musicTagsSubscription?.unsubscribe();
  }

  public async subscribeCurrentTag(): Promise<Subscription> {
    return this.leoBoxService.watchQueryCurrentTag().subscribe((response) => {
      this.currentTag = response.data.currentTag;
    });
  }

  public async subscribeMusicTags(): Promise<Subscription> {
    return this.leoBoxService.queryMusicTags().subscribe((response) => {
      this.musicTags = response.data.musicTags;
    });
  }

  public async authenticateSpotify() {
    const result = await lastValueFrom(this.leoBoxService.querySpotifyAuthentication());
    window.location.href = result.data.spotifyAuth.url;
  }

  public async searchSpotify(query: string) {
    const result = await lastValueFrom(this.leoBoxService.querySpotify(query, 'album'));
    this.spotifyResults = result.data.spotifySearch;
  }

  public async authenticateSonos() {
    const result = await lastValueFrom(this.leoBoxService.querySonosAuthentication());
    window.location.href = result.data.sonosAuth.url;
  }

  public async searchSonos(query: string) {
    const result = await lastValueFrom(this.leoBoxService.querySonos(query, 'album'));
    // this.spotifyResults = result.data.search;
  }

  public async connect(item: SpotifyItem) {
    if (!this.currentTag?.uid) {
      return;
    }

    await lastValueFrom(this.leoBoxService.upsertMusicTag(this.currentTag.uid, item.name,
      item.type, item.uri, item.imageUrl));
  }
  
  public async deleteMusicTag(musicTag: MusicTag) {
    await lastValueFrom(this.leoBoxService.deleteMusicTag(musicTag.uid));
  }
};
