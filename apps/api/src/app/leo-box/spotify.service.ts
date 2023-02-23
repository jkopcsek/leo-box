import { HttpService } from '@nestjs/axios';
import { Injectable } from "@nestjs/common";
import QueryString from "qs";
import { lastValueFrom } from 'rxjs';

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

// Stille Post spotify:album:4HycxiVO7arQfm5BVR6om4
const DEFAULT_DEVICE_ID = "c07a5abebbd49dc66951738d636c9551dca92463"; // Mac Book

@Injectable()
export class SpotifyService {
    private clientId = process.env.SPOTIFY_CLIENT_ID;
    private clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    private code?: string;
    private accessToken?: string;
    private redirectUri = 'http://localhost:8080/spotify-auth/callback/';
    private state = '8943jfi3io4';
    private scope = 'user-read-playback-state user-modify-playback-state user-read-currently-playing';

    constructor(private readonly http: HttpService) {
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
            this.code = code;
            await this.getToken();
            return "DONE";
        }
        return "FAILED";
    }

    public async getToken(): Promise<void> {
        const queryString = QueryString.stringify({
            grant_type: "authorization_code",
            redirect_uri: this.redirectUri,
            code: this.code,
        })
        const response = await lastValueFrom(this.http.post('https://accounts.spotify.com/api/token', queryString, {
            headers: {
                'Authorization': 'Basic ' + (Buffer.from(this.clientId + ':' + this.clientSecret).toString('base64')),
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json',
            }
        }));

        if (response.status === 200) {
            // use the access token to access the Spotify Web API
            this.accessToken = response.data.access_token;
            console.log("Now using access_token: " + this.accessToken);
        } else {
            console.error(response);
        }
    }

    public async getCurrentlyPlaying(): Promise<CurrentlyPlayingResponse> {
        const result = await lastValueFrom(this.http.get<CurrentlyPlayingResponse>('https://api.spotify.com/v1/me/player/currently-playing', {
            headers: {
                'Authorization': 'Bearer ' + this.accessToken,
                'Content-Type': 'application/json',
                Accept: 'application/json'
            }
        }));
        console.log(result);
        return result.data;
    }

    public async getQueue(): Promise<any> {
        const result = await lastValueFrom(this.http.get('https://api.spotify.com/v1/me/player/queue', {
            headers: {
                'Authorization': 'Bearer ' + this.accessToken,
                'Content-Type': 'application/json',
                Accept: 'application/json'
            }
        }));
        console.log(result);
        return result;
    }

    public async play(contextUri?: string, offsetUri?: string, positionMs?: number, deviceId?: string): Promise<void> {
        console.log("Calling with access_token: " + this.accessToken);
        try {
            const result = await lastValueFrom(this.http.put('https://api.spotify.com/v1/me/player/play', {
                context_uri: contextUri,
                offset: offsetUri ? { uri: offsetUri } : undefined,
                position_ms: positionMs
            }, {
                headers: {
                    'Authorization': 'Bearer ' + this.accessToken,
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
        const result = await lastValueFrom(this.http.put('https://api.spotify.com/v1/me/player/pause', {}, {
            headers: {
                'Authorization': 'Bearer ' + this.accessToken,
                'Content-Type': 'application/json',
                Accept: 'application/json'
            }
        }));
        console.log(result);
    }

    public async getDevices(): Promise<any> {
        const result = await lastValueFrom(this.http.get('https://api.spotify.com/v1/me/player/devices', {
            headers: {
                'Authorization': 'Bearer ' + this.accessToken,
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
        }));
        console.log(result);
        return result.data;
    }

    public async search(q: string, type: string): Promise<SearchResponse> {
        const result = await lastValueFrom(this.http.get('https://api.spotify.com/v1/search', {
            headers: {
                'Authorization': 'Bearer ' + this.accessToken,
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            params: {
                q, type
            }
        }));
        return result.data;
    }
}