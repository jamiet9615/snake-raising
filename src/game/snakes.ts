import type { Species } from './types';

// ---------------------------------------------------------------------------
// Snake species database — 6 species, 3 stages each + silhouette.
// All image paths resolve against /public.
// ---------------------------------------------------------------------------

const I = (name: string) => `images/${name}.PNG`;

export const SPECIES: Species[] = [
  {
    id: 'grass',
    name: '青草蛇',
    accent: '#7CC576',
    art: {
      baby: { normal: I('青草蛇幼年蛇'), petted: I('青草蛇幼年蛇被摸') },
      teen: { normal: I('青草蛇青年蛇'), petted: I('青草蛇青年蛇被摸') },
      adult: { normal: I('青草蛇成蛇'), petted: I('青草蛇成蛇被摸') },
      silhouette: I('青草蛇剪影'),
    },
  },
  {
    id: 'strawberry',
    name: '草莓蛇',
    accent: '#FF6B8A',
    art: {
      baby: { normal: I('草莓蛇幼年'), petted: I('草莓蛇幼年蛇被摸') },
      teen: { normal: I('草莓蛇青年蛇'), petted: I('草莓蛇青年蛇被摸') },
      adult: { normal: I('草莓蛇成蛇'), petted: I('草莓蛇成蛇被摸') },
      silhouette: I('草莓蛇剪影'),
    },
  },
  {
    id: 'sky',
    name: '天空蛇',
    accent: '#7EC8E3',
    art: {
      baby: { normal: I('天空蛇幼年蛇'), petted: I('天空蛇幼年蛇被摸') },
      teen: { normal: I('天空蛇青年蛇'), petted: I('天空蛇青年蛇被摸') },
      adult: { normal: I('天空蛇成蛇'), petted: I('天空蛇成蛇被摸') },
      silhouette: I('天空蛇剪影'),
    },
  },
  {
    id: 'sea',
    name: '海蛇',
    accent: '#4FB3B8',
    art: {
      baby: { normal: I('海蛇幼年蛇'), petted: I('海蛇幼年蛇被摸') },
      teen: { normal: I('海蛇青年蛇'), petted: I('海蛇青年蛇被摸') },
      adult: { normal: I('海蛇成蛇'), petted: I('海蛇成蛇被摸') },
      silhouette: I('海蛇剪影'),
    },
  },
  {
    id: 'boss',
    name: '地頭蛇',
    accent: '#E0A458',
    art: {
      baby: { normal: I('地頭蛇幼年蛇'), petted: I('地頭蛇幼年蛇被摸') },
      teen: { normal: I('地頭蛇青年蛇'), petted: I('地頭蛇青年蛇被摸') },
      adult: { normal: I('地頭蛇成蛇'), petted: I('地頭蛇成蛇被摸') },
      silhouette: I('地頭蛇剪影'),
    },
  },
  {
    id: 'python',
    name: 'Python蛇',
    accent: '#9B7EDE',
    art: {
      baby: { normal: I('python幼年蛇'), petted: I('python幼年蛇被摸') },
      teen: { normal: I('python青年蛇'), petted: I('python青年蛇被摸') },
      adult: { normal: I('python成蛇'), petted: I('python成蛇被摸') },
      silhouette: I('python剪影'),
    },
  },
];

export const SPECIES_BY_ID: Record<string, Species> = Object.fromEntries(
  SPECIES.map((s) => [s.id, s]),
);

export function getSpecies(id: string): Species {
  const s = SPECIES_BY_ID[id];
  if (!s) throw new Error(`Unknown species: ${id}`);
  return s;
}

/** Art path for a given snake + stage, honoring the petted flag. */
export function stageArt(speciesId: string, stage: 'baby' | 'teen' | 'adult', petted: boolean): string {
  const s = getSpecies(speciesId);
  return petted ? s.art[stage].petted : s.art[stage].normal;
}
