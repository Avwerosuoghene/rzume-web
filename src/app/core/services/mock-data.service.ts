import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {

  constructor() { }

  private mockResponse = {
    "message": "Orders gotten successfully",
    "data": {
      "data": [
        {
          "company": "Design Ventures",
          "job_role": "UV Designer",
          "cv": "Joseph Kekapoh - Graphics",
          "status": "Applied",
          "date": "July 7, 2024",
        },
        {
          "company": "Aqua Talent",
          "job_role": "Product Designer",
          "cv": "Joseph Kekapoh - Graphics",
          "status": "Offer",
          "date": "July 7, 2024",
        },
        {
          "company": "Aqua Talent",
          "job_role": "Product Designer",
          "cv": "Joseph Kekapoh - Graphics",
          "status": "Rejected",
          "date": "July 7, 2024",
        },
        {
          "company": "Aqua Talent",
          "job_role": "Product Designer",
          "cv": "Joseph Kekapoh - Graphics",
          "status": "Interview",
          "date": "July 7, 2024",
        },
        {
          "company": "Aqua Talent",
          "job_role": "Product Designer",
          "cv": "Joseph Kekapoh - Graphics",
          "status": "Wishlist",
          "date": "July 7, 2024",
        },
        {
          "company": "Aqua Talent",
          "job_role": "Product Designer",
          "cv": "Joseph Kekapoh - Graphics",
          "status": "Offer",
          "date": "July 7, 2024",
        },

      ],
      "total": 50,
      "limit": 5,
      "offset": 0
    },
    "isSuccess": true
  };

  getOrders(page: number, limit: number) {
    const offset = (page - 1) * limit;
    const paginatedData = this.mockResponse.data.data.slice(offset, offset + limit);
    console.log(paginatedData)
    return of({
      ...this.mockResponse,
      data: {
        ...this.mockResponse.data,
        data: paginatedData
      }
    });
  }
}
