export type Yacht = {
  id: string
  name: string
  length: string
  guests: string
  cabins: string
  crew: string
  builder: string
  year: string
  speed: string
  range: string
  price: string
  type: 'charter' | 'sale'
  image: string
  images: string[]
  desc: string
  longDesc: string
  amenities: string[]
}

export const yachts: Yacht[] = [
  {
    id: 'lumière',
    name: 'Lumière',
    length: '55 m',
    guests: '12 guests',
    cabins: '6 cabins',
    crew: '9 crew',
    builder: 'Benetti',
    year: '2021',
    speed: '16 kn',
    range: 'Mediterranean',
    price: '$180,000 / week',
    type: 'charter',
    image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1400&q=80',
    images: [
      'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1400&q=80',
      'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=1400&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=80',
      'https://images.unsplash.com/photo-1566847438217-76e82d383f84?w=1400&q=80',
    ],
    desc: 'A stunning 55-metre Benetti with timeless elegance.',
    longDesc: 'Lumière represents the pinnacle of Italian shipbuilding. Built by Benetti in 2021, this 55-metre superyacht offers six lavish staterooms with luxurious amenities. Her elegant design and sophisticated interior make her the perfect choice for those seeking both style and comfort. With a professional crew of nine, Lumière ensures every detail is attended to perfection.',
    amenities: ['Full beach club', 'Jacuzzi', 'Cinema room', 'Gym & spa', 'Water toy garage', 'Satellite internet', 'Chef & sommelier', 'Modern galley', 'Air conditioning', 'Stabilisers'],
  },
  {
    id: 'étoile-des-mers',
    name: 'Étoile des Mers',
    length: '48 m',
    guests: '10 guests',
    cabins: '5 cabins',
    crew: '8 crew',
    builder: 'Feadship',
    year: '2020',
    speed: '15 kn',
    range: 'Mediterranean · Caribbean',
    price: '$145,000 / week',
    type: 'charter',
    image: 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=1400&q=80',
    images: [
      'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=1400&q=80',
      'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1400&q=80',
      'https://images.unsplash.com/photo-1566847438217-76e82d383f84?w=1400&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=80',
    ],
    desc: 'Dutch elegance meets Mediterranean charm on this 48-metre Feadship.',
    longDesc: 'Étoile des Mers showcases the renowned craftsmanship of Feadship. Built in 2020, this 48-metre superyacht combines understated elegance with exceptional performance. Five guest staterooms accommodate up to ten discerning travelers. Her shallow draft enables access to exclusive anchorages, while her professional crew of eight ensures bespoke service throughout your journey.',
    amenities: ['Shallow draft design', 'Sundeck pool', 'Zero-speed stabilisers', 'Water toys garage', 'Alfresco dining', 'Wine cellar', 'Private chef', 'Satellite comms', 'Tender included', 'Air conditioning'],
  },
  {
    id: 'azurite',
    name: 'Azurite',
    length: '42 m',
    guests: '8 guests',
    cabins: '4 cabins',
    crew: '6 crew',
    builder: 'Sanlorenzo',
    year: '2022',
    speed: '18 kn',
    range: 'Mediterranean',
    price: '$125,000 / week',
    type: 'charter',
    image: 'https://images.unsplash.com/photo-1566847438217-76e82d383f84?w=1400&q=80',
    images: [
      'https://images.unsplash.com/photo-1566847438217-76e82d383f84?w=1400&q=80',
      'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=1400&q=80',
      'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1400&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=80',
    ],
    desc: 'Italian design meets sleek performance on this modern 42-metre Sanlorenzo.',
    longDesc: 'Azurite embodies Sanlorenzo\'s signature style and innovation. At 42 metres, she combines cutting-edge design with practical luxury. Four guest cabins offer maximum comfort for eight guests, while her crew of six provides attentive service. With a top speed of 18 knots, Azurite is perfect for exploring the Greek islands, French Riviera, and beyond.',
    amenities: ['Sports sundeck', 'Seabobs', 'Paddleboards', 'Kayaks', 'Snorkelling gear', 'Italian galley kitchen', 'Alfresco bar', 'Sound system', 'Stabilisers', 'Air conditioning'],
  },
  {
    id: 'pearl-of-prestige',
    name: 'Pearl of Prestige',
    length: '65 m',
    guests: '14 guests',
    cabins: '7 cabins',
    crew: '11 crew',
    builder: 'Lürssen',
    year: '2019',
    speed: '17 kn',
    range: 'Global',
    price: '$28.5 Million',
    type: 'sale',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=80',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=80',
      'https://images.unsplash.com/photo-1566847438217-76e82d383f84?w=1400&q=80',
      'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1400&q=80',
      'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=1400&q=80',
    ],
    desc: 'The flagship—a 65-metre Lürssen with helipad, beach club and cinema.',
    longDesc: 'Pearl of Prestige represents the pinnacle of ocean living. Built by Lürssen in 2019, she offers seven lavish staterooms, a full beach club at sea level, an on-deck Jacuzzi, and a helipad for seamless transfers. Her 11-strong crew ensures every detail is attended to perfection. Whether crossing the Atlantic or anchored off exclusive destinations, Pearl of Prestige sets a standard unmatched.',
    amenities: ['Helipad', 'Full beach club', 'Cinema room', 'Jacuzzi', 'Gym & spa', 'Tender garage', 'Dive equipment', 'Chef & sommelier', 'Satellite internet', 'Air conditioning'],
  },
  {
    id: 'serenity-wave',
    name: 'Serenity Wave',
    length: '38 m',
    guests: '8 guests',
    cabins: '4 cabins',
    crew: '5 crew',
    builder: 'Princess',
    year: '2023',
    speed: '20 kn',
    range: 'Day charter · Coastal',
    price: '$15.2 Million',
    type: 'sale',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1400&q=80',
    images: [
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1400&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=80',
      'https://images.unsplash.com/photo-1566847438217-76e82d383f84?w=1400&q=80',
      'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1400&q=80',
    ],
    desc: 'Speed and style distilled into 38 metres of pure luxury.',
    longDesc: 'Serenity Wave is a modern marvel of yacht engineering. Built by Princess in 2023, she reaches 20 knots for those who want to be at anchor in an exclusive cove within the hour. Four staterooms and an open-plan saloon make her as comfortable at sunset as she is thrilling at full throttle. The ideal choice for those seeking both performance and comfort.',
    amenities: ['High speed capability', 'Open deck sunbathing', 'Jet ski launch', 'Snorkelling kit', 'Day bar', 'BBQ grill', 'Wakeboard', 'Sound system', 'Air conditioning', 'Professional crew'],
  },
]

export function getYacht(id: string): Yacht | undefined {
  return yachts.find(y => y.id === id)
}
