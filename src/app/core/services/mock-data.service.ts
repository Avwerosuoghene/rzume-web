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
          "order_id": "05fcd933547be81890bc4d62357fdf3f",
          "order_item_id": 2,
          "product_id": "2d00c3b37b984686777190e2e6e0a7b6",
          "shipping_limit_date": "2017-07-25 10:30:13",
          "seller_id": "9d7a1d34a5052409006425275ba1c2b4",
          "price": 89.9,
          "freight_value": 12.13,
          selected: false
        },
        {
          "order_id": "05fcd933547be81890bc4d62357fdf3f",
          "order_item_id": 1,
          "product_id": "2d00c3b37b984686777190e2e6e0a7b6",
          "shipping_limit_date": "2017-07-25 10:30:13",
          "seller_id": "9d7a1d34a5052409006425275ba1c2b4",
          "price": 89.9,
          "freight_value": 12.13,
          selected: false
        },
        {
          "order_id": "05fcd933547be81890bc4d62357fdf3f",
          "order_item_id": 2,
          "product_id": "2d00c3b37b984686777190e2e6e0a7b6",
          "shipping_limit_date": "2017-07-25 10:30:13",
          "seller_id": "9d7a1d34a5052409006425275ba1c2b4",
          "price": 89.9,
          "freight_value": 12.13,
          selected: false
        },
        {
          "order_id": "05fcd933547be81890bc4d62357fdf3f",
          "order_item_id": 1,
          "product_id": "2d00c3b37b984686777190e2e6e0a7b6",
          "shipping_limit_date": "2017-07-25 10:30:13",
          "seller_id": "9d7a1d34a5052409006425275ba1c2b4",
          "price": 89.9,
          "freight_value": 12.13,
          selected: false
        },
        {
          "order_id": "05fcd933547be81890bc4d62357fdf3f",
          "order_item_id": 1,
          "product_id": "2d00c3b37b984686777190e2e6e0a7b6",
          "shipping_limit_date": "2017-07-25 10:30:13",
          "seller_id": "9d7a1d34a5052409006425275ba1c2b4",
          "price": 89.9,
          "freight_value": 12.13,
          selected: false
        },
        {
          "order_id": "05fcd933547be81890bc4d62357fdf3f",
          "order_item_id": 1,
          "product_id": "2d00c3b37b984686777190e2e6e0a7b6",
          "shipping_limit_date": "2017-07-25 10:30:13",
          "seller_id": "9d7a1d34a5052409006425275ba1c2b4",
          "price": 89.9,
          "freight_value": 12.13,
          selected: false
        },
        {
          "order_id": "05fcd933547be81890bc4d62357fdf3f",
          "order_item_id": 1,
          "product_id": "2d00c3b37b984686777190e2e6e0a7b6",
          "shipping_limit_date": "2017-07-25 10:30:13",
          "seller_id": "9d7a1d34a5052409006425275ba1c2b4",
          "price": 89.9,
          "freight_value": 12.13,
          selected: false
        },
        {
          "order_id": "05fcd933547be81890bc4d62357fdf3f",
          "order_item_id": 1,
          "product_id": "2d00c3b37b984686777190e2e6e0a7b6",
          "shipping_limit_date": "2017-07-25 10:30:13",
          "seller_id": "9d7a1d34a5052409006425275ba1c2b4",
          "price": 89.9,
          "freight_value": 12.13,
          selected: false
        },
        {
          "order_id": "05fcd933547be81890bc4d62357fdf3f",
          "order_item_id": 1,
          "product_id": "2d00c3b37b984686777190e2e6e0a7b6",
          "shipping_limit_date": "2017-07-25 10:30:13",
          "seller_id": "9d7a1d34a5052409006425275ba1c2b4",
          "price": 89.9,
          "freight_value": 12.13,
          selected: false
        },
        {
          "order_id": "05fcd933547be81890bc4d62357fdf3f",
          "order_item_id": 1,
          "product_id": "2d00c3b37b984686777190e2e6e0a7b6",
          "shipping_limit_date": "2017-07-25 10:30:13",
          "seller_id": "9d7a1d34a5052409006425275ba1c2b4",
          "price": 89.9,
          "freight_value": 12.13,
          selected: false
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
