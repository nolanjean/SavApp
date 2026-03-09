import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
@Component({
 selector: 'app-footer',
 imports: [RouterLink], //Retirer routeroutlink car warning
 templateUrl: './footer.html',
 styleUrl: './footer.css',
})
export class Footer {
}