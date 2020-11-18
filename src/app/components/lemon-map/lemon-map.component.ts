import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from "@angular/core";
import * as L from "leaflet";
import { isNil } from "lodash-es";
import { VenueManagerService } from "../../services/venue-manager.service";
import { Venue } from "../../models/venue";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { MUC_BOUNDS, MUC_CENTER } from "../../models/models";
import { MAPBOX_TOKEN } from "../../config";

const MAPBOX_URL_TEMPLATE = "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}";
const DEFAULT_MAPBOX_OPTIONS = {
    id: "mapbox/streets-v11",
    tileSize: 512,
    zoomOffset: -1,
    accessToken: MAPBOX_TOKEN,
};

const DEFAULT_MAP_OPTIONS: L.MapOptions = {
    attributionControl: false,
    zoomControl: false,
    scrollWheelZoom: "center",
    maxBounds: MUC_BOUNDS,
    minZoom: 14,
    maxZoom: 14,
};

const MAP_ICON = L.divIcon({
    className: "lemon-map__icon",
    iconSize: [40, 40],
});

const MAP_ICON_SELECTED = L.divIcon({
    className: "lemon-map__icon lemon-map__icon--active",
    iconSize: [40, 40],
});

const MAP_OFFSET_X = 0;
const MAP_OFFSET_Y = 100;

@Component({
    selector: "app-lemon-map",
    templateUrl: "./lemon-map.component.html",
    styleUrls: ["./lemon-map.component.scss"],
})
export class LemonMapComponent implements AfterViewInit, OnDestroy {
    @ViewChild("leafletContainer", { static: true })
    private mapContainer: ElementRef;

    private map: L.Map;
    private markers: Map<string, L.Marker> = new Map();
    private currSelectedVenueId: string;

    private destroy$ = new Subject<Venue>();

    public constructor(private readonly venueManager: VenueManagerService) {}

    public ngAfterViewInit(): void {
        this.initMap();
        this.subscribeToVenueSearchRequests();
        this.subscribeToVenueSelectionRequests();
    }

    public ngOnDestroy(): void {
        this.destroy$.next();
    }

    private subscribeToVenueSearchRequests(): void {
        this.venueManager
            .searchVenuesResults$()
            .pipe(takeUntil(this.destroy$))
            .subscribe((venues: Venue[]) => {
                this.deleteMarkers();
                this.markers.clear();
                venues.forEach((venue: Venue) => this.addVenueToMap(venue));
            });
    }

    private subscribeToVenueSelectionRequests(): void {
        this.venueManager
            .selectedVenueResult$()
            .pipe(takeUntil(this.destroy$))
            .subscribe((venue: Venue) => {
                this.deleteSelectedMarkers();
                this.addVenueToMap(venue);
                this.currSelectedVenueId = venue.id;
                // ToDo: Define offset depending on the viewport
                this.recenterMap(venue.getLatLngExpression(), DEFAULT_MAP_OPTIONS.minZoom, MAP_OFFSET_X, MAP_OFFSET_Y);
            });
    }

    private initMap(): void {
        if (isNil(this.map)) {
            this.map = new L.Map(this.mapContainer.nativeElement, DEFAULT_MAP_OPTIONS);
            this.map.setView(MUC_CENTER, DEFAULT_MAP_OPTIONS.minZoom);
            this.map.addLayer(L.tileLayer(MAPBOX_URL_TEMPLATE, DEFAULT_MAPBOX_OPTIONS));
        }
    }

    private deleteMarkers(): void {
        if (isNil(this.map)) {
            return;
        }
        this.markers.forEach((marker: L.Marker) => this.map.removeLayer(marker));
    }

    private deleteSelectedMarkers(): void {
        if (isNil(this.map)) {
            return;
        }
        this.markers.forEach((marker: L.Marker, id: string) => {
            if (id === this.currSelectedVenueId) {
                this.map.removeLayer(marker);
            }
        });
    }

    private addVenueToMap(venue: Venue): void {
        if (isNil(this.map)) {
            return;
        }
        const venueIcon = venue.isSelected ? MAP_ICON_SELECTED : MAP_ICON;
        const venueZIndex = venue.isSelected ? 100 : 0;
        const marker = new L.Marker(venue.getLatLngExpression(), { icon: venueIcon, zIndexOffset: venueZIndex });
        this.markers.set(venue.id, marker);
        this.map.addLayer(marker);
    }

    private recenterMap(position: L.LatLngExpression, zoom: number, offsetX: number, offsetY: number): void {
        if (isNil(this.map)) {
            return;
        }
        const center = this.map.project(position, zoom);
        const centerPoint = new L.Point(center.x + offsetX, center.y + offsetY);
        const target = this.map.unproject(centerPoint, zoom);
        this.map.panTo(target);
    }
}
