import {Component} from '@angular/core';
import {Match, MatchService} from '../shared/match.service';
import {MatchComponent} from '../match/match.component';

@Component({
  selector: 'match-list',
  imports: [MatchComponent],
  template: `
    @for (match of matches; track match.details.metadata.gameId) {
      <match [match]="match"></match>
    }
  `,
})
export class MatchListComponent {
  matches: Match[] = [
    {
      isWinner: true,
      details: {
        metadata: {
          gameDuration: 1823,
          gameMode: 'CLASSIC',
          queue: 'RANKED_SOLO_5x5',
          gameId: '1234567890',
          gameStartTime: 1699017600000,
        },
        redTeam: {
          participants: {
            championId: 23,
            championName: 'Jinx',
            championLevel: 18,
            kills: 10,
            deaths: 5,
            assists: 15,
            totalMinionsKilled: 200,
            won: true,
          },
          isWinner: true,
        },
        blueTeam: {
          participants: {
            championId: 67,
            championName: 'Vayne',
            championLevel: 16,
            kills: 8,
            deaths: 10,
            assists: 12,
            totalMinionsKilled: 180,
            won: false,
          },
          isWinner: false,
        },
        winner: 'red',
      },
    },
    {
      isWinner: false,
      details: {
        metadata: {
          gameDuration: 2145,
          gameMode: 'CLASSIC',
          queue: 'RANKED_SOLO_5x5',
          gameId: '0987654321',
          gameStartTime: 1699104000000,
        },
        redTeam: {
          participants: {
            championId: 103,
            championName: 'Ahri',
            championLevel: 15,
            kills: 7,
            deaths: 9,
            assists: 14,
            totalMinionsKilled: 170,
            won: false,
          },
          isWinner: false,
        },
        blueTeam: {
          participants: {
            championId: 110,
            championName: 'Varus',
            championLevel: 18,
            kills: 12,
            deaths: 6,
            assists: 18,
            totalMinionsKilled: 220,
            won: true,
          },
          isWinner: true,
        },
        winner: 'blue',
      },
    },
  ];

  constructor(private readonly matchService: MatchService) {}

  ngOnInit(): void {
    this.matchService.getMatches('Unitedwar', 'EUW', 'EUW').subscribe(matches => this.matches = matches)
  }
}
