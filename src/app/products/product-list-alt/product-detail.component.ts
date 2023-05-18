import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Supplier} from '../../suppliers/supplier';

import {ProductService} from '../product.service';
import {catchError, EMPTY} from "rxjs";

@Component({
  selector: 'pm-product-detail',
  templateUrl: './product-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailComponent {
  pageTitle = 'Product Detail';
  errorMessage = '';
  productSuppliers: Supplier[] | null = null;

  //observable
  product$ = this.productService.selectedProduct$.pipe(
    catchError(err => {
      this.errorMessage = err;
      return EMPTY;
    })
  )

  constructor(private productService: ProductService) {
  }

}
