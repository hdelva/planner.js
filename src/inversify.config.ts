import { Container } from "inversify";
import Context from "./Context";
import IConnectionsFetcher from "./fetcher/connections/IConnectionsFetcher";
import ConnectionsFetcherLDFetch from "./fetcher/connections/ld-fetch/ConnectionsFetcherLDFetch";
import IStopsFetcher from "./fetcher/stops/IStopsFetcher";
import StopsFetcherNMBSJSON from "./fetcher/stops/StopsFetcherNMBSJSON";
import StopsFetcherNMBSLDFetch from "./fetcher/stops/StopsFetcherNMBSLDFetch";
import IPublicTransportPlanner from "./planner/public-transport/IPublicTransportPlanner";
import PublicTransportPlannerCSAProfile from "./planner/public-transport/PublicTransportPlannerCSAProfile";
import IRoadPlanner from "./planner/road/IRoadPlanner";
import RoadPlannerBirdsEye from "./planner/road/RoadPlannerBirdsEye";
import IQueryRunner from "./query-runner/IQueryRunner";
import QueryRunnerDefault from "./query-runner/QueryRunnerDefault";
import TYPES from "./types";
import ILocationResolver from "./query-runner/ILocationResolver";
import LocationResolverDefault from "./query-runner/LocationResolverDefault";

const container = new Container();
container.bind<Context>(TYPES.Context).to(Context).inSingletonScope();
container.bind<IQueryRunner>(TYPES.QueryRunner).to(QueryRunnerDefault);
container.bind<ILocationResolver>(TYPES.LocationResolver).to(LocationResolverDefault);
container.bind<IPublicTransportPlanner>(TYPES.PublicTransportPlanner).to(PublicTransportPlannerCSAProfile);
container.bind<IRoadPlanner>(TYPES.RoadPlanner).to(RoadPlannerBirdsEye);
container.bind<IConnectionsFetcher>(TYPES.ConnectionsFetcher).to(ConnectionsFetcherLDFetch);
container.bind<IStopsFetcher>(TYPES.StopsFetcher).to(StopsFetcherNMBSLDFetch);

export default container;
