import { inject, injectable } from "inversify";
import LDFetch from "ldfetch";
import { Triple } from "rdf-js";
import TYPES from "../../../types";
import { transformPredicate } from "../../helpers";
import IStop from "../IStop";
import IStopsFetcher from "../IStopsFetcher";

interface IPartialStopMap {
  [stopId: string]: Partial<IStop>;
}

interface IStopMap {
  [stopId: string]: IStop;
}

@injectable()
export default class StopsFetcherLDFetch implements IStopsFetcher {

  public prefix: string;
  private accessUrl: string;

  private ldFetch: LDFetch;
  private loadPromise: Promise<any>;
  private stops: IStopMap;

  constructor(
    @inject(TYPES.LDFetch) ldFetch: LDFetch,
  ) {
    this.ldFetch = ldFetch;
    this.loadStops();
  }

  public setPrefix(prefix: string) {
    this.prefix = prefix;
  }

  public setAccessUrl(accessUrl: string) {
    this.accessUrl = accessUrl;
  }

  public async getStopById(stopId: string): Promise<IStop> {
    if (this.loadPromise) {
      await this.loadPromise;
    }

    return this.stops[stopId];
  }

  public async getAllStops(): Promise<IStop[]> {
    if (this.loadPromise) {
      await this.loadPromise;
    }

    return Object.values(this.stops);
  }

  private loadStops() {
    if (this.accessUrl) {

      this.loadPromise = this.ldFetch
        .get(this.accessUrl)
        .then((response) => {
          this.stops = this.parseTriples(response.triples);
          this.loadPromise = null;
        })
        .catch((reason) => {
          console.log(reason);
        });
    }
  }

  private transformPredicate(triple: Triple): Triple {
    return transformPredicate({
      "http://xmlns.com/foaf/0.1/name": "name",
      "http://www.w3.org/2003/01/geo/wgs84_pos#lat": "latitude",
      "http://www.w3.org/2003/01/geo/wgs84_pos#long": "longitude",
    }, triple);
  }

  private parseTriples(triples: Triple[]): IStopMap {
    return triples.reduce((stopMap: IPartialStopMap, triple: Triple) => {
      triple = this.transformPredicate(triple);

      const { subject: { value: subject }, predicate: { value: predicate }, object: { value: object } } = triple;

      if (!(subject in stopMap)) {
        stopMap[subject] = {
          id: subject,
        };
      }

      if (predicate === "longitude" || predicate === "latitude") {
        stopMap[subject][predicate] = parseFloat(object);

      } else {
        stopMap[subject][predicate] = object;
      }

      return stopMap;
    }, {}) as IStopMap;
  }
}
