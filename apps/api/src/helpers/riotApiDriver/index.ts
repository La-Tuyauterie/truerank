import { QueueNames, Region } from '@truerank/shared/types';
import { QueueFilter } from '@truerank/shared/routes';

import { CacheAdapter } from '../cache/cacheAdapter';
import { lruCacheAdapterSingleton } from '../cache/lruCacheAdapter';

import {
  RiotChampionMastery,
  RiotMatch,
  RiotSummonerAccount,
  RiotSummonerLeagueEntry,
  RiotSummonerProfile,
} from './types';
import { RiotQueues } from './mappedTypes';

const RiotTokenHeaderName = 'X-Riot-Token';
const riotRegionBaseUrlMap: Record<Region, string> = {
  BR: 'https://br.api.riotgames.com',
  EUNE: 'https://eune.api.riotgames.com',
  EUW: 'https://euw1.api.riotgames.com',
  HK: 'https://hk.api.riotgames.com',
  ID: 'https://id.api.riotgames.com',
  JP: 'https://jp.api.riotgames.com',
  KR: 'https://kr.api.riotgames.com',
  LAN: 'https://lan.api.riotgames.com',
  LAS: 'https://las.api.riotgames.com',
  MO: 'https://mo.api.riotgames.com',
  MY: 'https://my.api.riotgames.com',
  NA: 'https://na.api.riotgames.com',
  OCE: 'https://oce.api.riotgames.com',
  PBE: 'https://pbe.api.riotgames.com',
  PH: 'https://ph.api.riotgames.com',
  RU: 'https://ru.api.riotgames.com',
  SEA: 'https://sea.api.riotgames.com',
  SG: 'https://sg.api.riotgames.com',
  TH: 'https://th.api.riotgames.com',
  TR: 'https://tr.api.riotgames.com',
  TW: 'https://tw.api.riotgames.com',
  VN: 'https://vn.api.riotgames.com',
} as const;

const riotGlobalBaseUrlMap: Record<Region, string> = {
  BR: 'https://americas.api.riotgames.com',
  EUNE: 'https://europe.api.riotgames.com',
  EUW: 'https://europe.api.riotgames.com',
  HK: 'https://asia.api.riotgames.com',
  ID: 'https://asia.api.riotgames.com',
  JP: 'https://asia.api.riotgames.com',
  KR: 'https://asia.api.riotgames.com',
  LAN: 'https://americas.api.riotgames.com',
  LAS: 'https://americas.api.riotgames.com',
  MO: 'https://asia.api.riotgames.com',
  MY: 'https://asia.api.riotgames.com',
  NA: 'https://americas.api.riotgames.com',
  OCE: 'https://sea.api.riotgames.com', // alternate SEA region
  PBE: 'https://americas.api.riotgames.com', // usually same as NA
  PH: 'https://asia.api.riotgames.com',
  RU: 'https://europe.api.riotgames.com',
  SEA: 'https://sea.api.riotgames.com',
  SG: 'https://asia.api.riotgames.com',
  TH: 'https://asia.api.riotgames.com',
  TR: 'https://europe.api.riotgames.com',
  TW: 'https://asia.api.riotgames.com',
  VN: 'https://asia.api.riotgames.com',
} as const;

type RegionBaseURL = (typeof riotRegionBaseUrlMap)[Region];
type GlobalBaseURL = (typeof riotGlobalBaseUrlMap)[Region];

export class RiotApiDriver {
  private globalBaseUrl: GlobalBaseURL;
  private regionBaseUrl: RegionBaseURL;
  private cacheAdapter: CacheAdapter;

  constructor(
    private readonly apiKey: string,
    private readonly region: Region
  ) {
    this.globalBaseUrl = riotGlobalBaseUrlMap[this.region]
    this.regionBaseUrl = riotRegionBaseUrlMap[this.region];
    this.cacheAdapter = lruCacheAdapterSingleton; // change this to use a different cache
  }

