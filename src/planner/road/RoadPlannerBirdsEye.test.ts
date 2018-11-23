import "jest";
import LDFetch from "ldfetch";
import StopsFetcherLDFetch from "../../fetcher/stops/ld-fetch/StopsFetcherLDFetch";
import LocationResolverDefault from "../../query-runner/LocationResolverDefault";
import IRoadPlanner from "./IRoadPlanner";
import RoadPlannerBirdsEye from "./RoadPlannerBirdsEye";

const ldFetch = new LDFetch({ headers: { Accept: "application/ld+json" } });
const planner: IRoadPlanner = new RoadPlannerBirdsEye();

const stopsFetcher = new StopsFetcherLDFetch(ldFetch);
stopsFetcher.setPrefix("http://irail.be/stations/NMBS/");
stopsFetcher.setAccessUrl("https://irail.be/stations/NMBS");

const locationResolver = new LocationResolverDefault(stopsFetcher);

test("[RoadPlannerBirdsEye] distance between stops", async () => {

  const kortrijkLocation = await locationResolver.resolve({ id: "http://irail.be/stations/NMBS/008896008" });
  const ghentLocation = await locationResolver.resolve({ id: "http://irail.be/stations/NMBS/008892007" });

  const iterator = planner.plan({
    from: [kortrijkLocation], // Kortrijk
    to: [ghentLocation], // Ghent-Sint-Pieters,
    minimumWalkingSpeed: 3,
    maximumWalkingSpeed: 6,
  });

  const result = [];
  for await (const path of iterator) {
    result.push(path);
  }

  expect(result).toHaveLength(1);

  // todo test result[0].steps
});
