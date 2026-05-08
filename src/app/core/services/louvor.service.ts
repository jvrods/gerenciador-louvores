import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, deleteDoc, updateDoc, docData, setDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Louvor } from '../models/louvor.model';

export interface PlaylistConfig {
  youtube?: string;
  ytmusic?: string;
  spotify?: string;
}

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

  getPlaylistConfig(): Observable<PlaylistConfig> {
    const docRef = doc(this.firestore, 'config/playlist');
    return docData(docRef) as Observable<PlaylistConfig>;
  }

  savePlaylistConfig(config: PlaylistConfig) {
    const docRef = doc(this.firestore, 'config/playlist');
    return setDoc(docRef, config, { merge: true });
  }
}
