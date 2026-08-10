export type Yacht = {
  id: string
  name: string
  length: string
  guests: string
  cabins: string
  builder: string
  year: string
  speed: string
  price: string
  type: 'charter' | 'sale'
  image: string
}

export const yachts: Yacht[] = [
  {
    id: 'lumière',
    name: 'Lumière',
    length: '55 m',
    guests: '12 guests',
    cabins: '6 cabins',
    builder: 'Benetti',
    year: '2021',
    speed: '16 kn',
    price: '$180,000 / week',
    type: 'charter',
    image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1200&q=80',
  },
  {
    id: 'étoile-des-mers',
    name: 'Étoile des Mers',
    length: '48 m',
    guests: '10 guests',
    cabins: '5 cabins',
    builder: 'Feadship',
    year: '2020',
    speed: '15 kn',
    price: '$145,000 / week',
    type: 'charter',
    image: 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=1200&q=80',
  },
  {
    id: 'azurite',
    name: 'Azurite',
    length: '42 m',
    guests: '8 guests',
    cabins: '4 cabins',
    builder: 'Sanlorenzo',
    year: '2022',
    speed: '18 kn',
    price: '$125,000 / week',
    type: 'charter',
    image: 'https://images.unsplash.com/photo-1566847438217-76e82d383f84?w=1200&q=80',
  },
  {
    id: 'pearl-of-prestige',
    name: 'Pearl of Prestige',
    length: '65 m',
    guests: '14 guests',
    cabins: '7 cabins',
    builder: 'Lürssen',
    year: '2019',
    speed: '17 kn',
    price: '$28.5 Million',
    type: 'sale',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
  },
  {
    id: 'serenity-wave',
    name: 'Serenity Wave',
    length: '38 m',
    guests: '8 guests',
    cabins: '4 cabins',
    builder: 'Princess',
    year: '2023',
    speed: '20 kn',
    price: '$15.2 Million',
    type: 'sale',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80',
  },
]

export function getYacht(id: string): Yacht | undefined {
  return yachts.find(y => y.id === id)
}
