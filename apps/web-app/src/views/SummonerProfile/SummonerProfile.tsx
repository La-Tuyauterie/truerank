import clsx from 'clsx';

import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchProfile } from '../../api/profile';

import styles from './SummonerProfile.module.css';
import sharedStyles from '../../styles/shared.module.css';

import { SummonerProfileProvider } from './SummonerProfileContext';

import { ProfileHeader } from '../../components/SummonerProfile/ProfileHeader/ProfileHeader';
import { ProfileMatches } from '../../components/SummonerProfile/ProfileMatches/ProfileMatches';
import { ProfileSidebar } from '../../components/SummonerProfile/ProfileSidebar/ProfileSidebar';

import { fetchMatches } from '../../api/matches';

export function SummonerProfile() {
  const queryClient = useQueryClient();

  const { name, tag } = useParams<{ name: string, tag: string }>();
  const player = { name, tag };

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', name, tag],
    queryFn: () => fetchProfile(name!, tag!, ),
    enabled: !!name && !!tag,
    retry: false,
  });

  function handleUpdate() {
    queryClient.fetchQuery({
      queryKey: ['profile', name, tag],
      queryFn: () => fetchProfile(name!, tag!, true),
    });

    queryClient.fetchQuery({
      queryKey: ['matches', name, tag],
      queryFn: () => fetchMatches(name!, tag!, true),
    });
  }

  return (
    <SummonerProfileProvider puuid={profile?.puuid}>
      <div className={styles.profileHeaderWrap}>
        <ProfileHeader
          isProfileLoading={isLoading}
          profile={profile}
          handleUpdate={handleUpdate}
        />
      </div>
      <div className={clsx(styles.summonerProfile, sharedStyles.view)}>
        <div className={styles.profileSidebarWrap}>
          <ProfileSidebar
            // isProfileLoading={isLoading}
            // player={player}
          />
        </div>

        <div className={styles.profileMatchesWrap}>
          <ProfileMatches
            isProfileLoading={isLoading}
            player={player}
          />
        </div>
      </div>
    </SummonerProfileProvider>
  );
}
