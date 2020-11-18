import * as L from "leaflet";

export interface IFoursquareResponseVenue {
    id: string;
    name: string;
    location: {
        address: string;
        lat: string;
        lng: string;
    };
    distance: number;
}

export interface IFoursquareSearchResponse {
    meta: {
        code: number;
    };
    response: {
        venues: IFoursquareResponseVenue[];
    };
}

export interface IFoursquareVenue {
    id: string;
    name: string;
    description: string;
    location: {
        formattedAddress: string[];
    };
    rating: number;
    bestPhoto: {
        prefix: string;
        suffix: string;
    };
}

export interface IFoursquareDetailsResponse {
    meta: {
        code: number;
    };
    response: {
        venue: IFoursquareVenue;
    };
}

export interface ILocation {
    lat: string;
    lng: string;
}

export interface IVenueSearchResult {
    id: string;
    name: string;
    location: ILocation;
}

export interface IVenueDetailsResult {
    id: string;
    name: string;
    description: string;
    rating: number;
    image: string;
    address: string;
}

export const MUC_CENTER: L.LatLngExpression = [48.137154, 11.576124];
export const MUC_BOUNDS: L.LatLngBoundsExpression = [
    [48.243, 11.389],
    [48.022, 11.73],
];
