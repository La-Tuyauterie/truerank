import { SharedTypes } from "@truerank/shared";

import { MatchListCardMetadata } from "./MatchListCardMetadata";
import { MatchListCardPlayerRecap } from "./MatchListCardPlayerRecap";
import { MatchListCardTeamOverview } from "./MatchListCardTeamOverview";

import styles from "./styles/MatchListCard.module.css";
import clsx from "clsx";

type Props = {
  summonerMatch: SharedTypes.SummonerMatchData;
};

export function MatchListCard({ summonerMatch }: Props) {

  const { match, summoner, isWinner } = summonerMatch;
  const { metadata, redTeam, blueTeam } = match;

  const allPlayers = [...redTeam, ...blueTeam];
  const summonerMatchData = allPlayers.find(player => player.summoner.puuid === summoner.puuid);
  if (!summonerMatchData) {
    return null;
  }

  return (
    <div className={clsx(
      styles.matchListCard,
      isWinner ? styles.winner : styles.loser
    )}>
      <MatchListCardMetadata
        metadata={metadata}
        isWinner={isWinner} />

      <MatchListCardPlayerRecap
        player={summonerMatchData}
        gameDuration={metadata.gameDuration} />

      <MatchListCardTeamOverview
        redTeam={redTeam}
        blueTeam={blueTeam} />
    </div>
  );
}
