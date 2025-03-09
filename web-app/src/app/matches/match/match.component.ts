import {Component, input} from '@angular/core';
import {Match} from '../shared/match.service';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'match',
  imports: [CardModule],
  template: `
    <p-card>
      <ng-template #header>
        <div class="header-container">
          <p class="header-item">
            <strong>Your Team:</strong> {{ match()?.isWinner ? 'Won' : 'Lost' }}
          </p>
          <p class="header-item">
            <strong>Game Mode:</strong> {{ match()?.details?.metadata?.gameMode }}
          </p>
          <p class="header-item">
              <strong>Duration:</strong> {{ match()?.details?.metadata?.gameDuration }} seconds<br>
          </p>
        </div>
      </ng-template>
      <p class="m-0" [style.background-color]="match()?.isWinner ? 'blue' : 'red'">
        <strong>Winner:</strong> {{ match()?.details?.winner }}<br>
      </p>
    </p-card>
  `,
  styleUrl: 'match.component.css'
})
export class MatchComponent {
  match = input<Match>();
}
