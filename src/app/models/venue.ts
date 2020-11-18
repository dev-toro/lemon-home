import { ILocation, IVenueDetailsResult } from "./models";
import { LatLngExpression } from "leaflet";
import { Observable, Subject } from "rxjs";

export class Venue {
    // ToDo: Add proper accessors for the class variables.
    public id: string;
    public location: ILocation;
    public name: string;
    public description: string;
    public rating: number;
    public image: string;
    public address: string;
    public isSelected = false;

    public dataReady$ = new Subject();

    public constructor(id: string, name: string, location: ILocation) {
        this.id = id;
        this.location = location;
        this.name = name;
    }

    public setDetails(details: IVenueDetailsResult): void {
        this.name = details.name || this.id;
        this.description = details.description || "";
        this.rating = details.rating || 0;
        this.image = details.image || "";
        this.address = details.address || "";
        this.dataReady$.next();
    }

    public isDataReady(): Observable<any> {
        return this.dataReady$.asObservable();
    }

    public select(): void {
        this.isSelected = true;
    }

    public deselect(): void {
        this.isSelected = false;
    }

    public getLatLngExpression(): LatLngExpression {
        const lat = parseFloat(this.location.lat);
        const lng = parseFloat(this.location.lng);
        return { lat, lng };
    }
}
