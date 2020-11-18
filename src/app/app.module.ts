import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppComponent } from "./app.component";
import { HttpClientModule } from "@angular/common/http";
import { LemonHeaderComponent } from "./components/lemon-header/lemon-header.component";
import { LemonMapComponent } from "./components/lemon-map/lemon-map.component";
import { LemonVenueListComponent } from "./components/lemon-venue-list/lemon-venue-list.component";
import { LemonVenueComponent } from "./components/lemon-venue-list/lemon-venue/lemon-venue.component";
import { CommonModule } from "@angular/common";

@NgModule({
    declarations: [AppComponent, LemonHeaderComponent, LemonMapComponent, LemonVenueListComponent, LemonVenueComponent],
    imports: [BrowserModule, HttpClientModule, CommonModule],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
