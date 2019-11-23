import { ShoppingCart } from './models/shopping-cart';
import { take, map } from 'rxjs/operators';
import { Product } from './models/product';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireObject, AngularFireList } from 'angularfire2/database';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShoppingCartService {
  
  constructor(private db: AngularFireDatabase) { }

  async getCart(): Promise<Observable<ShoppingCart>>{
    let cartId = await this.getOrCreateCart();
    return this.db.object('/shopping-carts/' + cartId)
    .valueChanges().pipe(map(x => new ShoppingCart(x['items'])));
  }

  
  async addToCart(product: Product) {
    this.updateItemQuantity(product,1);
  }

  async removeFromCart(product: Product){
    this.updateItemQuantity(product, -1);
  }

  async clearCart() {
    let cartId = await this.getOrCreateCart();
    this.db.object('/shopping-carts/' + cartId + '/items').remove();
  }

  private create() {
    return this.db.list('/shopping-carts').push({
      dateCreated: new Date().getTime()
    });
  }


  private getItem(cartId: string, productId: string){
    return this.db.object('/shopping-carts/' + cartId + '/items/' + productId);
  }

  private async getOrCreateCart(): Promise<string>{
    let cartId = localStorage.getItem('cartId');
    if(cartId) return cartId;

    let result = await this.create();
    localStorage.setItem('cartId', result.key);
    return result.key;

  }


  private async updateItemQuantity(product: Product, change: number){
    let cartId = await this.getOrCreateCart();
    let item$ = this.getItem(cartId,product.key);
    item$.valueChanges().pipe(take(1)).subscribe((item: any) => {
      if(item) {
        item$.update({
          title: product.title,
          imageUrl: product.imageUrl,
          price: product.price,
          quantity: (item.quantity || 0) + change });
          if((item['quantity'] + change) == 0) 
          item$.remove();
      } else item$.update({
        title: product.title,
        imageUrl: product.imageUrl,
        price: product.price,
         quantity: 1})
    });

    // private async updateItemQuantity(product: Product, change: number){
    //   let cartId = await this.getOrCreateCart();
    //   let item$ = this.getItem(cartId, product.key);
    //   item$.valueChanges().pipe(take(1))
    //     .subscribe(item => {
    //       if(item) item$.update({ product:product, quantity: item['quantity'] + change })
    //       else item$.update({ product:product, quantity: 1 })
    //     });
    // }
}
}


