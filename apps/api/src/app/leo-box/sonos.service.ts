import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from "@nestjs/common";
import QueryString from "qs";
import { lastValueFrom } from 'rxjs';
import { ConfigurationService } from './configuration.service';

export interface MusicObjectId {
    serviceId?: string;
    objectId: string;
    accountId?: string;
}
export interface PlayModes {
    repeat?: boolean;
    repeatOne?: boolean;
    shuffle?: boolean;
    crossfade?: boolean;
}
export interface Service {
    name: string;
    id?: string;
    imageUrl?: string;
}
export interface Container {
    name: string;
    type?: string;
    id?: MusicObjectId;
    service?: Service;
    imageUrl?: string;
    tags?: string[];
}
export interface Artist {
    name: string;
    imageUrl?: string;
    id?: MusicObjectId;
    tags?: string[];
}
export interface Album {
    name: string;
    artist?: Artist;
    imageUrl?: string;
    id?: MusicObjectId;
    tags?: string[];
}
export interface Track {
    canCrossfade?: boolean;
    canSkip?: boolean;
    durationMillis?: number;
    id?: MusicObjectId;
    imageUrl?: string;
    name?: string;
    replayGain?: number;
    tags?: string[];
    type?: string;
    service?: Service;
    mediaUrl?: string;
    contentType?: string;
    trackNumber?: number;
    artist?: Artist;
    album?: Album;
}
export interface Policies {
    canCrossfade: boolean;
    canResume: boolean;
    canSeek: boolean;
    canSkip: boolean;
    canSkipBack: boolean;
    canSkipToItem: boolean;
    isVisible: boolean;
}
export interface Item {
    id?: string;
    track: Track;
    deleted?: boolean;
    policies?: Policies;
}

export interface PlaybackMetadataStatus {
    container: Container;
    currentItem: Item;
    nextItem: Item;
    streamInfo?: string;
}

export declare type PlaybackState = "PLAYBACK_STATE_BUFFERING" | "PLAYBACK_STATE_IDLE" | "PLAYBACK_STATE_PAUSED" | "PLAYBACK_STATE_PLAYING";

export interface PlaybackActions {
    canSkip: boolean;
    canSkipBack: boolean;
    canSeek: boolean;
    canPause: boolean;
    canStop: boolean;
    canRepeat: boolean;
    canRepeatOne: boolean;
    canCrossfade: boolean;
    canShuffle: boolean;
}

export interface PlaybackStatus {
    availablePlaybackActions: PlaybackActions;
    itemId: string;
    isDucking: boolean;
    playbackState: PlaybackState;
    playModes: PlayModes;
    positionMillis: number;
    previousItemId: string;
    previousPositionMillis: string;
    queueVersion: string;
}

export interface PlayerVolume {
    fixed: boolean;
    muted: boolean;
    volume: number;
}

export interface Group {
    coordinatorId: string;
    id: string;
    playbackState: string;
    playerIds: string[];
    name: string;
}

export declare type Capability = "PLAYBACK" | "CLOUD" | "HT_PLAYBACK" | "HT_POWER_STATE" | "AIRPLAY" | "LINE_IN" | "AUDIO_CLIP" | "VOICE" | "SPEAKER_DETECTION" | "FIXED_VOLUME";

export interface Player {
    apiVersion: string;
    deviceIds: string[];
    icon: string;
    id: string;
    minApiVersion: string;
    name: string;
    softwareVersion: string;
    webSocketUrl: string;
    capabilities: Capability[];
}

export interface Groups {
    groups: Group[];
    players: Player[];
}

export interface GroupInfo {
    group: Group;
}

export interface Household {
    id: string;
}

export interface HouseholdsList {
    households: Household[];
}

export interface MusicServiceAccount {
    userIdHashCode: string;
    nickname: string;
    id: string;
    isGuest: boolean;
    service: Service;
}



export interface TokenResponse {
    access_token: string;
    token_type: string;
    refresh_token: string;
    expires_in: number;
    scope: string;
}

const DEFAULT_GROUP_ID = "RINCON_B8E9373F7A0001400:1817712545";
const SONOS_AUTH_CODE = "SONOS_AUTH_CODE";
const SONOS_ACCESS_TOKEN = "SONOS_ACCESS_TOKEN";
const SONOS_REFRESH_TOKEN = "SONOS_REFRESH_TOKEN";

