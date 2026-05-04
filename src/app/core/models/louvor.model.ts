export interface Louvor {
  id?: string;
  titulo: string;
  artista: string;
  tema: 'Ceia' | 'Primícias' | 'Missões' | string;
  linkCifra: string;
  linkYoutube?: string;
  linkSpotify?: string;
  linkYoutubeMusic?: string;
  imagemUrl?: string; // Mantido como fallback caso não haja Youtube
}
