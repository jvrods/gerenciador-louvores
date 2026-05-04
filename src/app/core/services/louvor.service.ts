import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, deleteDoc, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Louvor } from '../models/louvor.model';

@Injectable({
  providedIn: 'root'
})
export class LouvorService {
  private firestore = inject(Firestore);
  private louvoresCollection = collection(this.firestore, 'louvores');

  constructor() { }

  getLouvores(): Observable<Louvor[]> {
    return collectionData(this.louvoresCollection, { idField: 'id' }) as Observable<Louvor[]>;
  }

  addLouvor(louvor: Louvor) {
    return addDoc(this.louvoresCollection, louvor);
  }

  deleteLouvor(id: string) {
    const docRef = doc(this.firestore, `louvores/${id}`);
    return deleteDoc(docRef);
  }

  updateLouvor(louvor: Louvor) {
    const docRef = doc(this.firestore, `louvores/${louvor.id}`);
    return updateDoc(docRef, { ...louvor });
  }
}
