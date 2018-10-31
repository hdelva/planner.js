import { injectable } from "inversify";
import IPath from "../../interfaces/IPath";
import IResolvedQuery from "../../query-runner/IResolvedQuery";
import IPublicTransportPlanner from "./IPublicTransportPlanner";

@injectable()
export default class PublicTransportPlannerEAT implements IPublicTransportPlanner {
  public plan: (query: IResolvedQuery) => Promise<IPath[]>;

}
