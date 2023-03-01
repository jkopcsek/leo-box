import { HttpService } from '@nestjs/axios';
import { Injectable } from "@nestjs/common";
import QueryString from "qs";
import { lastValueFrom } from 'rxjs';
import { ConfigurationService } from './configuration.service';

export interface ImageResponse {
    url: string;
    height: number;
    width: number;
}

export interface AlbumResponse {
    id: string;
    uri: string;
    name: string;
    type: string;

    images?: ImageResponse[];
}

export interface TrackResponse {
    id: string;
    uri: string;
    name: string;
    type: string;

    album: AlbumResponse;
}

export interface PlaylistResponse {
    id: string;
    uri: string;
    name: string;
    type: string;

    images?: ImageResponse[];
}

export interface AudioBookResponse {
    id: string;
    uri: string;
    name: string;
    type: string;

    images?: ImageResponse[];
}

export interface CurrentlyPlayingResponse {
    context: { uri: string },
    progress_ms: number
    item: TrackResponse
}

export interface ListResponse<T> {
    href: string;
    limit: number;
    offset: number;
    total: number;
    next: string;
    previous: string;
    items: T[];
}

export interface SearchResponse {
    tracks?: {
        items: TrackResponse[],
    },
    albums?: {
        items: AlbumResponse[],
    }
    playlists?: {
        items: PlaylistResponse[],
    }
    audiobooks?: {
        items: AudioBookResponse[],
    }
}

const DEFAULT_DEVICE_ID = "748e788ecc4b8ea4dc44e4f34be4a4cd4d50fe89"; // Raspotify
const SPOTIFY_AUTH_CODE = 'SPOTIFY_AUTH_CODE';
const SPOTIFY_ACCESS_TOKEN = 'SPOTIFY_ACCESS_TOKEN';
const SPOTIFY_REFRESH_TOKEN = 'SPOTIFY_REFRESH_TOKEN';

@Injectable()
export class SpotifyService {
    private clientId = process.env.SPOTIFY_CLIENT_ID;
    private clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    private redirectUri = process.env.SPOTIFY_AUTH_REDIRECT_URL;
    private publicUrl = process.env.PUBLIC_URL;
    private state = '8943jfi3io4';
    private scope = 'user-read-playback-state user-modify-playback-state user-read-currently-playing';

    constructor(
        private readonly configuration: ConfigurationService, 
        private readonly http: HttpService) {
    }

    public async authenticateOAuth(): Promise<string> {
        return 'https://accounts.spotify.com/authorize?' +
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
            await this.configuration.set(SPOTIFY_AUTH_CODE, code);
            await this.getAccessToken();
            return this.publicUrl + "?spotify-auth=success";
        }
        return this.publicUrl + "?spotify-auth=failed";
    }

    public async getAccessToken(): Promise<void> {
        const code = await this.configuration.get(SPOTIFY_AUTH_CODE);
        const queryString = QueryString.stringify({
            grant_type: "authorization_code",
            redirect_uri: this.redirectUri,
            code,
        })
        const response = await lastValueFrom(this.http.post('https://accounts.spotify.com/api/token', queryString, {
            headers: {
                'Authorization': 'Basic ' + (Buffer.from(this.clientId + ':' + this.clientSecret).toString('base64')),
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json',
            }
        }));

        if (response.status === 200) {
            this.configuration.set(SPOTIFY_ACCESS_TOKEN, response.data.access_token);
            this.configuration.set(SPOTIFY_REFRESH_TOKEN, response.data.refresh_token);
        } else {
            console.error(response);
        }
    }

    public async refreshToken(): Promise<void> {
        const refreshToken = await this.configuration.get(SPOTIFY_REFRESH_TOKEN);
        const queryString = QueryString.stringify({
            grant_type: "refresh_token",
            refresh_token: refreshToken,
        })
        const response = await lastValueFrom(this.http.post('https://accounts.spotify.com/api/token', queryString, {
            headers: {
                'Authorization': 'Basic ' + (Buffer.from(this.clientId + ':' + this.clientSecret).toString('base64')),
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json',
            }
        }));

        if (response.status === 200) {
            this.configuration.set(SPOTIFY_ACCESS_TOKEN, response.data.access_token);
        } else {
            console.error(response);
        }
    }

    public async getCurrentlyPlaying(): Promise<CurrentlyPlayingResponse> {
        return this.get('/me/player/currently-playing');
    }

    public async getQueue(): Promise<any> {
        return this.get('/me/player/queue');
    }

    public async getTracks(albumId: string): Promise<TrackResponse[]> {
        return this.getAll<ListResponse<TrackResponse>, TrackResponse>(`/albums/${albumId}/tracks`);
    }

    public async play(contextUri?: string, offsetUri?: string, positionMs?: number, deviceId?: string): Promise<void> {
        const accessToken = await this.configuration.get(SPOTIFY_ACCESS_TOKEN);
        try {
            const result = await lastValueFrom(this.http.put('https://api.spotify.com/v1/me/player/play', {
                context_uri: contextUri,
                offset: offsetUri ? { uri: offsetUri } : undefined,
                position_ms: positionMs
            }, {
                headers: {
                    'Authorization': 'Bearer ' + accessToken,
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
                params: {
                    device_id: deviceId ?? DEFAULT_DEVICE_ID,
                }
            }));
            console.log(result);
        } catch (error) {
            console.error(error);
            console.error(error.response.data.error);
            throw error;
        }
    }

    public async pause(): Promise<void> {
        const accessToken = await this.configuration.get(SPOTIFY_ACCESS_TOKEN);
        const result = await lastValueFrom(this.http.put('https://api.spotify.com/v1/me/player/pause', {}, {
            headers: {
                'Authorization': 'Bearer ' + accessToken,
                'Content-Type': 'application/json',
                Accept: 'application/json'
            }
        }));
        console.log(result);
    }

    public async getDevices(): Promise<any> {
        return this.get('/me/player/devices');
    }

    public async search(q: string, type: string): Promise<SearchResponse> {
        return this.get('/search', {               q, type            });
    }

    private async getAll<T extends ListResponse<S>, S>(path: string, params?: Record<string, string>): Promise<S[]> {
        let result: S[] = [];
        let response: T = await this.get<T>(path, params);
        result = result.concat(response.items);

        while (response.next && response.items) {
            response = await this.get(response.next);
            result = result.concat(response.items);
        }

        return result;
    }

    private async get<T>(path: string, params?: Record<string, string>): Promise<T> {
        try {
            const accessToken = await this.configuration.get(SPOTIFY_ACCESS_TOKEN);
            const response = await lastValueFrom(this.http.get<T>(path, {
                baseURL: 'https://api.spotify.com/v1',
                headers: {
                    'Authorization': 'Bearer ' + accessToken,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                params,
            }));
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}