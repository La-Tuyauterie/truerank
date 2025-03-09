import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

export type Match = {
  isWinner: boolean
  details: MatchDetails
}

export type MatchDetails = {
  metadata: MatchMetadata
  redTeam: MatchTeamDetails
  blueTeam: MatchTeamDetails
  winner: string
}

export type MatchMetadata = {
  gameDuration: number
  gameMode: string
  queue: string
  gameId: string
  gameStartTime: number
}

export type MatchTeamDetails = {
  participants: MatchParticipant
  isWinner: boolean
}

export type MatchParticipant = {
  championId: number
  championName: string
  championLevel: number
  kills: number
  deaths: number
  assists: number
  totalMinionsKilled: number
  won: boolean
}

type Region = 'EUW' | 'KR'

@Injectable({
  providedIn: 'root',
})
export class MatchService {
  constructor(private readonly httpClient: HttpClient) {
  }

  getMatches(username: string, tag: string, region: Region): Observable<Match[]> {
    return this.httpClient.get<Match[]>('/api/matches', {
      params: {
        username,
        tag,
        region,
      }
    })
  }
}
