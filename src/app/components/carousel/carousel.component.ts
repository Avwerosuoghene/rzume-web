import { Component, Input } from '@angular/core';
import { NgFor, NgForOf } from "@angular/common";

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [NgFor, NgForOf],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.scss'

})
export class CarouselComponent {

    @Input() items: Array<any> = [];
    currentIndex: number = 0;

    prev(){
        this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
    }

    next(){
        this.currentIndex = (this.currentIndex + 1) % this.items.length;
    }

    goTo(index: number){
        this.currentIndex = index;
    }
}
