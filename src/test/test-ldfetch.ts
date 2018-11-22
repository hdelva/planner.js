import LDFetch from "ldfetch";
import { logTripleTable } from "../fetcher/helpers";

const ldfetch = new LDFetch({ headers: { Accept: "application/ld+json" } });

// ldfetch.get("http://irail.be/stations/NMBS/008896008")
ldfetch.get("https://belgium.linkedconnections.org/delijn/Oost-Vlaanderen/stops")
  .then((response) => {
    logTripleTable(response.triples);
  })
  .catch((reason) => {
    console.log(reason);
  });