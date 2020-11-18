import { Component, OnInit } from "@angular/core";
import { VenueManagerService } from "./services/venue-manager.service";
import { MUC_CENTER } from "./models/models";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"],
    providers: [VenueManagerService],
})
export class AppComponent implements OnInit {
    public constructor(private venueManager: VenueManagerService) {}

    public ngOnInit(): void {
        // Make a initial query in the Munich Area
        this.venueManager.searchVenuesInLocation({ lat: MUC_CENTER[0], lng: MUC_CENTER[1] });
    }
}
