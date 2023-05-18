import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Product} from './product';
import {ProductService} from './product.service';
import {catchError, combineLatest, EMPTY, map, Observable, startWith, Subject} from "rxjs";
import {ProductCategoryService} from "../product-categories/product-category.service";

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent {
  pageTitle = 'Product List';
  errorMessage = '';

  // observable
  products$: Observable<Product[]> = this.productService.productWithCategory$
    .pipe(
      catchError(err => {
        this.errorMessage = err;
        return EMPTY;
      })
    );

  categories$ = this.categoryService.productCategories$
    .pipe(
      catchError(err => {
        this.errorMessage = err;
        return EMPTY;
      })
    );

  // create an action stream for the selected category
  private categorySelectedSubject = new Subject<number>();
  private categorySelectedAction$ = this.categorySelectedSubject.asObservable();

  // combine products$ & categorySelectedAction to react to actions
  productsSimpleFilter$ = combineLatest([
    this.products$,
    this.categorySelectedAction$.pipe(
      startWith(0)
    )
  ]).pipe(
    map(([products, selectedCategoryId]) => {
      return selectedCategoryId > 0 ? products.filter(p => p.categoryId === selectedCategoryId) : products
    }),
    catchError(err => {
      this.errorMessage = err;
      return EMPTY;
    })
  )

  constructor(private productService: ProductService,
              private categoryService: ProductCategoryService) {
  }

  onAdd(): void {
    console.log('Not yet implemented');
  }

  onSelected(categoryId: string): void {
    this.categorySelectedSubject.next(+categoryId);
  }
}
