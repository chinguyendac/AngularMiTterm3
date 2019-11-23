import { ShoppingCartService } from './../shopping-cart.service';
import { Product } from './../models/product';
import { ProductService } from './../product.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { ShoppingCart } from '../models/shopping-cart';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  category: string;
  cart$: Observable<ShoppingCart>;


  constructor(
     private route: ActivatedRoute,
     private productService: ProductService, 
     private shoppinCartService: ShoppingCartService) {}


  async ngOnInit() {
    this.cart$ =  (await this.shoppinCartService.getCart());
    this.populateProducts();
    
  }

  private populateProducts() {
    this.productService.getAll().pipe(switchMap(products => {
      this.products = products;
      return this.route.queryParamMap;
    })).subscribe(params => {
      this.category = params.get('category');
      this.applyFilter();
  });
  }

  private applyFilter() {
    this.filteredProducts = (this.category) ?
    this.products.filter(p => p.category === this.category) :
    this.products;
  }

  //   this.route.queryParamMap.subscribe(params => {
  //     this.category = params.get('category');

  //     this.filteredProducts = (this.category) ?
  //       this.products.filter(p => p.category === this.category) :
  //       this.products;
  // });
}
