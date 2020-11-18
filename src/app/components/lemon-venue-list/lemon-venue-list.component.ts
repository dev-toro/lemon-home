import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ComponentFactoryResolver,
    ElementRef,
    Injector,
    OnDestroy,
    ViewChild,
} from "@angular/core";
import Swiper from "swiper";
import { VenueManagerService } from "../../services/venue-manager.service";
import { Venue } from "../../models/venue";
import { isNil } from "lodash-es";
import { LemonVenueComponent } from "./lemon-venue/lemon-venue.component";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { SwiperOptions } from "swiper/types/swiper-options";

const DEFAULT_SWIPER_OPTIONS: SwiperOptions = {
    slidesPerView: "auto",
    spaceBetween: 8,
    updateOnWindowResize: true,
};

@Component({
    selector: "app-lemon-venue-list",
    templateUrl: "./lemon-venue-list.component.html",
    styleUrls: ["./lemon-venue-list.component.scss"],
})
export class LemonVenueListComponent implements AfterViewInit, OnDestroy {
    @ViewChild("swiperContainer", { static: true })
    private swiperContainer: ElementRef;

    private swiper: Swiper;
    private venues: Map<number, string> = new Map();

    private destroy$ = new Subject<Venue>();

    public constructor(
        private readonly venueManager: VenueManagerService,
        private readonly cdRef: ChangeDetectorRef,
        private resolver: ComponentFactoryResolver,
        private injector: Injector
    ) {}

    public ngAfterViewInit(): void {
        this.initSwiper();
        this.subscribeToVenueSearchRequests();
    }

    public ngOnDestroy(): void {
        this.destroy$.next();
    }

    private subscribeToVenueSearchRequests(): void {
        this.venueManager
            .searchVenuesResults$()
            .pipe(takeUntil(this.destroy$))
            .subscribe((venues: Venue[]) => {
                if (isNil(venues) || !venues.length) {
                    return;
                }
                this.swiper.removeAllSlides();
                venues.forEach((venue, index) => {
                    const venueComponent = this.createVenueComponentHTMLElement(venue);
                    this.venues.set(index, venue.id);
                    this.swiper.addSlide(index, venueComponent);
                });
            });
    }

    private createVenueComponentHTMLElement(venue: Venue): HTMLElement {
        const factory = this.resolver.resolveComponentFactory(LemonVenueComponent);
        const componentRef = factory.create(this.injector);
        // Populate component with venue reference
        componentRef.instance.setVenue(venue);
        componentRef.hostView.detectChanges();
        const nativeElement = componentRef.location.nativeElement;
        // Add slide class identifier to HTMLElement
        nativeElement.setAttribute("class", "swiper-slide");
        return nativeElement;
    }

    public initSwiper(): void {
        this.swiper = new Swiper(this.swiperContainer.nativeElement, DEFAULT_SWIPER_OPTIONS);
        // Listen to slide changes
        this.swiper.on("slideChange", () => {
            const currentSlideIndex = this.swiper.activeIndex;
            const currentVenueId = this.venues.get(currentSlideIndex);
            this.venueManager.selectVenue(currentVenueId);
        });
    }
}
