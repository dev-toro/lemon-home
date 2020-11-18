import { ChangeDetectorRef, Component, OnDestroy } from "@angular/core";
import { Venue } from "../../../models/venue";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
    selector: "app-lemon-venue",
    templateUrl: "./lemon-venue.component.html",
    styleUrls: ["./lemon-venue.component.scss"],
})
export class LemonVenueComponent implements OnDestroy {
    public venue: Venue;

    private destroy$ = new Subject<Venue>();

    public constructor(private cdRef: ChangeDetectorRef) {}

    public ngOnDestroy(): void {
        this.destroy$.next();
    }

    public setVenue(venue: Venue): void {
        this.venue = venue;
        this.subscribeToVenueData();
    }

    private subscribeToVenueData(): void {
      this.venue
        .isDataReady$()
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.cdRef.detectChanges();
        });
    }
}
