declare global {
  interface JimUser {
    twitchId: string;
    twitchLogin: string;
    twitchDisplay: string;
    twitchProfileImage: string | null;
    twitchCumulativeMonths: number | null;
    twitchSubExpiration: number | null;
    country: string | null;
    bio: string | null;
    badges: string[] | null;
    createdAt: number;
    updatedAt: number;
  }

  interface JimRiotAccount {
    puuid: string;
    twitchId: string;
    gameName: string;
    tagLine: string;
    region: string;
    tier: string | null;
    division: string | null;
    lp: number | null;
    wins: number | null;
    losses: number | null;
    profileIcon: number | null;
    verified: boolean;
    createdAt: number;
    updatedAt: number;
  }
}

export {};
