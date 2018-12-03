import "jest";
import LDFetch from "ldfetch";
import StopsFetcherLDFetch from "../../fetcher/stops/ld-fetch/StopsFetcherLDFetch";
import Units from "../../util/Units";
import RoadPlannerBirdsEye from "../road/RoadPlannerBirdsEye";
import ReachableStopsFinderMode from "./ReachableStopsFinderMode";
import ReachableStopsFinderRoadPlanner from "./ReachableStopsFinderRoadPlanner";

const ldFetch = new LDFetch({ headers: { Accept: "application/ld+json" } });

const stopsFetcher = new StopsFetcherLDFetch(ldFetch);
stopsFetcher.setPrefix("http://irail.be/stations/NMBS/");
stopsFetcher.setAccessUrl("https://irail.be/stations/NMBS");

const roadPlanner = new RoadPlannerBirdsEye();
const reachableStopsFinder = new ReachableStopsFinderRoadPlanner(stopsFetcher, roadPlanner);

test("[ReachableStopsFinderRoadPlanner] reachable stops", async () => {

  const sourceStop = await stopsFetcher.getStopById("http://irail.be/stations/NMBS/008896008");

  expect(sourceStop).toBeDefined();

  // Get reachable stops in 50 km (10h at 5km/h)
  const reachableStops = await reachableStopsFinder.findReachableStops(
    sourceStop,
    ReachableStopsFinderMode.Source,
    Units.fromHours(1),
    5,
  );

  expect(reachableStops.length).toBeGreaterThan(1);
});