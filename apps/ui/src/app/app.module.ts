import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {DataViewModule} from 'primeng/dataview';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InMemoryCache } from '@apollo/client/core';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { InplaceModule } from 'primeng/inplace';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ToolbarModule } from 'primeng/toolbar';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing.module';
import { MainPage } from './main.page/main.page';
import { LeoBoxService } from './services/leo-box.service';
import { CardModule } from 'primeng/card';

AppComponent
@NgModule({
  declarations: [
    AppComponent, 
    MainPage
  ],
  imports: [
    CardModule,
    BrowserModule, 
    DataViewModule,
    HttpClientModule, 
    ApolloModule, 
    AppRoutingModule, 
    ButtonModule, 
    InputTextModule,
    ToolbarModule, 
    MenuModule, 
    OverlayPanelModule, 
    BrowserAnimationsModule, 
    DropdownModule, 
    InputTextModule, 
    ConfirmDialogModule, 
    InplaceModule
  ],
  providers: [
    LeoBoxService, 
    ConfirmationService, 
    {
      provide: APOLLO_OPTIONS,
      useFactory(httpLink: HttpLink) {
        return {
          cache: new InMemoryCache(),
          link: httpLink.create({
            uri: '/graphql',
          }),
        };
      },
      deps: [HttpLink],
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
