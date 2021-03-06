import LDFetch from "ldfetch";
import TravelMode from "../enums/TravelMode";
import ConnectionsIteratorLazy from "../fetcher/connections/lazy/ConnectionsIteratorLazy";

const ldFetch = new LDFetch({ headers: { Accept: "application/ld+json" } });

const upperBoundDate = new Date();
upperBoundDate.setHours(upperBoundDate.getHours() + 2);

const config = {
  upperBoundDate,
  backward: true,
};

const iterator = new ConnectionsIteratorLazy(
  "https://graph.irail.be/sncb/connections",
  TravelMode.Train,
  ldFetch,
  config,
  );

let i = 0;

console.time("ConnectionsIterator");

iterator.on("readable", () => {
  let connection = iterator.read();

  while (connection && i++ < 4000) {

    connection = iterator.read();
  }

  if (i > 3999) {
    console.timeEnd("ConnectionsIterator");
  }
});
