import { WebsiteFetcher } from "./website";
import { BaseFetcher } from "./base";

export const defaultFetchers: Record<string, BaseFetcher> = {
  website: new WebsiteFetcher(),
};

export { BaseFetcher };