  private async get<T>(
    url: string,
    params?: Record<string, string | number | number[]>,
    invalidateCache = false,
  ): Promise<{ data: T, fromCache: boolean }> {
    const urlBuilder = new URL(url);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => {
            urlBuilder.searchParams.append(key, String(v));
          });
        } else {
          urlBuilder.searchParams.append(key, String(value));
        }
      });
    }

    const fullUrl = urlBuilder.toString();

    if (!invalidateCache) {
      const cachedResult = this.cacheAdapter.get<T>(fullUrl);
      if (cachedResult) {
        console.log(`Cache hit on ${fullUrl}`)
        return { data: cachedResult, fromCache: true };
      }
    } else {
      console.log(`Cache invalidated on ${fullUrl}`)
    }

    const res = await fetch(fullUrl, {
      headers: {
        [RiotTokenHeaderName]: this.apiKey,
      },
    });

    if (!res.ok) {
      const error = await res.text().catch(() => '');
      throw new Error(
        `[Riot API] ${res.status} ${res.statusText}: ${error || 'No body'}`
      );
    }

    const data = await res.json();
    this.cacheAdapter.set(fullUrl, data);
    return { data, fromCache: false };
  }

  public async getSummonerByName(
    name: string,
    tag: string,
  ): Promise<RiotSummonerAccount> {
    const result = await this.get<RiotSummonerAccount>(
      `${this.globalBaseUrl}/riot/account/v1/accounts/by-riot-id/${name}/${tag}`,
    );
    return result.data;
  }

  public async getSummonerProfile(
    puuid: string,
    invalidateCache?: boolean,
  ): Promise<RiotSummonerProfile> {
    const result = await this.get<RiotSummonerProfile>(
      `${this.regionBaseUrl}/lol/summoner/v4/summoners/by-puuid/${puuid}`,
      {},
      invalidateCache
    );
    return result.data;
  }

  public async getSummonerRankInfo(
    puuid: string,
    invalidateCache?: boolean,
  ): Promise<RiotSummonerLeagueEntry[]> {
    const result = await this.get<RiotSummonerLeagueEntry[]>(
      `${this.regionBaseUrl}/lol/league/v4/entries/by-puuid/${puuid}`,
      {},
      invalidateCache,
    );
    return result.data;
  }

  public async getChampionMasteries(
    puuid: string,
    invalidateCache?: boolean,
  ): Promise<RiotChampionMastery[]> {
    const result = await this.get<RiotChampionMastery[]>(
      `${this.regionBaseUrl}/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}`,
      {},
      invalidateCache,
    );
    return result.data;
  }

  public async getMatchIdsByPuuid(
    puuid: string,
    params: {
      filter: QueueFilter,
      page: number;
      pageSize: number;
      invalidateCache?: boolean;
    }
  ): Promise<string[]> {
    const filterToQueueIds: Record<QueueFilter, number[]> = {
      "all": [],
      "ranked-solo": [RiotQueues[QueueNames.RANKED_SOLODUO]],
      "ranked-flex": [RiotQueues[QueueNames.RANKED_FLEX]],
      "normal-draft": [RiotQueues[QueueNames.NORMAL_DRAFT]],
      "swiftplay": [RiotQueues[QueueNames.SWIFTPLAY]],
      "aram": [RiotQueues[QueueNames.ARAM]],
      "normal-blind": [RiotQueues[QueueNames.NORMAL_BLIND]],
    };

    const start = (params.page - 1) * params.pageSize;
    const queue = filterToQueueIds[params.filter];
    const result = await this.get<string[]>(
      `${this.globalBaseUrl}/lol/match/v5/matches/by-puuid/${puuid}/ids`,
      {
        queue,
        start,
        count: params.pageSize,
      },
      params.invalidateCache
    );
    return result.data;
  }

  public getMatchById(matchId: string): Promise<{ data: RiotMatch, fromCache: boolean }> {
    return this.get<RiotMatch>(
      `${this.globalBaseUrl}/lol/match/v5/matches/${matchId}`
    );
  }

  public getMatchesByIds(matchIds: string[]): Promise<{ data: RiotMatch, fromCache: boolean }[]> {
    return Promise.all(matchIds.map((matchId) => this.getMatchById(matchId)));
  }
}
