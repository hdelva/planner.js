import IStop from "./IStop";

/**
 * Acts as transparent proxy to [[IStopsFetcher]] instances by choosing
 * the right [[IStopsFetcher]] to pass the request to
 * @method getStopById Returns the [[IStop]] for the given stopId
 * @method getAllStops Returns concatenated array of [[IStop]]s from all [[IStopsFetcher]]s it mediates
 */
export default interface IStopsProvider {
  prefetchStops: () => void;
  getStopById: (stopId: string) => Promise<IStop>;
  getAllStops: () => Promise<IStop[]>;
}
