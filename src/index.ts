import "isomorphic-fetch";
import "reflect-metadata";
import FootpathGenerator from "./analytics/footpaths/main";
import IsochroneGenerator from "./analytics/isochrones/main";
import Planner from "./Planner";

export default {
    Planner,
    IsochroneGenerator,
    FootpathGenerator,
};

// Uncomment to run
/*
const x = new FootpathGenerator();
x.generatePaths().then(() => {
    console.log("DONE");
});
*/
