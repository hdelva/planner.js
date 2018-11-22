import { inject, injectable } from "inversify";
import IStop from "../../fetcher/stops/IStop";
import IStopsFetcherMediator from "../../fetcher/stops/IStopsFetcherMediator";
import ILocation from "../../interfaces/ILocation";
import IPath from "../../interfaces/IPath";
import { DurationMs, SpeedkmH } from "../../interfaces/units";
import IResolvedQuery from "../../query-runner/IResolvedQuery";
import TYPES from "../../types";
import IRoadPlanner from "../road/IRoadPlanner";
import IReachableStopsFinder, { IReachableStop } from "./IReachableStopsFinder";
import ReachableStopsFinderMode from "./ReachableStopsFinderMode";

@injectable()
export default class ReachableStopsFinderRoadPlanner implements IReachableStopsFinder {
  private readonly stopsFetcherMediator: IStopsFetcherMediator;
  private readonly roadPlanner: IRoadPlanner;

  constructor(
    @inject(TYPES.StopsFetcherMediator) stopsFetcherMediator: IStopsFetcherMediator,
    @inject(TYPES.RoadPlanner) roadPlanner: IRoadPlanner,
  ) {
    this.stopsFetcherMediator = stopsFetcherMediator;
    this.roadPlanner = roadPlanner;
  }

  public async findReachableStops(
    sourceOrTargetStop: IStop,
    mode: ReachableStopsFinderMode,
    maximumDuration: DurationMs,
    minimumSpeed: SpeedkmH,
  ): Promise<IReachableStop[]> {

    const minimumDepartureTime = new Date();
    const maximumArrivalTime = new Date(minimumDepartureTime.getTime() + maximumDuration);

    const baseProp = mode === ReachableStopsFinderMode.Target ? "to" : "from";
    const otherProp = mode === ReachableStopsFinderMode.Target ? "from" : "to";

    const baseQuery: IResolvedQuery = {
      [baseProp]: [sourceOrTargetStop as ILocation],
      minimumDepartureTime,
      maximumArrivalTime,
      minimumWalkingSpeed: minimumSpeed,
    };

    const allStops = await this.stopsFetcherMediator.getAllStops();
    const reachableStops: IReachableStop[] = [{stop: sourceOrTargetStop, duration: 0}];

    await Promise.all(allStops.map(async (possibleTarget: IStop) => {
      if (possibleTarget.id !== sourceOrTargetStop.id) {

        const query = Object.assign({}, baseQuery, {
          [otherProp]: [possibleTarget as ILocation],
        });

        const paths: IPath[] = await this.roadPlanner.plan(query);

        if (paths.length) {

          // tslint:disable-next-line:no-shadowed-variable
          const shortestDuration = paths.reduce((shortestDuration: DurationMs, path: IPath) => {
            // Minimum speed is passed so sum max duration over all steps
            const duration = path.steps
              .reduce((totalDuration: DurationMs, step) => totalDuration + step.duration.maximum, 0);

            if (duration < shortestDuration) {
              return duration;
            }

            return shortestDuration;
          }, Number.POSITIVE_INFINITY);

          if (shortestDuration < maximumDuration) {
            reachableStops.push({stop: possibleTarget, duration: shortestDuration});
          }
        }
      }

    }));

    return reachableStops;
  }
}