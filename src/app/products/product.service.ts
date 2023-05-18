import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';

import {BehaviorSubject, catchError, combineLatest, map, Observable, tap, throwError} from 'rxjs';

import {Product} from './product';
import {ProductCategoryService} from "../product-categories/product-category.service";

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsUrl = 'api/products';
  private suppliersUrl = 'api/suppliers';

  // observables
  products$: Observable<Product[]> = this.http.get<Product[]>(this.productsUrl)
    .pipe(
      tap(data => console.log('Products: ', JSON.stringify(data))),
      catchError(this.handleError)
    );

  categories$ = this.categoryService.productCategories$;

  // combine products & categories observables
  productWithCategory$ = combineLatest([this.products$, this.categories$])
    .pipe(
      map(([products, categories]) =>
        products.map(product => ({
          ...product,
          price: product.price ? product.price * 1.5 : 0,
          category: categories.find(c => product.categoryId === c.id)?.name,
          searchKey: [product.productName]
        } as Product))
      )
    );

  // product selected subject
  private productSelectedSubject = new BehaviorSubject<number>(0);
  productSelectAction$ = this.productSelectedSubject.asObservable();

  selectedProduct$ = combineLatest([
    this.productWithCategory$,
    this.productSelectAction$
  ]).pipe(
    map(([products, selectedProductId]) => {
      return selectedProductId > 0 ? products.find(p => p.id === selectedProductId) : null;
    })
  );

  constructor(private http: HttpClient, private categoryService: ProductCategoryService) {
  }

  selectedProductChanged(id: number): void {
    this.productSelectedSubject.next(id);
  }

  private fakeProduct(): Product {
    return {
      id: 42,
      productName: 'Another One',
      productCode: 'TBX-0042',
      description: 'Our new product',
      price: 8.9,
      categoryId: 3,
      // category: 'Toolbox',
      quantityInStock: 30
    };
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${err.status}: ${err.message}`;
    }
    console.error(err);
    return throwError(() => errorMessage);
  }

}
