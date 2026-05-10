export interface Louvor {
  id?: string;
  titulo: string;
  artista: string;
  tema: 'Ceia' | 'Primícias' | 'Missões' | 'Culto Solene' | string;
  linkCifra: string;
  linkLetra?: string;
  letra?: string;        // Texto completo da letra armazenado no Firestore
  linkYoutube?: string;
  linkSpotify?: string;
  linkYoutubeMusic?: string;
  imagemUrl?: string;
  inPlaylist?: boolean;
}
