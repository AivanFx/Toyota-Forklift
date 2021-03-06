import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import { Router, ActivatedRoute } from '@angular/router';
import 'firebase/storage';
import { AngularFireAuth } from '@angular/fire/auth';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  private snapshotChangesSubscription: any;
  public favorites: Array<any> = [];
  public currentForklift;

  constructor(
    public afs: AngularFirestore,
    public afAuth: AngularFireAuth,
    public storage: Storage,
    private router: Router,
  ) { }

  getForklifts() {
    return new Promise<any>((resolve, reject) => {
      this.afAuth.user.subscribe(currentUser => {
        if (currentUser) {
          this.snapshotChangesSubscription = this.afs.collection('people').doc(currentUser.uid).collection('forklifts').snapshotChanges();
          resolve(this.snapshotChangesSubscription);
        }
      })
    })
  }

  setCurrentForklift(forklift) {
    this.currentForklift = forklift;
    console.log(" El forklift seleccionado es: ", this.currentForklift)
  }

  getCurrentForklift() {
    return this.currentForklift;
  }

  unsubscribeOnLogOut() {
    //remember to unsubscribe from the snapshotChanges
    this.snapshotChangesSubscription.unsubscribe();
  }

  updateForklift(forkliftKey, value) {
    return new Promise<any>((resolve, reject) => {
      let currentUser = firebase.auth().currentUser;
      this.afs.collection('people').doc(currentUser.uid).collection('forklifts').doc(forkliftKey).set(value)
        .then(
          res => resolve(res),
          err => reject(err)
        )
    })
  }

  deleteForklift(forkliftKey) {
    return new Promise<any>((resolve, reject) => {
      let currentUser = firebase.auth().currentUser;
      this.afs.collection('people').doc(currentUser.uid).collection('forklifts').doc(forkliftKey).delete()
        .then(
          res => resolve(res),
          err => reject(err)
        )
    })
  }

  createForklift(value) {
    return new Promise<any>((resolve, reject) => {
      let currentUser = firebase.auth().currentUser;
      this.afs.collection('people').doc(currentUser.uid).collection('forklifts').add({
        model: value.model,
        image: value.image,
        loadCapacity: value.loadCapacity,
        aisleWidthForPallets: value.aisleWidthForPallets,
        gradeabilityWithLoad: value.gradeabilityWithLoad,
        gradeabilityWithoutLoad: value.gradeabilityWithoutLoad,
        driveMotorRating: value.driveMotorRating,
        voltage: value.voltage,
        price: value.price
      })
        .then(
          res => resolve(res),
          err => reject(err)
        )
    })
  }

  encodeImageUri(imageUri, callback) {
    var c = document.createElement('canvas');
    var ctx = c.getContext("2d");
    var img = new Image();
    img.onload = function () {
      var aux: any = this;
      c.width = aux.width;
      c.height = aux.height;
      ctx.drawImage(img, 0, 0);
      var dataURL = c.toDataURL("image/jpeg");
      callback(dataURL);
    };
    img.src = imageUri;
  };

  uploadImage(imageURI, randomId) {
    return new Promise<any>((resolve, reject) => {
      let storageRef = firebase.storage().ref();
      let imageRef = storageRef.child('image').child(randomId);
      this.encodeImageUri(imageURI, function (image64) {
        imageRef.putString(image64, 'data_url')
          .then(snapshot => {
            snapshot.ref.getDownloadURL()
              .then(res => resolve(res))
          }, err => {
            reject(err);
          })
      })
    })
  }
  getFavorites() {
    this.storage.get('favorites').then((val) => {
      console.log("Antes de devolver favoritos", val)
      return val;
    });
  }


  addFavorite(favorite) {

    console.log("Favorito a añadir es ", favorite)

    // Cargar favoritos anteriores 
    this.storage.get('favorites').then((val) => {
      if (val) {
        this.favorites = val;
        this.favorites.push(favorite);
      }
      else {
        this.favorites = [favorite];
      }

      this.storage.set('favorites', this.favorites);
      console.log("Despues de añadir favoritos", this.favorites);
    });
  }

  deleteCurrentFavoriteForklift(favorite) {
    var i = this.favorites.indexOf(favorite);
    console.log("Favorito a eliminar es ", favorite);

    this.storage.get('favorites').then((val) => {
      this.favorites = val;
      this.favorites.splice(i, 1);
      this.storage.set('favorites', this.favorites);
      this.router.navigate(['/products']);
      console.log("Despues de eliminar favoritos", this.favorites);
    });

    // this.fav = this.favorites.splice(i,1);
    // this.storage.remove( 'favorites', this.fav);
    // console.log("Los favoritos son " ,this.favorites)
  }

}





