import { AsyncIterator } from "asynciterator";
import { Delaunay } from "d3-delaunay";
import fs = require("fs");
import "isomorphic-fetch";
import "reflect-metadata";

import IStopsProvider from "../../fetcher/stops/IStopsProvider";
import ILocation from "../../interfaces/ILocation";
import IPath from "../../interfaces/IPath";
import { DistanceM } from "../../interfaces/units";
import defaultContainer from "../../inversify.config";
import IRoadPlanner from "../../planner/road/IRoadPlanner";
import TYPES from "../../types";
import Geo from "../../util/Geo";
import Iterators from "../../util/Iterators";

export default class FootpathGenerator {
    public async generatePaths() {
        const stopsProvider = defaultContainer.get<IStopsProvider>(TYPES.StopsProvider);
        const planner = defaultContainer.get<IRoadPlanner>(TYPES.RoadPlanner);

        const pairs = await this.getPairs(stopsProvider);

        let done = 0;

        for (const pair of pairs) {
            done += 1;
            console.log("To do:", pairs.length - done);
            const [from, to] = pair;

            let allDistances = {};
            let fileId = from.id.split("//")[1];
            fileId = fileId.replace(/\./g, "_");
            fileId = fileId.replace(/\//g, "_");
            const fileName = `distances/${fileId}.json`;

            try {
                const fileData = fs.readFileSync(fileName);
                if (fileData && fileData.length) {
                    // we have already computed some paths for this stop
                    allDistances = JSON.parse(fileData.toString());
                }
            } catch {
                //
            }

            if (allDistances[from.id]) {
                // we have already computed this path, skip it
                continue;
            }

            try {
                const query = {
                    from: [from],
                    to: [to],
                    minimumWalkingSpeed: 4.5,
                    maximumWalkingSpeed: 4.5,
                };

                const pathIterator = await planner.plan(query);

                const distanceIterator: AsyncIterator<DistanceM> = pathIterator.map((path: IPath) =>
                    path.steps.reduce((totalDistance: DistanceM, step) => totalDistance + step.distance, 0),
                );

                const distances = await Iterators.toArray(distanceIterator);
                if (distances.length) {
                    const shortest = Math.min(...distances);

                    allDistances[to.id] = Math.round(shortest);

                    await fs.writeFile(fileName, JSON.stringify(allDistances), "utf-8", (err) => {
                        if (err) {
                            throw err;
                        }
                    });
                }
            } catch (err) {
                console.log(err);
            }
        }
    }

    private async getPairs(stopsProvider) {
        const stops = await stopsProvider.getAllStops();
        // using the WGS84 coordinates as-is
        function getX(p: ILocation) {
            return p.longitude;
        }

        function getY(p: ILocation) {
            return p.latitude;
        }

        function nextHalfedge(e: number) {
            // from https://mapbox.github.io/delaunator/
            return (e % 3 === 2) ? e - 2 : e + 1;
        }

        const delaunay = Delaunay.from(stops, getX, getY);
        const pairs = [];
        for (let e = 0; e < delaunay.triangles.length; e++) {
            if (e > delaunay.halfedges[e]) {
                // this will create a single triangulation
                // extra checks can be added here to calculate edges between different operators
                const p = stops[delaunay.triangles[e]];
                const q = stops[delaunay.triangles[nextHalfedge(e)]];

                pairs.push([p, q]); // in both directions of course
                pairs.push([q, p]);
            }
        }

        // because of practical reasons, shortest distances require less data
        pairs.sort((a, b) => Geo.getDistanceBetweenLocations(a[0], a[1]) -
            Geo.getDistanceBetweenLocations(b[0], b[1]));
        return pairs;
    }
}