@Injectable()
export class SonosService {
    private readonly logger = new Logger(SonosService.name);

    private clientId = process.env.SONOS_CLIENT_ID;
    private clientSecret = process.env.SONOS_CLIENT_SECRET;
    private redirectUri = 'http://localhost:8080/sonos/callback/';
    private state = '8943jfi3io4';
    private scope = 'playback-control-all';

    constructor(
        private readonly configuration: ConfigurationService, 
        private readonly http: HttpService
    ) {
    }

    public async authenticateOAuth(): Promise<string> {
        return 'https://api.sonos.com/login/v3/oauth?' +
            QueryString.stringify({
                response_type: 'code',
                client_id: this.clientId,
                scope: this.scope,
                redirect_uri: this.redirectUri,
                state: this.state
            })
    }

    public async authenticateCallback(code: string, state: string): Promise<string> {
        if (state === this.state) {
            await this.configuration.set(SONOS_AUTH_CODE, code);
            await this.getAccessToken();
            return "DONE";
        }
        return "FAILED";
    }

    public async getAccessToken(): Promise<void> {
        const code = await this.configuration.get(SONOS_AUTH_CODE);
        const queryString = QueryString.stringify({
            grant_type: "authorization_code",
            redirect_uri: this.redirectUri,
            code,
        })
        const response = await lastValueFrom(this.http.post('https://api.sonos.com/login/v3/oauth/access', queryString, {
            headers: {
                'Authorization': 'Basic ' + (Buffer.from(this.clientId + ':' + this.clientSecret).toString('base64')),
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json',
            }
        }));

        if (response.status === 200) {
            this.configuration.set(SONOS_ACCESS_TOKEN, response.data.access_token);
            this.configuration.set(SONOS_REFRESH_TOKEN, response.data.refresh_token);
        } else {
            this.logger.error(response);
        }
    }

    public async refreshToken(): Promise<void> {
        const refreshToken = await this.configuration.get(SONOS_REFRESH_TOKEN);
        const queryString = QueryString.stringify({
            grant_type: "refresh_token",
            refresh_token: refreshToken,
        })
        const response = await lastValueFrom(this.http.post('https://api.sonos.com/login/v3/oauth/access', queryString, {
            headers: {
                'Authorization': 'Basic ' + (Buffer.from(this.clientId + ':' + this.clientSecret).toString('base64')),
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json',
            }
        }));

        if (response.status === 200) {
            this.configuration.set(SONOS_ACCESS_TOKEN, response.data.access_token);
            this.configuration.set(SONOS_REFRESH_TOKEN, response.data.refresh_token);
        } else {
            this.logger.error(response);
        }
    }
    
    public async getHouseholds(): Promise<HouseholdsList> {
        return await this.sonosGet(`/households`);
    }

    public async getGroups(householdId: string): Promise<Groups> {
        return await this.sonosGet(`/households/${householdId}/groups`);
    }

    public async getPlaybackState(groupId: string): Promise<PlaybackStatus> {
        return await this.sonosGet(`/groups/${groupId}/playback`);
    }

    public async getPlaybackMetadata(groupId: string): Promise<PlaybackMetadataStatus> {
        return await this.sonosGet(`/groups/${groupId}/playbackMetadata`);
    }

    public async play(groupId: string) {
        try {
            const accessToken = await this.configuration.get(SONOS_ACCESS_TOKEN);
            const response = await lastValueFrom(this.http.post<any>(`https://api.ws.sonos.com/control/api/v1/groups/${groupId}/playback:1/play`, {
                headers: {
                    'Authorization': 'Bearer ' + accessToken,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                }
            }));
            this.logger.log(response);
            return response.data;
        } catch (error) {
            this.logger.log(error);
            this.logger.log(error.response.data.fault);
        }
    }

    private async sonosGet<T>(path: string): Promise<T> {
        try {
            const accessToken = await this.configuration.get(SONOS_ACCESS_TOKEN);
            const response = await lastValueFrom(this.http.get<T>('https://api.ws.sonos.com/control/api/v1/' + path, {
                headers: {
                    'Authorization': 'Bearer ' + accessToken,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                }
            }));
            return response.data;
        } catch (error) {
            this.logger.log(error);
            throw error;
        }
    }
}