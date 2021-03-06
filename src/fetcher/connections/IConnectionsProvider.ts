import { AsyncIterator } from "asynciterator";
import IConnection from "./IConnection";
import IConnectionsIteratorOptions from "./IConnectionsIteratorOptions";

/**
 * A IConnectionsProvider serves as interface to other classes that want to use [[IConnection]] instances
 * It does this by acting as a transparent proxy between the user class and the configured [[IConnectionFetcher]]
 * instances
 */
export default interface IConnectionsProvider {
  prefetchConnections: () => void;
  createIterator: () => AsyncIterator<IConnection>;
  setIteratorOptions: (options: IConnectionsIteratorOptions) => void;
}
