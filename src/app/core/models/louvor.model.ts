export interface Louvor {
  id?: string;
  titulo: string;
  artista: string;
  tema: 'Ceia' | 'Primícias' | 'Missões' | 'Culto Solene' | string;
  linkCifra: string;
  linkLetra?: string;
  linkYoutube?: string;
  linkSpotify?: string;
  linkYoutubeMusic?: string;
  imagemUrl?: string; // Mantido como fallback caso não haja Youtube
  inPlaylist?: boolean;
}
