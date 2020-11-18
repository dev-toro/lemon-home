import { Injectable } from "@angular/core";
import {
    IFoursquareSearchResponse,
    IFoursquareResponseVenue,
    ILocation,
    IVenueSearchResult,
    IVenueDetailsResult,
    IFoursquareDetailsResponse,
    IFoursquareVenue,
} from "../models/models";
import { HttpClient } from "@angular/common/http";
import { EMPTY, Observable } from "rxjs";
import { filter, map } from "rxjs/operators";
import { isNil } from "lodash-es";
import { FOURSQUARE_CLIENT_ID, FOURSQUARE_CLIENT_SECRET } from "../config";

const BASE_URL = "https://api.foursquare.com/v2/venues";
const API_VERSION = "20180323";
const SECRETS = `client_id=${FOURSQUARE_CLIENT_ID}&client_secret=${FOURSQUARE_CLIENT_SECRET}&v=${API_VERSION}`;
const CATEGORY = "hotel";
const QUERY_LIMIT = 5;

@Injectable({
    providedIn: "root",
})
export class DataService {
    public constructor(private readonly http: HttpClient) {}

    public getVenuesCloseToLocation(location: ILocation): Observable<IVenueSearchResult[]> {
        if (isNil(location)) {
            return EMPTY;
        }
        const apiEndpoint = `${BASE_URL}/search?${SECRETS}&limit=${QUERY_LIMIT}&ll=${location.lat},${location.lng}&query=${CATEGORY}`;
        return this.http.get(apiEndpoint).pipe(
            filter((foursquareResponse: IFoursquareSearchResponse) => {
                const responseIsSuccessful = foursquareResponse.meta.code === 200;
                const responseIsValid =
                    !isNil(foursquareResponse.response) && !isNil(foursquareResponse.response.venues);
                // ToDo: Handle unsuccessful responses with grace
                return responseIsSuccessful && responseIsValid;
            }),
            map((foursquareResponse: IFoursquareSearchResponse) => this.resolveVenueSearch(foursquareResponse))
        );
    }

    public getVenueDetails(id: string): Observable<IVenueDetailsResult> {
        if (isNil(id)) {
            return EMPTY;
        }
        const apiEndpoint = `${BASE_URL}/${id}?${SECRETS}`;
        return this.http.get(apiEndpoint).pipe(
            filter((foursquareResponse: IFoursquareDetailsResponse) => {
                const responseIsSuccessful = foursquareResponse.meta.code === 200;
                const responseIsValid =
                    !isNil(foursquareResponse.response) && !isNil(foursquareResponse.response.venue);
                // ToDo: Handle unsuccessful responses with grace
                return responseIsSuccessful && responseIsValid;
            }),
            map((foursquareResponse: IFoursquareDetailsResponse) => this.resolveVenueDetails(foursquareResponse))
        );
    }

    private resolveVenueSearch(foursquareResponse: IFoursquareSearchResponse): IVenueSearchResult[] {
        if (isNil(foursquareResponse.response.venues) || !foursquareResponse.response.venues.length) {
            return [];
        }
        const venues = foursquareResponse.response.venues;
        return venues.map((venue: IFoursquareResponseVenue) => {
            const resultVenue: IVenueSearchResult = {
                id: venue.id,
                name: venue.name,
                location: { lat: venue.location.lat, lng: venue.location.lng },
            };
            return resultVenue;
        });
    }

    private resolveVenueDetails(foursquareResponse: IFoursquareDetailsResponse): IVenueDetailsResult {
        if (isNil(foursquareResponse.response.venue)) {
            return null;
        }
        const venue: IFoursquareVenue = foursquareResponse.response.venue;
        return {
            id: venue.id,
            name: venue.name,
            description: venue.description,
            rating: venue.rating,
            image: `${venue.bestPhoto.prefix}300x500${venue.bestPhoto.suffix}`,
            address: venue.location.formattedAddress[0],
        };
    }
}
