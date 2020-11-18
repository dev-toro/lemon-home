import { Injectable, OnDestroy } from "@angular/core";
import { DataService } from "./data.service";
import { Observable, Subject } from "rxjs";
import { ILocation, IVenueDetailsResult, IVenueSearchResult } from "../models/models";
import { switchMap, take, takeUntil } from "rxjs/operators";
import { Venue } from "../models/venue";

@Injectable()
export class VenueManagerService implements OnDestroy {
    private venueSearchRequest$ = new Subject<ILocation>();
    private venueSearchResult$ = new Subject<Venue[]>();

    private venueSelectionRequest$ = new Subject<Venue>();
    private venueSelectionResult$ = new Subject<Venue>();

    private destroy$ = new Subject<Venue>();

    private venues: Map<string, Venue> = new Map();

    public constructor(private dataService: DataService) {
        this.subscribeToVenueSearchRequests();
        this.subscribeToVenueSelectionRequests();
    }

    public ngOnDestroy(): void {
        this.destroy$.next();
    }

    public searchVenuesInLocation(location: ILocation): void {
        this.venueSearchRequest$.next(location);
    }

    public selectVenue(venueId: string): void {
        this.venueSelectionRequest$.next(this.venues.get(venueId));
    }

    public selectedVenueResult$(): Observable<Venue> {
        return this.venueSelectionResult$.asObservable();
    }

    public searchVenuesResults$(): Observable<Venue[]> {
        return this.venueSearchResult$.asObservable();
    }

    public getSelectedVenue(): Venue {
        return [...this.venues.values()].find((venue: Venue) => venue.isSelected === true);
    }

    private subscribeToVenueSearchRequests(): void {
        this.venueSearchRequest$
            .pipe(
                takeUntil(this.destroy$),
                switchMap((location: ILocation) => this.dataService.getVenuesCloseToLocation(location))
            )
            .subscribe((venueLocations: IVenueSearchResult[]) => {
                const searchResult = this.resolvedVenues(venueLocations);
                // Select first venue of result
                if (searchResult.length) {
                    this.selectVenue(searchResult[0].id);
                }
                this.venueSearchResult$.next(searchResult);
            });
    }

    private subscribeToVenueSelectionRequests(): void {
        this.venueSelectionRequest$.pipe(takeUntil(this.destroy$)).subscribe((venue: Venue) => {
            this.deselectOtherVenues();
            venue.select();
            this.fetchVenueDetails(venue);
            this.venueSelectionResult$.next(venue);
        });
    }

    private resolvedVenues(venueLocations: IVenueSearchResult[]): Venue[] {
        venueLocations.forEach((venueLocation: IVenueSearchResult) => {
            const venue = new Venue(venueLocation.id, venueLocation.name, venueLocation.location);
            this.venues.set(venueLocation.id, venue);
        });
        return [...this.venues.values()];
    }

    private fetchVenueDetails(venue: Venue): void {
        this.dataService
            .getVenueDetails(venue.id)
            .pipe(take(1))
            .subscribe((venueDetails: IVenueDetailsResult) => {
                venue.setDetails(venueDetails);
            });
    }

    private deselectOtherVenues(): void {
        this.venues.forEach((venue: Venue) => venue.deselect());
    }
}
