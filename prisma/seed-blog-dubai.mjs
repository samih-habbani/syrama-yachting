// The Dubai yacht charter content cluster — 13 supporting articles that
// funnel authority and readers toward the money page
// (/yacht-charter/emirates/dubai). All category "Dubai Yacht Charter".
//
// Idempotent: upserts by slug. Run:  node prisma/seed-blog-dubai.mjs
//
// Rules applied throughout: prices are indicative ranges, never fixed
// quotes ("varies by yacht, date, season, duration, capacity, route and
// services"); no invented journey times, no invented Dubai/maritime
// regulations, no unverified legal or alcohol claims. Every article links
// to the money page with a DIFFERENT contextual anchor.
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function readingMinutes(content) {
  const words = content.reduce((n, b) => {
    if (b.type === 'list') return n + b.items.join(' ').split(/\s+/).length
    if (b.type === 'faq') return n + b.items.map((i) => `${i.q} ${i.a}`).join(' ').split(/\s+/).length
    if (b.text) return n + b.text.split(/\s+/).length
    return n
  }, 0)
  return Math.max(1, Math.round(words / 200))
}

const P = (text) => ({ type: 'paragraph', text })
const H = (text) => ({ type: 'heading', text })
const L = (items) => ({ type: 'list', items })
const Q = (text, attribution) => ({ type: 'quote', text, ...(attribution ? { attribution } : {}) })
const FAQ = (items) => ({ type: 'faq', items })

const CAT = 'Dubai Yacht Charter'
const IMG_MARINA = '/images/regions/Dubai.webp'
const IMG_SKYLINE = '/assets/hero-yacht.webp'
const IMG_DINING = '/assets/private-dining.webp'
const IMG_CREW = '/assets/crew-onboard.webp'

const posts = [
  // ============================================================= 1. NYE
  {
    slug: 'new-years-eve-yacht-charter-dubai',
    title: "New Year's Eve Yacht Charter in Dubai 2027: The Complete Guide",
    metaTitle: "New Year's Eve Yacht Charter Dubai 2027",
    metaDescription: "A New Year's Eve yacht charter in Dubai for 2027 — where to watch the fireworks from the water, how far ahead to book, and what the night costs.",
    excerpt: "Dubai puts on one of the biggest firework displays in the world, and the best seat in the city is a yacht at anchor with the skyline in front of you. Here is how to plan the night.",
    category: CAT,
    tags: ['Dubai', "New Year's Eve", 'Fireworks', 'Charter Guides'],
    coverImage: IMG_SKYLINE,
    coverImageAlt: 'A motor yacht on the water off Dubai with the skyline beyond, the setting for a New Year’s Eve charter',
    publishedAt: new Date('2026-09-08T09:00:00Z'),
    content: [
      P("On the 31st of December, Dubai turns its skyline into a stage. The Burj Khalifa, the Palm, Atlantis and the Marina towers all fire at midnight, and the whole thing is designed to be seen from a distance — which is exactly what a yacht gives you. No crowds, no three-hour wait to leave a car park afterward, and a private deck instead of a packed promenade. It is the single most-requested night of the Dubai charter year, and it books out earlier than any other."),
      P("This guide covers how to plan it: where to be on the water, how far ahead to reserve, what size of yacht suits your group, and what the night realistically costs. If you already know you want to do it, the shortcut is to [book a New Year's Eve yacht charter in Dubai](/yacht-charter/emirates/dubai) well before the autumn — availability is the whole game on this date."),
      H("Where the fireworks actually are"),
      P("Dubai runs several simultaneous displays, and which one your yacht anchors for shapes the evening:"),
      L([
        "Downtown / Burj Khalifa — the headline show, launched from the world's tallest building and the surrounding fountains. Seen from the water, this means anchoring off the Jumeirah coast with a line of sight toward Downtown.",
        "Palm Jumeirah and Atlantis — a large display over the Palm, easily viewed from a yacht anchored off the crescent or between the Palm and the mainland.",
        "Bluewaters and Ain Dubai — fireworks staged around the giant observation wheel, visible from an anchorage off JBR and Bluewaters Island.",
        "Dubai Harbour — displays close to the newer cruise and marina district, good for yachts departing from there.",
      ]),
      P("No single anchorage sees every display equally well. A captain who has run the night before will position the yacht for the show your group most wants — usually the Downtown launch or the Palm — and you will still catch the glow of the others across the water. Exact positioning depends on where marine traffic control allows yachts to hold on the night, which is confirmed close to the date."),
      H("How far ahead to book"),
      P("Earlier than feels reasonable. The best yachts for the 31st are often reserved by the previous spring, and by October the choice narrows sharply. A rough guide:"),
      L([
        "June to August — full choice of yachts, best pricing, first pick of the larger boats.",
        "September to October — still good availability, but the standout yachts start to go.",
        "November — possible, usually on smaller or less in-demand yachts, at peak pricing.",
        "December — largely sold out; what is left goes quickly and at a premium.",
      ]),
      P("If New Year's Eve on the water matters to you, treat it like booking a villa for the same week — months ahead, not weeks."),
      H("What it costs"),
      P("New Year's Eve carries a significant premium over a normal evening charter — the night is in extreme demand, crews work a public holiday, and most bookings are four to six hours to cover the build-up, midnight and the wind-down. As an indication only, expect the evening to run well above a standard sunset charter of the same yacht, with the exact figure depending on the yacht, its size, the hours booked, catering and any extras. We give every enquiry a firm, itemised quote rather than a headline rate, because the number genuinely varies. For a fuller picture of how charter pricing is built, see [our Dubai yacht rental price guide](/blog/dubai-yacht-rental-cost)."),
      P("One practical note: a minimum booking length usually applies on the 31st, longer than the two or three hours common on a normal night, because the yacht is committed to that single booking for the whole evening."),
      H("Choosing the yacht"),
      P("Group size drives this more than anything. A couple or a small group of friends is comfortable on a mid-sized flybridge yacht where the whole party can be on the top deck for midnight. A larger celebration — twenty, thirty, forty guests — needs a yacht with enough open deck that nobody is watching the fireworks through a doorway, and enough interior and catering space for a proper dinner beforehand. [Our guide to choosing a yacht size in Dubai](/blog/dubai-yacht-size-guide) walks through the difference between a yacht's maximum capacity and the number it comfortably hosts for an event."),
      H("The shape of the night"),
      P("A typical New Year's Eve charter boards in the early-to-mid evening from the Marina or Dubai Harbour, cruises the skyline while it is still light enough to photograph, then moves to the chosen anchorage as the city fills up. Dinner and drinks are served on board while you wait for midnight — no restaurant booking, no queue. At midnight the yacht is already in position; the crew simply cut the music and let the sky do the work. Afterward, most groups stay out for another hour while the shoreline traffic clears, then return to a quiet marina."),
      H("Practical things to sort early"),
      L([
        "Catering — decide between a full seated dinner and a standing canapé service. Both need to be briefed weeks ahead for the 31st.",
        "Guest list and IDs — confirm the final headcount early; some marinas tighten access procedures on the night.",
        "Transfers — marina parking and drop-off around New Year's Eve is congested. Arrange cars to and from, and build in extra time.",
        "Decoration and a cake, if it doubles as a birthday or anniversary — see [our Dubai birthday yacht guide](/blog/dubai-birthday-yacht-rental).",
      ]),
      P("When you are ready, tell an advisor your group size and rough budget and ask what is still available for the 31st — the answer changes week to week from September onward. You can start from the [Dubai charter fleet](/yacht-charter/emirates/dubai)."),
      FAQ([
        { q: "How early should I book a yacht for New Year's Eve in Dubai?", a: "As early as you can — the best yachts for the 31st are often reserved months ahead, and choice narrows sharply from October. Summer gives you full availability and the best pricing." },
        { q: "Can you see the Burj Khalifa fireworks from a yacht?", a: "Yes, from an anchorage off the Jumeirah coast with a line of sight toward Downtown. The captain positions the yacht for the display your group most wants; you will also catch the glow of the Palm and Bluewaters shows across the water. Final positioning depends on where yachts are permitted to hold on the night." },
        { q: "How much does a New Year's Eve yacht charter in Dubai cost?", a: "It carries a significant premium over a normal evening charter, and most bookings run four to six hours. The exact figure depends on the yacht, its size, the hours, catering and extras, so we quote each enquiry individually rather than publish a rate." },
        { q: "How long is a New Year's Eve charter?", a: "Usually longer than a standard evening charter — often a four to six-hour minimum — because the yacht is committed to your booking for the whole evening, covering the build-up, midnight and the wind-down." },
      ]),
    ],
  },

  // ================================================== 2. PRICE GUIDE
  {
    slug: 'dubai-yacht-rental-cost',
    title: 'How Much Does It Cost to Rent a Yacht in Dubai?',
    metaTitle: 'Dubai Yacht Rental Prices: 2026 Cost Guide',
    metaDescription: 'How much does it cost to rent a yacht in Dubai? Indicative hourly and daily prices by yacht size, and what moves the total up or down.',
    excerpt: "There is no single price for a yacht in Dubai — it depends on the yacht, the hours, the season and what you add on. Here is how the number is actually built, with realistic ranges.",
    category: CAT,
    tags: ['Dubai', 'Pricing', 'Charter Guides'],
    coverImage: IMG_MARINA,
    coverImageAlt: 'Charter yachts of different sizes berthed in Dubai Marina',
    publishedAt: new Date('2026-09-04T09:00:00Z'),
    content: [
      P("\"How much is it to rent a yacht in Dubai\" is the first question almost everyone asks, and the honest answer is a range, not a figure. A small boat for a couple of hours and a large one for a full day are different products at different prices, and the same yacht costs more in peak season than in summer. What follows is how the price is built, with indicative bands — treat every number here as a starting point, not a quote."),
      P("If you would rather skip to a real figure for your group and date, an advisor can quote a [luxury yacht charter in Dubai](/yacht-charter/emirates/dubai) within a day, with the yacht, the hours and the extras itemised."),
      H("How Dubai charter pricing works"),
      P("Almost all Dubai charters are priced by the hour, with a minimum booking — commonly two to three hours. The hourly rate is set by:"),
      L([
        "Size and type of yacht — length, guest capacity, and whether it is an entry-level flybridge boat or a large, recently refitted yacht.",
        "Season — October to April (peak visitor season) is priced higher than the hot summer months.",
        "Day and time — weekends, public holidays and sunset slots command more than a weekday morning.",
        "Duration — longer bookings often carry a lower effective hourly rate; a full day is not simply the hourly rate multiplied out.",
        "Extras — catering, decoration, additional water toys, and anything sourced specially for your booking.",
      ]),
      H("Indicative price bands"),
      P("The following are broad ranges for the hourly rate of the yacht itself, based on the kind of inventory active in Dubai. They are indicative only and change with season, demand and the specific yacht:"),
      L([
        "Smaller yachts (roughly up to 60 feet, comfortable for a small group) — the entry point of the market, the most common choice for a short cruise or a small celebration.",
        "Mid-sized yachts (roughly 65 to 90 feet, suited to 20 to 40 guests) — the bracket most group bookings land in, with a real step up in deck space and interior comfort.",
        "Large yachts (roughly 90 to 120 feet) — a significant jump in price, for larger events, longer charters or guests who want a genuinely spacious boat.",
        "Superyachts (120 feet and above) — the top of the Dubai market, priced accordingly, usually booked for major occasions, corporate events or multi-day charters.",
      ]),
      P("Rather than publish specific figures that would be out of date within a season, we quote each enquiry against live availability. A short cruise on a small yacht is an accessible afternoon out; a superyacht for an evening is a five-figure commitment before extras. Everything in between scales with the yacht and the hours."),
      H("Superyacht charter pricing in Dubai"),
      P("Superyachts (roughly 120 feet and up) are a different conversation. Dubai has a genuine fleet of them, and they are chartered for milestone birthdays, weddings, corporate hospitality and New Year's Eve. Pricing reflects the size of the operation — a large permanent crew, significant fuel use, and the scale of catering and setup a big event needs. Expect the yacht alone to run into five figures for an evening, with a day charter more again, and the final number heavily influenced by the hours, the guest count and how elaborate the event is. If a superyacht is what you have in mind, tell an advisor the occasion and the headcount and ask for two or three specific options with full costs — it is not a category where a headline rate means much."),
      H("What pushes the total up"),
      L([
        "Peak season and peak slots — a Friday sunset in February versus a Tuesday morning in July is a meaningful difference on the same yacht.",
        "Catering to a standard — a full seated dinner with a specific menu costs more than a soft-drinks-and-canapés service.",
        "Overtime — going past the booked hours is charged pro-rata, and it adds up on a larger yacht.",
        "Bespoke extras — themed decoration, a specific cake, a photographer, a DJ, additional jet skis brought in for the booking.",
      ]),
      P("The costs that sit on top of the headline rate are covered in detail in [our guide to Dubai yacht charter extra costs](/blog/dubai-yacht-charter-hidden-costs), and what comes as standard is covered in [what's included in a Dubai yacht rental](/blog/dubai-yacht-rental-whats-included)."),
      H("How to keep it sensible"),
      P("If the budget matters, the levers are straightforward: charter on a weekday rather than a weekend, book a morning or daytime slot instead of sunset, choose a slightly older well-kept yacht over the newest hull, keep catering simple, and be precise about the hours so you are not paying for time you do not use. None of that compromises the experience. A well-run three-hour cruise on a comfortable mid-sized yacht is, for most groups, exactly the right amount of boat."),
      P("For a broader view of how long to book, see [our guide to yacht rental duration in Dubai](/blog/how-long-rent-yacht-dubai). When you want a real number, [start with the fleet](/yacht-charter/emirates/dubai) and give an advisor your date and group size."),
      FAQ([
        { q: "How much does it cost to rent a yacht in Dubai for a few hours?", a: "A short cruise on a smaller yacht is the accessible end of the market; a mid-sized yacht for a group is a clear step up; and a superyacht for an evening runs into five figures before extras. All prices are indicative and vary by yacht, season, day, time and duration — we quote each enquiry against live availability." },
        { q: "Is a full-day yacht charter in Dubai cheaper per hour than a short one?", a: "Often, yes. Longer bookings tend to carry a lower effective hourly rate, so a full day is usually not simply the hourly rate multiplied out. The exact structure depends on the yacht and operator." },
        { q: "What is the minimum yacht rental time in Dubai?", a: "Commonly two to three hours, though it varies by yacht and can be longer for peak dates such as New Year's Eve. Confirm the minimum for your chosen yacht before booking." },
        { q: "Do Dubai yacht prices change with the season?", a: "Yes. October to April is peak visitor season and priced higher than the hot summer months. Weekends, public holidays and sunset slots also carry more than a weekday morning." },
      ]),
    ],
  },

  // ================================================== 3. ROUTES
  {
    slug: 'dubai-yacht-charter-routes',
    title: 'The Best Yacht Charter Routes in Dubai',
    metaTitle: 'Best Yacht Routes in Dubai: Marina to Burj Al Arab',
    metaDescription: 'The best yacht routes in Dubai — Marina, JBR, Bluewaters, Palm Jumeirah, Atlantis, Burj Al Arab — and which fit a 2, 3 or 4-hour charter.',
    excerpt: "Dubai's coast is a run of landmarks rather than a coastline of villages. How much of it you see comes down to how long you book and where you leave from.",
    category: CAT,
    tags: ['Dubai', 'Routes', 'Dubai Marina', 'Palm Jumeirah', 'Charter Guides'],
    coverImage: IMG_SKYLINE,
    coverImageAlt: 'A yacht on the water off Dubai with the Burj Al Arab in the distance',
    publishedAt: new Date('2026-08-31T09:00:00Z'),
    content: [
      P("A yacht charter in Dubai is a tour of the city's front. Everything worth seeing from the water sits along one stretch of coast — the Marina and JBR, Bluewaters and Ain Dubai, Palm Jumeirah and the Atlantis, the Burj Al Arab — and a charter threads as much of it as the clock allows. This is a guide to how those routes actually work, and what fits a two, three or four-hour booking."),
      P("One thing to be clear about up front: journey times on the water are not fixed. They depend on the yacht's cruising speed, the wind and sea state on the day, any marine-traffic or operational restrictions in force, and — significantly — where you depart from. A route that is comfortable from Dubai Harbour might be tight from the far end of the Marina. Your captain plans the actual run on the day; what follows is the shape of it."),
      H("The landmarks, roughly in order along the coast"),
      L([
        "Dubai Marina — a canyon of towers around a man-made canal. Most charters begin here, and the cruise out through the Marina mouth is part of the experience.",
        "JBR (Jumeirah Beach Residence) — the beachfront strip immediately south of the Marina, busy with swimmers and beach clubs.",
        "Bluewaters Island and Ain Dubai — the giant observation wheel on its own island, just offshore of JBR.",
        "Palm Jumeirah — the palm-shaped archipelago, with the Atlantis and Royal Atlantis at the tip of the fronds. Yachts cruise along the crescent or between the Palm and the mainland.",
        "Burj Al Arab — the sail-shaped hotel on its own island off Jumeirah, and Madinat Jumeirah just behind it.",
        "Dubai Harbour — the newer marina and cruise district between the Marina and Palm, an alternative departure point.",
      ]),
      H("A 2-hour charter"),
      P("Two hours is the shortest common booking and it is a focused loop rather than a grand tour. From the Marina, a typical two-hour cruise covers the Marina itself, out past JBR and Bluewaters, and a look at the near side of Palm Jumeirah before turning back. It is enough for a first taste, a sunset drink, or a compact celebration — but it does not leave much room to also reach the Burj Al Arab and linger, and there is limited time for a swim stop. If two hours is all you want, keep the route tight and let the captain choose the highlights."),
      H("A 3-hour charter"),
      P("Three hours is the sweet spot for most groups. It comfortably covers the Marina, JBR, Bluewaters and Palm Jumeirah with time to slow down along the Atlantis, and — conditions and departure point permitting — a look toward the Burj Al Arab, plus a stop to swim or use the water toys. It is long enough that the day has a rhythm to it rather than feeling like a lap. Most sunset and birthday charters book three hours for exactly this reason."),
      H("A 4-hour charter (or longer)"),
      P("Four hours removes the compromises. You can take in the full run of landmarks, spend real time at anchor near the Palm or off Jumeirah, have a proper swim, serve a full meal on board, and still not feel rushed on the way back. Beyond four hours you are into full-day territory, which adds the option of heading further along the coast to quieter anchorages, or simply spending a long, slow afternoon in one spot. For how the price scales with the hours, see [our Dubai yacht rental price guide](/blog/dubai-yacht-rental-cost)."),
      H("Marina or Harbour: it changes the route"),
      P("Where you leave from shifts the maths. Departing from Dubai Harbour puts you closer to the Palm and the Burj Al Arab, so more of a short charter is spent at the landmarks rather than getting to them. Departing from deep in Dubai Marina adds transit time through the Marina channel at the start and end. Neither is wrong — the Marina cruise is a genuine highlight — but it is worth knowing when you pick a yacht. [Our comparison of Dubai Marina and Dubai Harbour](/blog/dubai-marina-vs-dubai-harbour) goes into this properly."),
      H("Swimming and anchor stops"),
      P("Most routes can include a stop to swim, usually off the Palm or in a permitted area along the coast, at the captain's discretion and depending on the sea state and the day's conditions. It is not guaranteed on every charter — see [can you swim during a yacht charter in Dubai](/blog/can-you-swim-yacht-charter-dubai) — but if a swim matters to your group, say so when you book so the route is planned around it."),
      P("To see the yachts that run these routes and talk through the right one for your group, [explore yachts available for charter in Dubai](/yacht-charter/emirates/dubai)."),
    ],
  },

  // ================================================== 4. DURATION
  {
    slug: 'how-long-rent-yacht-dubai',
    title: 'How Long Should You Rent a Yacht in Dubai? 2, 3 or 4 Hours',
    metaTitle: 'How Many Hours to Rent a Yacht in Dubai?',
    metaDescription: 'Is a 2, 3 or 4-hour yacht charter enough in Dubai? What each duration realistically covers, from the Marina to the Burj Al Arab, and how to choose.',
    excerpt: "The most common mistake on a Dubai charter is booking two hours to save money and spending most of it in transit. Here is how to pick the right length.",
    category: CAT,
    tags: ['Dubai', 'Duration', 'Charter Guides'],
    coverImage: IMG_MARINA,
    coverImageAlt: 'Charter yachts moored in Dubai Marina, ready for hourly bookings',
    publishedAt: new Date('2026-08-27T09:00:00Z'),
    content: [
      P("Dubai charters are booked by the hour, usually with a two or three-hour minimum, and the length you choose does more to shape the day than the yacht does. Book too short and the cruise is over before it settles; book longer than the group's attention span and you are paying for time spent looking at the same view. This guide is about matching the hours to what you actually want from the afternoon."),
      P("If you already know the occasion — a sunset drink, a birthday, a proposal — the [Dubai charter fleet](/yacht-charter/emirates/dubai) page and an advisor can tell you the length most groups book for it. What follows is the reasoning."),
      H("2 hours: a taste, not a tour"),
      P("Two hours is the entry point. It works for a first cruise, a compact sunset outing, or a small celebration where the boat is the setting rather than the whole event. From the Marina, two hours covers the Marina, JBR, Bluewaters and a look at the near side of Palm Jumeirah before turning back."),
      P("What it does not do well: reach the Burj Al Arab and linger, include a relaxed swim stop, or serve a full meal without feeling rushed. If you are set on two hours, keep the route tight and let the captain choose the highlights rather than trying to see everything. And factor in the departure point — two hours from deep inside the Marina spends more time in transit than two hours from Dubai Harbour."),
      H("3 hours: the one most people should book"),
      P("Three hours is the length that fits the most occasions. It covers the full run of landmarks — Marina, JBR, Bluewaters, the Palm and Atlantis, and a look toward the Burj Al Arab, conditions and departure point permitting — with time to slow down, drop anchor, swim or use the water toys, and have drinks and food on board without watching the clock."),
      P("Most sunset charters, birthday charters and first-time group bookings land on three hours. It is long enough that the afternoon has a shape to it, and short enough that nobody is bored. If you are unsure, this is the safe choice."),
      H("4 hours or more: when the boat is the event"),
      P("Four hours removes the trade-offs entirely. You get the full coastline, real time at anchor, a proper swim, a full meal served on board, and an unhurried return. It suits larger celebrations, groups who want the day to be genuinely relaxed, and anyone combining a cruise with a sit-down dinner."),
      P("Beyond four hours you are into half-day and full-day charters. These open up options a short booking cannot — heading further along the coast, spending a long afternoon anchored in one spot, or building the charter around a specific event with setup time before guests arrive. A full day is usually priced better per hour than a short booking, so if the group has the appetite for it, the maths is not as punishing as it looks. See [our price guide](/blog/dubai-yacht-rental-cost) for how duration affects the rate."),
      H("How the group size changes the answer"),
      P("A couple or a small group can do a lot in two or three hours. A large group needs more time simply because everything takes longer — boarding, serving food, moving people between decks, getting everyone into and out of the water. For twenty or more guests, three hours is the practical minimum and four is more comfortable. [Our yacht size guide](/blog/dubai-yacht-size-guide) covers how capacity and comfort interact."),
      H("A note on overtime"),
      P("Going past the booked hours is possible on the day if the yacht's schedule allows, and it is charged pro-rata. It is not a penalty, but it is easy to drift into — the afternoon is going well, nobody wants to turn back — so if there is any chance you will want longer, it is cheaper to book it up front than to extend on the water. This is one of the costs covered in [our guide to Dubai charter extra costs](/blog/dubai-yacht-charter-hidden-costs)."),
      P("When you are ready, tell an advisor the occasion and the group size and ask what length most bookings run to — then book that, not the minimum. [Start with the fleet](/yacht-charter/emirates/dubai)."),
    ],
  },

  // ================================================== 5. WHAT'S INCLUDED
  {
    slug: 'dubai-yacht-rental-whats-included',
    title: "What's Actually Included When You Rent a Yacht in Dubai?",
    metaTitle: "What's Included in a Dubai Yacht Rental?",
    metaDescription: "What's included when you rent a yacht in Dubai — captain, crew, fuel, water, soft drinks — and what's usually an add-on. Confirm before booking.",
    excerpt: "Most Dubai charters include more than people expect and less than the glossy listing implies. Here is what typically comes with the yacht, and what does not.",
    category: CAT,
    tags: ['Dubai', 'Pricing', 'Inclusions', 'Charter Guides'],
    coverImage: IMG_CREW,
    coverImageAlt: 'A yacht crew on the marina dock before guests come aboard',
    publishedAt: new Date('2026-08-23T09:00:00Z'),
    content: [
      P("When you charter a yacht in Dubai, the headline rate buys the yacht, the crew to run it, and the fuel to cruise the standard route. Most reputable operators also include some basic hospitality. Beyond that, things vary a lot from yacht to yacht — which is why the honest answer to \"what's included\" is always \"most of the essentials, but confirm the specifics for your yacht before you book.\""),
      P("This guide covers what is typical. For what tends to sit on top of the price, read it alongside [our guide to Dubai charter extra costs](/blog/dubai-yacht-charter-hidden-costs); and to [book a yacht charter in Dubai](/yacht-charter/emirates/dubai) with the inclusions confirmed in writing, an advisor will itemise them in your quote."),
      H("Typically included"),
      L([
        "The yacht and a professional crew — at minimum a captain and a deckhand; larger yachts carry more crew, often a dedicated host or hostess.",
        "Fuel for the standard cruising route within your booked hours. Going significantly beyond the usual area, or a lot of high-speed running, can add a fuel surcharge.",
        "Bottled water and a selection of soft drinks. The quantity and range vary — some yachts stock generously, others provide a basic amount.",
        "Ice, glassware, basic tableware and towels.",
        "Use of the yacht's shaded areas, sound system, and any standard swimming equipment it carries (a swim ladder, noodles, sometimes a paddleboard).",
        "Basic safety equipment and the crew's briefing.",
      ]),
      H("Sometimes included, sometimes not — always ask"),
      L([
        "Light refreshments — some yachts include a fruit platter or simple snacks; a full menu is almost always extra.",
        "Water toys beyond the basics — a jet ski, a large inflatable, a towable ring. Some yachts carry them at no extra cost, many charge for use or fuel.",
        "Music beyond the yacht's own system — a microphone, a proper party setup, a DJ.",
        "Simple decoration for a birthday or occasion — occasionally a courtesy, usually a paid add-on.",
      ]),
      H("Not included as standard"),
      L([
        "Catering — anything beyond soft drinks. A canapé service, a barbecue, a seated dinner or an external caterer is quoted separately. See our note on bringing your own below.",
        "Alcohol — where it is offered, it is generally arranged and charged by the operator; policies on bringing your own vary by yacht and operator, so [confirm before booking](/blog/bring-food-drinks-yacht-dubai).",
        "Bespoke decoration, flowers, a cake, a photographer or videographer.",
        "Marina transfers — getting your group to and from the berth.",
        "Overtime beyond your booked hours, charged pro-rata.",
        "The crew gratuity, which is customary and discretionary.",
      ]),
      H("Bringing your own food and drink"),
      P("Whether you can bring your own catering or drinks onto a Dubai charter depends entirely on the yacht and the operator — some are happy for you to, some provide catering only, and some allow food but not outside beverages. It is not something to assume. [Our full guide to bringing food and drinks on a Dubai yacht](/blog/bring-food-drinks-yacht-dubai) covers how to check, and it should always be confirmed in writing before you book."),
      H("How to avoid surprises"),
      P("Ask for the inclusions in writing, itemised. A good quote will list what comes with the yacht, what the catering package contains, what the water toys cost, and what happens if you run over your hours. If a listing just says \"all-inclusive\" with no detail, ask what that actually means — it rarely covers a full dinner and premium extras. For the standard costs that sit on top, see [our extra costs guide](/blog/dubai-yacht-charter-hidden-costs); for how the base rate is built, see [the price guide](/blog/dubai-yacht-rental-cost)."),
      P("When you enquire, an advisor will confirm exactly what your chosen yacht includes before anything is booked. [Start with the Dubai fleet](/yacht-charter/emirates/dubai)."),
      FAQ([
        { q: "Is fuel included in a Dubai yacht charter?", a: "Fuel for the standard cruising route within your booked hours is normally included. Going well beyond the usual area, or a lot of high-speed running, can add a fuel surcharge. Confirm the standard route for your yacht." },
        { q: "Are food and drinks included when you rent a yacht in Dubai?", a: "Bottled water and soft drinks are usually included. Anything more — a canapé service, a barbecue, a seated dinner, alcohol — is quoted separately. Ask for the catering options in writing." },
        { q: "Is the captain included in the price?", a: "Yes. Yachts in Dubai are chartered with a professional crew — at minimum a captain and a deckhand, more on larger yachts. Bareboat charter without a crew is not the norm here." },
        { q: "Are water toys included?", a: "Basic swimming equipment often is. Jet skis, large inflatables and towable rings vary — some yachts include them, many charge for use or fuel. Confirm which toys your yacht carries and what they cost." },
      ]),
    ],
  },

  // ================================================== 6. YACHT SIZE
  {
    slug: 'dubai-yacht-size-guide',
    title: 'Choosing the Right Yacht Size in Dubai for Your Group',
    metaTitle: 'Dubai Yacht Size Guide: 10 to 50 Guests',
    metaDescription: 'How to choose a yacht size in Dubai for 10, 20, 30 or 50 guests — legal capacity vs comfortable capacity, layout, catering and event space.',
    excerpt: "A yacht's maximum capacity and the number it comfortably hosts for an event are two different figures. Booking to the first is how a celebration ends up cramped.",
    category: CAT,
    tags: ['Dubai', 'Yacht Size', 'Group Charter', 'Events', 'Charter Guides'],
    coverImage: IMG_MARINA,
    coverImageAlt: 'Charter yachts of varying sizes berthed side by side in Dubai Marina',
    publishedAt: new Date('2026-08-19T09:00:00Z'),
    content: [
      P("Group organisers usually start with a number — \"we're 25\" — and ask which yacht fits 25. It is the wrong first question. Every yacht has a maximum capacity, set by its licence, and a much lower number that it actually hosts well for an event with food, music and people moving around. Book to the maximum and the celebration feels like a full lift. This guide is about finding the right yacht for the way your group will really use it."),
      P("Once you have a realistic sense of the size you need, an advisor can match it to the [Dubai charter fleet](/yacht-charter/emirates/dubai) and the occasion."),
      H("Three different capacity numbers"),
      L([
        "Legal maximum capacity — the number the yacht is licensed to carry, including crew. This is a hard limit, not a target.",
        "Comfortable cruising capacity — the number that can all be seated or standing comfortably with the yacht under way, without anyone perched on a step.",
        "Comfortable event capacity — lower again. This is the number for a party with a catering setup, a bar area, a cake table, music and people circulating. The catering and setup eat into the deck space that would otherwise hold guests.",
      ]),
      P("As a rough rule, the comfortable event capacity of a Dubai charter yacht is often around 60 to 70 percent of its licensed maximum. A yacht licensed for 40 hosts a seated dinner for perhaps 25 to 30 without it feeling tight."),
      H("What actually determines how many a yacht holds well"),
      L([
        "Open deck area — the aft deck and any bow seating are where a party lives in Dubai's climate. A yacht with a large, shaded aft deck hosts far more comfortably than one with the same length but a small cockpit.",
        "Flybridge — a good upper deck effectively doubles the usable social space and is where most guests want to be for the skyline and the sunset.",
        "Indoor/outdoor split — for a summer charter or an evening event, the air-conditioned salon matters. A yacht where the interior can hold half the group in comfort gives you a fallback the outdoor-only boats do not.",
        "Layout for service — whether the crew can serve and clear without walking through the middle of the party. On a well-designed yacht the catering flows from a side galley; on a poorly designed one it crosses the main deck constantly.",
        "Bathrooms — an underrated constraint. Thirty guests and one accessible heads makes for queues.",
      ]),
      H("By group size"),
      P("These are starting points, not rules — the right yacht always depends on the specific boat's layout and how formal the event is."),
      H("Around 10 guests"),
      P("A small group has a lot of choice. A mid-sized flybridge yacht in the 55 to 70-foot range is comfortable, with everyone able to be together on one deck, and the pricing is at the accessible end of the market. This is the easiest group size to charter for in Dubai."),
      H("Around 20 guests"),
      P("Now deck space starts to matter. Look at yachts in roughly the 70 to 90-foot range with a proper aft deck and a flybridge. Twenty is comfortable for a cruise on many of these; for a seated dinner, lean toward the larger end of that bracket."),
      H("Around 30 guests"),
      P("This is where you need a yacht licensed comfortably above 30 — often in the 90 to 110-foot range — so that 30 guests plus a catering setup still leaves room to move. A standing reception works on a well-laid-out yacht around this size; a formal seated dinner for 30 needs genuine large-yacht space."),
      H("Around 50 guests"),
      P("Fifty guests with any kind of event setup is large-yacht or superyacht territory — typically 110 feet and up, with multiple decks. At this size the yacht is a venue, and the questions become the ones you would ask of any venue: catering capacity, service flow, bar setup, restrooms, and whether the whole group can gather in one place for a toast. See [our price guide](/blog/dubai-yacht-rental-cost) for what this bracket costs."),
      H("For an event, brief the setup early"),
      P("If the charter is a birthday, a corporate evening or a proposal, the layout question is really an event-planning question. Tell the operator what the setup involves — a DJ booth, a seated dinner, a cake table, a photo backdrop, a bar — and let them tell you which yachts can host it well. A yacht that is perfect for a cruise can be wrong for a sit-down dinner of the same headcount. [Our Dubai birthday yacht guide](/blog/dubai-birthday-yacht-rental) covers this from the event side."),
      P("When you enquire, give an advisor the guest count and a sentence on the occasion, and ask for the comfortable event capacity of each yacht suggested — not just its licensed maximum. [Browse the Dubai charter fleet](/yacht-charter/emirates/dubai) to see the range."),
    ],
  },

  // ================================================== 7. SUNSET
  {
    slug: 'dubai-sunset-yacht-charter',
    title: 'Sunset Yacht Charter in Dubai: When to Go and What to Expect',
    metaTitle: 'Sunset Yacht Charter in Dubai: Time & Route',
    metaDescription: 'A sunset yacht charter in Dubai — the best departure time by season, how the route is shaped, and what to expect on the water.',
    excerpt: "The hour before sunset is when Dubai's skyline looks the way it does in the photographs. A sunset charter is built around catching it, and the timing shifts through the year.",
    category: CAT,
    tags: ['Dubai', 'Sunset', 'Charter Guides'],
    coverImage: IMG_SKYLINE,
    coverImageAlt: 'A motor yacht cruising the Dubai coast toward the Burj Al Arab in low evening light',
    publishedAt: new Date('2026-08-15T09:00:00Z'),
    content: [
      P("A sunset yacht charter is the most-booked slot in Dubai, and for a simple reason: the light. For roughly an hour on either side of sunset, the towers turn gold, then pink, then light up against a dark sky, and the heat of the day drops to something pleasant. It is the window the whole city photographs, and from the water you have it to yourself."),
      P("This guide covers when to go, how the evening is shaped, and what to expect. If you already want to book one, an advisor can match a yacht to your group from the [Dubai charter fleet](/yacht-charter/emirates/dubai) and set the departure time around the sunset for your date."),
      H("When sunset actually is"),
      P("Dubai's sunset time moves by well over an hour across the year — earlier in winter, later in summer. In the cooler months it falls in the late afternoon; in high summer it is well into the evening. Because of that, there is no single \"sunset charter time.\" When you book, the operator sets the departure so that you are on the water and in position for the light, with time before it to cruise and time after it to enjoy the illuminated skyline. Always confirm the exact departure time for your specific date rather than assuming a standard slot."),
      H("The best months for it"),
      P("Sunset charters run year-round, but the experience changes with the season:"),
      L([
        "October to April — the prime window. Comfortable temperatures from departure onward, clear evenings, and the sunset falls at a civilised hour. This is peak season, so book ahead, especially for weekends.",
        "May and September — shoulder months. Still very good in the evening once the sun is low, though warm earlier on.",
        "June to August — the sea is warm and the light is still beautiful, but the first part of a charter can be hot and humid until the sun drops. A later departure, closer to sunset, is more comfortable in these months.",
      ]),
      H("How the route works"),
      P("A sunset charter is not a fixed itinerary. The captain shapes the run around the light, the wind and sea conditions on the day, any operational restrictions in force, and where you depart from. A common pattern from the Marina: cruise out through the Marina channel and along JBR and Bluewaters while the sun is still up, move toward the Palm and the Atlantis as it drops, hold in a good position for the sunset itself, then cruise slowly back past the lit-up skyline. But the specifics — how far you get toward the Burj Al Arab, whether there is time to anchor and swim — depend on the length of the charter and the conditions. If a swim before sunset matters to you, say so when booking so the route allows for it; whether it happens on the day is still the captain's call, based on the sea state. See [can you swim during a Dubai charter](/blog/can-you-swim-yacht-charter-dubai)."),
      H("How long to book"),
      P("Two hours is the minimum and works for a compact sunset outing, but it is tight — much of it is spent getting into position and back. Three hours is the length most sunset charters book: enough to cruise properly before the light, hold for the sunset, and enjoy the skyline afterward without rushing. Four hours adds a relaxed anchor stop and a full meal on board. [Our duration guide](/blog/how-long-rent-yacht-dubai) covers the trade-offs."),
      H("What to expect on board"),
      P("Drinks and food are served as you cruise — soft drinks and water come with the yacht, catering and any alcohol arranged with the operator. The crew handles the timing so you are settled with a drink when the light peaks. It is an unhurried, social couple of hours rather than an activity; the point is the view and the company. Bring a light layer for after sunset in the cooler months — it can turn breezy on the water once the sun is down."),
      H("Sunset for an occasion"),
      P("The sunset slot is the natural choice for a birthday, an anniversary or a proposal, because the setting does the work. For a proposal specifically, the timing matters more — you want to be in position, with the light right, at a moment the crew can quietly set up for. [Our Dubai yacht proposal guide](/blog/dubai-yacht-proposal-guide) covers how to plan that."),
      P("To book a sunset charter, tell an advisor your date and group size and let them set the departure time around the sunset. [Start with the Dubai fleet](/yacht-charter/emirates/dubai)."),
    ],
  },

  // ================================================== 8. BIRTHDAY
  {
    slug: 'dubai-birthday-yacht-rental',
    title: 'Renting a Yacht in Dubai for a Birthday: A Planning Guide',
    metaTitle: 'Dubai Birthday Yacht Rental: Cost & Planning',
    metaDescription: 'Planning a birthday on a yacht in Dubai: how many guests fit which yacht, what it costs, decoration and catering, and timing. A practical guide.',
    excerpt: "A birthday on the water is one of the easiest events to host in Dubai — no venue hunt, no guest list at the door. It still needs planning, and most of it is about the yacht.",
    category: CAT,
    tags: ['Dubai', 'Birthday', 'Celebrations', 'Charter Guides'],
    coverImage: IMG_DINING,
    coverImageAlt: 'A plated course served with wine, of the kind arranged aboard a chartered yacht for a celebration',
    publishedAt: new Date('2026-08-11T09:00:00Z'),
    content: [
      P("A yacht is close to the perfect birthday venue in Dubai. The setting is spectacular and needs no decoration to justify itself, the group is contained so nobody drifts off, and the whole thing has a natural start and end. Compared with booking a restaurant or a beach club, it is simpler than it looks. This guide covers the decisions that matter: the yacht size, the timing, the catering, and the budget."),
      P("When you are ready, an advisor can put together options from the [Dubai charter fleet](/yacht-charter/emirates/dubai) based on your headcount and the kind of evening you want."),
      H("Start with the guest count — honestly"),
      P("The single biggest driver of cost and choice is how many people are coming. Get a real number before you look at yachts, because the yacht that hosts 15 well is a very different boat, and price, from the one that hosts 35. And book for the number that will actually turn up, not the number on the invite list."),
      P("A crucial point: a yacht's licensed maximum is not its comfortable capacity for a party. With a catering setup, a bar area, a cake table and people circulating, the comfortable number is often 60 to 70 percent of the licensed maximum. [Our yacht size guide](/blog/dubai-yacht-size-guide) covers this in detail — it is worth reading before you commit."),
      H("Timing: sunset is the default for a reason"),
      P("Most birthday charters book a sunset slot, three hours, because the light does half the work and the temperature is comfortable. The exact departure time depends on the date — Dubai's sunset shifts by more than an hour across the year — so the operator sets it so you are on the water for the golden hour. A daytime charter works too, especially with children in the group or if swimming is central to the plan; it is usually a little cheaper and the water time is better. An after-dark charter, purely for the lit-up skyline, is the third option. See [our sunset charter guide](/blog/dubai-sunset-yacht-charter) and [duration guide](/blog/how-long-rent-yacht-dubai)."),
      H("Catering"),
      P("Soft drinks and water come with the yacht. Everything else is arranged with the operator and priced separately. The usual options:"),
      L([
        "A canapé and finger-food service — the most popular for a birthday, keeps everyone standing and mingling.",
        "A barbecue or grazing setup — relaxed, works well on a daytime charter.",
        "A seated dinner — for a smaller, more formal group; needs a yacht with the interior or covered deck space for a proper table.",
        "An external caterer — possible on many yachts if you want a specific restaurant or cuisine, subject to the operator's approval.",
      ]),
      P("Brief the catering weeks ahead, not days. And confirm in writing whether you can bring your own cake, or specific drinks — policies vary by yacht and operator. See [bringing food and drinks on a Dubai yacht](/blog/bring-food-drinks-yacht-dubai)."),
      H("Decoration, music and extras"),
      P("Most operators can arrange birthday decoration — balloons, a banner, table styling — as a paid add-on, or you can bring your own and have the crew set it up before guests board. A proper sound system is usually on board; a microphone for speeches, or a DJ, is an extra. A photographer is worth considering if the birthday is a milestone. None of this is complicated, but it all needs to be agreed before the day."),
      H("What it costs"),
      P("A birthday charter costs the yacht's hourly rate for the booked hours, plus catering, plus any decoration, photography or DJ. As an indication, a mid-sized yacht for a group of 20 to 30 for a three-hour sunset cruise with a canapé service is a mid-market event budget in Dubai — more than a restaurant table for the same group, comparable to a good beach club buyout, and the setting is in a different league. A superyacht for a milestone birthday of 40-plus is a five-figure evening. All figures depend on the yacht, the date, the hours and the catering — an advisor will itemise a real quote. See [our Dubai yacht rental price guide](/blog/dubai-yacht-rental-cost) and [extra costs guide](/blog/dubai-yacht-charter-hidden-costs)."),
      H("A simple planning timeline"),
      L([
        "6–8 weeks out — confirm the date and guest count, book the yacht, choose the slot.",
        "4 weeks out — finalise catering, decoration, music, photographer.",
        "1 week out — confirm the final headcount, arrange transfers to the marina, send guests the meeting point and time.",
        "On the day — arrive 20 minutes early; the crew will have the yacht set up.",
      ]),
      P("To start, tell an advisor the birthday date, the guest count and roughly what you have in mind, and ask for two or three yachts with full costs. [Charter a yacht in Dubai for a private celebration](/yacht-charter/emirates/dubai)."),
    ],
  },

  // ================================================== 9. HIDDEN COSTS
  {
    slug: 'dubai-yacht-charter-hidden-costs',
    title: 'Dubai Yacht Charter: The Extra Costs to Budget For',
    metaTitle: 'Dubai Yacht Charter Hidden Costs Explained',
    metaDescription: 'The extra costs on a Dubai yacht charter beyond the headline rate — premium catering, decoration, overtime, transfers, setup and gratuity.',
    excerpt: "The hourly rate is the start of the number, not the end of it. Here is what commonly sits on top, so the final quote holds no surprises.",
    category: CAT,
    tags: ['Dubai', 'Pricing', 'Budgeting', 'Charter Guides'],
    coverImage: IMG_CREW,
    coverImageAlt: 'A yacht crew on the marina dock preparing for a charter',
    publishedAt: new Date('2026-08-07T09:00:00Z'),
    content: [
      P("A Dubai charter quote can look simple — a yacht, an hourly rate, a number of hours — and then grow as the details come in. None of the additions are unreasonable, and a good operator lists them up front, but it helps to know what they are before you compare quotes. This is the companion to [our main Dubai yacht rental price guide](/blog/dubai-yacht-rental-cost): that one covers the base rate, this one covers everything that sits on top."),
      P("The short version: the yacht and crew and standard fuel are included; catering beyond soft drinks, anything bespoke, and going over your hours are not. To [plan a yacht charter in Dubai](/yacht-charter/emirates/dubai) with a clean, itemised quote, an advisor will break all of this out before you commit."),
      H("Catering"),
      P("The biggest variable after the yacht itself. Bottled water and soft drinks come as standard; a canapé service, a barbecue, a seated dinner or an external caterer are all priced per head and vary widely with the menu. A simple grazing setup for a small group is modest; a multi-course dinner with a specific menu for 30 is a significant line. Decide the catering level early — it moves the total more than an extra hour on the yacht often does."),
      H("Alcohol"),
      P("Where alcohol is offered, it is generally arranged and charged by the operator, either as a package or by consumption. Whether you can bring your own varies by yacht and operator and should be confirmed in writing before booking — see [bringing food and drinks on a Dubai yacht](/blog/bring-food-drinks-yacht-dubai). Either way, budget for it as a separate line, not part of the base rate."),
      H("Overtime"),
      P("Going past your booked hours is charged pro-rata, at the yacht's hourly rate or sometimes a little above it. It is easy to drift into — the evening is going well and nobody wants to head back — and on a larger yacht an extra hour is a real number. If there is any chance you will want longer, book it up front; extending on the day is always more expensive per hour. See [our duration guide](/blog/how-long-rent-yacht-dubai)."),
      H("Fuel beyond the standard route"),
      P("Fuel for the usual cruising area within your hours is normally included. A charter that ranges much further along the coast, or does a lot of high-speed running (for water sports, for example), can attract a fuel surcharge. Ask what the \"standard route\" is for your yacht so you know where the line is."),
      H("Water toys"),
      P("Basic swimming equipment is often included. A jet ski, a large towable, a seabob or an inflatable park is frequently an add-on — either a flat hire fee or a charge for the fuel and the crew time to run it. If water toys are important to your group, get the specific list and prices for your yacht in writing."),
      H("Decoration, styling and entertainment"),
      L([
        "Birthday or event decoration — balloons, banners, table styling — as a package or bring-your-own with crew setup.",
        "Flowers and a cake — sourced by the operator or brought aboard, subject to approval.",
        "A DJ, a live musician, or a microphone-and-speaker setup beyond the yacht's own system.",
        "A photographer or videographer.",
      ]),
      P("Individually small, collectively meaningful for a styled event. [Our birthday guide](/blog/dubai-birthday-yacht-rental) covers how these add up for a celebration."),
      H("Marina transfers and parking"),
      P("Getting your group to and from the berth is on you unless you arrange transfers through the operator. Marina parking can be tight and, around peak dates, congested — factor in cars, a drop-off point and extra time, particularly for a large group or an evening charter."),
      H("The crew gratuity"),
      P("Customary and discretionary. There is no fixed percentage in the Dubai day-charter market the way there is for week-long Mediterranean charters, but a tip for a crew that made the afternoon is normal and appreciated. Budget something for it rather than being caught out at the end."),
      H("How to get a quote with no surprises"),
      P("Ask for everything itemised: the yacht and hours, the catering package with its menu, the water toys with prices, the overtime rate, and whether transfers are included. If a quote is a single \"all-inclusive\" figure, ask exactly what it covers — it rarely includes a full dinner and premium extras. A transparent operator will give you the breakdown without being pushed."),
      P("When you enquire, an advisor will build the quote line by line so you see the real total before anything is confirmed. [Start with the Dubai fleet](/yacht-charter/emirates/dubai)."),
    ],
  },

  // ================================================== 10. PROPOSAL
  {
    slug: 'dubai-yacht-proposal-guide',
    title: 'How to Plan a Marriage Proposal on a Yacht in Dubai',
    metaTitle: 'Dubai Yacht Proposal Guide: Yacht, Time, Route',
    metaDescription: 'Planning a proposal on a yacht in Dubai — the right yacht for two, the best sunset timing, a private route, and details the crew can arrange.',
    excerpt: "A proposal on the water gives you privacy, a setting that needs no explaining, and a crew who can quietly handle the details. The planning is mostly about timing.",
    category: CAT,
    tags: ['Dubai', 'Proposal', 'Romantic', 'Celebrations', 'Charter Guides'],
    coverImage: IMG_SKYLINE,
    coverImageAlt: 'A motor yacht on calm water off Dubai at golden hour, a setting for a proposal',
    publishedAt: new Date('2026-08-03T09:00:00Z'),
    content: [
      P("If you are going to propose in Dubai, a private yacht solves most of the problems at once. You are not fighting for a table with a view, there is no crowd to work around, and the crew can set up a moment — a chilled bottle, flowers, the music cut at the right time — without your partner noticing anything until it happens. What is left to plan is the timing and the yacht, and this guide covers both."),
      P("To [arrange a private yacht charter in Dubai](/yacht-charter/emirates/dubai) for this, tell an advisor it is a proposal when you enquire — it changes which yacht and which slot they will recommend, and it means the crew are briefed."),
      H("The yacht: smaller is better"),
      P("This is one occasion where you do not want a big boat. A proposal for two — or two with a small group joining afterward to celebrate — works best on a comfortable, well-appointed mid-sized yacht where the crew presence is discreet and there is a private spot on the bow or the flybridge for the moment itself. A large yacht for two feels empty and makes it harder for the crew to be unobtrusive. If friends or family are joining to celebrate after she says yes, they can board at the marina afterward, or you can book a slightly larger yacht and keep them below or on the aft deck until the moment has passed."),
      H("The timing: sunset, in position, briefed"),
      P("The sunset slot is the obvious choice, and the details matter more than for a normal charter:"),
      L([
        "Dubai's sunset time shifts by more than an hour through the year. Confirm the exact time for your date and build the plan backward from it.",
        "You want the yacht in a good position — a calm spot with the skyline or the Burj Al Arab as the backdrop — a few minutes before the light peaks, not still cruising toward it.",
        "Brief the captain and crew precisely: where you want to be, roughly when you will propose, and the signal for them to bring out whatever you have arranged. Good crews do this often and are very smooth about it.",
        "Have a weather fallback in mind. If the sea is up or visibility is poor, the captain will suggest a sheltered alternative — better to know that is possible than to be thrown on the day.",
      ]),
      P("Route and conditions are always the captain's call on the day — the sea state, the wind and any operational restrictions decide where the yacht can actually hold. Plan the intent, and let the crew execute it. See [our sunset charter guide](/blog/dubai-sunset-yacht-charter) for how the evening is shaped."),
      H("What the crew can arrange"),
      L([
        "A chilled bottle of champagne or something non-alcoholic, ready to open the moment it is done.",
        "Flowers, and simple styling of a table or the bow.",
        "The sound system cued — a particular song ready to play, or the music cut to silence at the right moment.",
        "A discreet photographer, either a crew member with a good camera or a professional who boards for the charter. If you want proper photos of the moment, arrange this specifically; it is not standard.",
        "A cake or dessert for afterward.",
      ]),
      P("All of this is arranged in advance with the operator and priced as extras — see [our guide to Dubai charter extra costs](/blog/dubai-yacht-charter-hidden-costs). Keep the list short; the setting is already doing the heavy lifting."),
      H("How long to book"),
      P("Two hours is enough for a proposal with a drink and a cruise afterward. Three hours is better if a small group is joining to celebrate, or if you want a relaxed dinner on board once the pressure is off. See [our duration guide](/blog/how-long-rent-yacht-dubai)."),
      H("Practical points"),
      L([
        "Book earlier than you think, especially for a weekend or a peak-season date — the best small yachts for a sunset slot go first.",
        "Keep your story straight if it is a surprise: \"a friend organised a sunset cruise\" is enough.",
        "Confirm the marina, the berth and the meeting time in writing, and arrange the car so you are not stressed about parking beforehand.",
        "Tell the advisor about any allergies or preferences for the champagne, flowers or cake when you book.",
      ]),
      P("When you are ready, tell an advisor the date and that it is a proposal, and let them recommend the yacht and the timing. [Start with the Dubai fleet](/yacht-charter/emirates/dubai)."),
    ],
  },

  // ================================================== 11. MARINA VS HARBOUR
  {
    slug: 'dubai-marina-vs-dubai-harbour',
    title: 'Dubai Marina vs Dubai Harbour: Which to Depart From',
    metaTitle: 'Dubai Marina vs Dubai Harbour for Yacht Charter',
    metaDescription: 'Dubai Marina or Dubai Harbour — where should your yacht charter depart from? How the two compare on access, parking, and the view heading out.',
    excerpt: "Most Dubai charters leave from one of two places, and the choice quietly changes your route, your transit time and your first half hour on the water.",
    category: CAT,
    tags: ['Dubai', 'Dubai Marina', 'Dubai Harbour', 'Charter Guides'],
    coverImage: IMG_MARINA,
    coverImageAlt: 'Yachts berthed along the waterfront in Dubai Marina',
    publishedAt: new Date('2026-07-30T09:00:00Z'),
    content: [
      P("When you book a yacht in Dubai, the departure point comes with the yacht — you do not usually choose it separately. But it is worth understanding the difference, because it shapes the charter. The two main options are Dubai Marina and Dubai Harbour, a few kilometres apart along the same coast, and each has a different character as a starting point."),
      P("If the departure point matters to your plan, mention it when you [enquire about a yacht charter in Dubai](/yacht-charter/emirates/dubai) and an advisor can steer you toward yachts based where you want."),
      H("Dubai Marina"),
      P("The Marina is the established heart of Dubai's charter scene — a dense, dramatic canal lined with towers, with the largest concentration of charter yachts in the city. Departing from here:"),
      L([
        "The cruise out is part of the show. You spend the first 10 to 20 minutes moving through the Marina channel between the towers before you reach open water — a genuine highlight, especially at sunset.",
        "That transit time counts against a short charter. On a two-hour booking, the Marina channel at the start and end eats into your time at the landmarks.",
        "It is the most familiar drop-off for guests and drivers, well signed, with plenty of restaurants nearby if people gather beforehand.",
        "Parking and traffic around the Marina can be heavy at peak times, particularly Friday and Saturday evenings.",
      ]),
      H("Dubai Harbour"),
      P("Dubai Harbour is the newer marina district between the Marina and Palm Jumeirah, next to Bluewaters and the cruise terminal. Departing from here:"),
      L([
        "You are closer to the Palm, the Atlantis and the Burj Al Arab from the moment you leave, so more of a short charter is spent at the landmarks rather than getting to them.",
        "There is no long channel transit — you reach open water quickly.",
        "The area is newer and generally less congested than the Marina, with modern parking, though it is a slightly less familiar address for some drivers.",
        "You miss the Marina channel cruise, which for some people is a reason to prefer the Marina.",
      ]),
      H("Which is better for you"),
      L([
        "Short charter (2 hours), want maximum time at the landmarks — Dubai Harbour has the edge, less transit.",
        "Want the Marina channel cruise as part of the experience — Dubai Marina, clearly.",
        "Sunset charter, 3 hours — either works well; the Marina cruise at golden hour is spectacular, and 3 hours absorbs the transit comfortably.",
        "Large group, want an easy, familiar meeting point — the Marina is the more established address, though Dubai Harbour is straightforward too.",
        "Heading toward the Palm and Burj Al Arab specifically, on limited time — Dubai Harbour.",
      ]),
      P("For how departure point interacts with the route in more detail, see [our guide to the best yacht routes in Dubai](/blog/dubai-yacht-charter-routes), and [our duration guide](/blog/how-long-rent-yacht-dubai) for how the hours affect the trade-off."),
      H("What about the other marinas?"),
      P("A small number of charters run from elsewhere — Dubai Creek Harbour on the Creek side, or berths attached to specific hotels and clubs. These are the exception rather than the rule, and they mostly matter if a particular yacht you want happens to be based there, or if your charter is built around a location on the Creek rather than the coastal skyline. For the standard Dubai charter experience — Marina, Palm, Burj Al Arab — the departure point is going to be the Marina or Dubai Harbour, and the comparison above is the one that counts."),
      H("Access, parking and the meeting point"),
      P("Whichever marina your yacht leaves from, treat the shore-side logistics as part of the plan. Both areas get busy in the evenings and around weekends; parking fills up and drop-off points get congested. Arrange cars to and from rather than relying on finding a space, build in 20 to 30 minutes of buffer before your departure time, and send every guest the exact berth or meeting point — \"Dubai Marina\" alone is a large area, and a group trying to find the yacht in the last ten minutes is a stressful way to start. A good operator gives you a precise pin and a contact number for the day."),
      H("The practical answer"),
      P("In practice, you pick the yacht first — for its size, condition and price — and take the departure point that comes with it. If two comparable yachts are available, one at each marina, and you have a strong preference (a short charter focused on the Palm, or conversely the Marina cruise), that can be the tie-breaker. Tell your advisor and they will factor it in. For most people, the yacht is the decision and the marina is a detail — but it is a detail worth understanding before you commit."),
      P("To see which yachts depart from where, [explore the Dubai charter fleet](/yacht-charter/emirates/dubai)."),
    ],
  },

  // ================================================== 12. FOOD & DRINKS
  {
    slug: 'bring-food-drinks-yacht-dubai',
    title: 'Can You Bring Your Own Food and Drinks on a Yacht in Dubai?',
    metaTitle: 'Can You Bring Food & Drinks on a Yacht in Dubai?',
    metaDescription: 'Can you bring your own food and drinks on a Dubai yacht charter? It depends on the yacht and operator. What to check before you book.',
    excerpt: "The answer is: sometimes, and it depends entirely on the yacht and the operator. This is not a detail to assume — confirm it in writing before you book.",
    category: CAT,
    tags: ['Dubai', 'Catering', 'Food and Drink', 'Charter Guides'],
    coverImage: IMG_DINING,
    coverImageAlt: 'A plated fine-dining course served with wine aboard a chartered yacht',
    publishedAt: new Date('2026-07-26T09:00:00Z'),
    content: [
      P("This is one of the most common questions before a Dubai charter, and there is no universal answer. Some operators are happy for you to bring your own food and drinks. Some provide catering only and do not allow outside food. Some allow food but not outside beverages. It varies yacht by yacht and company by company, and the only reliable approach is to ask and get the answer in writing before you book."),
      P("What is consistent: soft drinks and water come with almost every charter, and anything beyond that — a full menu, alcohol, a cake — is either arranged with the operator or, where permitted, brought by you. To [plan your Dubai yacht charter](/yacht-charter/emirates/dubai) with the catering settled, raise it in your first enquiry."),
      H("What's usually provided"),
      P("As standard, most Dubai charter yachts include bottled water and a selection of soft drinks, ice, glassware and basic tableware. Some include light snacks or a fruit platter as a courtesy. A proper meal — canapés, a barbecue, a seated dinner — is a paid catering package, priced per head, and needs to be arranged in advance. See [what's included in a Dubai yacht rental](/blog/dubai-yacht-rental-whats-included)."),
      H("Bringing your own food"),
      P("Where an operator allows it, bringing your own food can make sense for a specific reason — a particular restaurant your group loves, a homemade dish, dietary requirements the yacht's caterer cannot easily meet, or simply keeping the budget down. If you are allowed to:"),
      L([
        "Check whether the crew will serve and clear it, or whether you are self-service. Some crews will plate and serve outside food; some will not handle it at all.",
        "Ask about galley and fridge space — a yacht's kitchen is small, and there may be limits on what can be kept cold or reheated.",
        "Confirm any rules on packaging, glass, or particularly messy foods.",
        "Bring serving equipment if the yacht will not provide it for outside catering.",
      ]),
      H("A cake"),
      P("A birthday or celebration cake is the most common thing people want to bring, and many operators allow it even when they do not permit a full outside meal. Confirm it specifically, ask the crew to keep it refrigerated and bring it out at the right moment, and check whether candles are permitted (open flames are sometimes restricted). See [our Dubai birthday yacht guide](/blog/dubai-birthday-yacht-rental)."),
      H("Drinks and alcohol"),
      P("Policies on beverages, and on alcohol in particular, vary by yacht and operator and depend on their own licensing arrangements. Some operators supply alcohol as a package or by consumption; some permit guests to bring their own; some do not. This is not something to assume or improvise — ask the operator directly what is and is not permitted on their yacht, and follow their guidance. Do not bring anything aboard that they have not confirmed is allowed."),
      P("Whatever the arrangement, treat what the operator tells you as the rule for that yacht. If you want alcohol served and the operator provides it, agree the package or the pricing when you book — it is a separate line from the yacht, covered in [our extra costs guide](/blog/dubai-yacht-charter-hidden-costs)."),
      H("The practical approach"),
      P("For most charters, the simplest path is to take the operator's catering — it is designed for the yacht's galley and service, and it removes the logistics. Bring your own only when there is a real reason to, and only after the operator has confirmed in writing that you can, what the crew will and will not do with it, and any conditions attached. Get the catering plan agreed weeks before the charter, not in the days before."),
      P("When you enquire, an advisor will tell you exactly what your chosen yacht's operator allows. [Start with the Dubai fleet](/yacht-charter/emirates/dubai)."),
      FAQ([
        { q: "Can you bring your own food on a yacht charter in Dubai?", a: "It depends on the yacht and the operator. Some allow it, some provide catering only, and some allow food but not outside drinks. Always confirm in writing before booking, and ask whether the crew will serve and clear outside food or whether it is self-service." },
        { q: "Can you bring a birthday cake onto a Dubai yacht?", a: "Usually yes — many operators allow a cake even when they do not permit a full outside meal. Confirm it specifically, ask the crew to refrigerate it, and check whether candles are permitted, as open flames are sometimes restricted." },
        { q: "Is food included in a Dubai yacht charter?", a: "Bottled water and soft drinks are normally included; some yachts add light snacks. A full meal — canapés, a barbecue, a seated dinner — is a paid catering package arranged in advance." },
        { q: "Can you bring your own drinks on a Dubai yacht?", a: "Policies vary by yacht and operator, and depend on their own licensing. Ask the operator directly what is permitted on their yacht and follow their guidance — do not bring anything aboard they have not confirmed is allowed." },
      ]),
    ],
  },

  // ================================================== 13. SWIMMING
  {
    slug: 'can-you-swim-yacht-charter-dubai',
    title: 'Can You Swim During a Yacht Charter in Dubai?',
    metaTitle: 'Can You Swim on a Yacht Charter in Dubai?',
    metaDescription: "Can you swim during a yacht charter in Dubai? Usually yes, at the captain's discretion and in permitted areas — it depends on the route and the day.",
    excerpt: "Most Dubai charters can include a swim stop, but it is not guaranteed on every trip. Whether it happens comes down to the route, the conditions and the captain's call.",
    category: CAT,
    tags: ['Dubai', 'Swimming', 'Water Toys', 'Charter Guides'],
    coverImage: IMG_SKYLINE,
    coverImageAlt: 'A yacht at anchor on calm water off the Dubai coast',
    publishedAt: new Date('2026-07-22T09:00:00Z'),
    content: [
      P("People often assume a yacht charter automatically means jumping off the back into the sea. In Dubai it usually can, but there are more variables than on a Mediterranean charter, and it is worth understanding them so the day meets expectations. The honest summary: a swim stop is possible on most charters, in permitted areas, when conditions allow and the captain judges it safe — but it is not a fixed part of every trip."),
      P("If swimming is central to your plan, say so when you book so the yacht and route are chosen with it in mind. An advisor can point you to the yachts and itineraries that make the most of it — [start with the Dubai charter fleet](/yacht-charter/emirates/dubai)."),
      H("What determines whether you can swim"),
      L([
        "The permitted area — swimming happens where it is allowed, typically at anchor off the Palm or in designated spots along the coast, away from shipping lanes and marina channels. The captain knows where these are.",
        "Sea and weather conditions — wind, swell and current on the day. A choppy sea or a strong current means no swim, or a shorter one, for safety.",
        "The captain's decision — the final call is always the captain's, based on conditions, traffic and the group. This is not negotiable and it is the right way round.",
        "Maritime rules and any operational restrictions in force — these can change and take priority over the plan.",
        "The itinerary and time — a two-hour charter packed with landmarks may not have room for a proper anchor stop. A three or four-hour charter usually does.",
      ]),
      H("Where the swim stops usually are"),
      P("The most common swim spot is at anchor near Palm Jumeirah, where the water is calm and clean and the yacht can hold position comfortably. There are other permitted areas along the Jumeirah coast. The captain chooses based on the conditions and where the yacht is in the route — you cannot swim just anywhere, and trying to would put the yacht somewhere it should not be. See [our guide to Dubai yacht routes](/blog/dubai-yacht-charter-routes) for how anchor stops fit into a charter."),
      H("How long a swim stop lasts"),
      P("On a three-hour charter with a swim stop planned, expect roughly 20 to 40 minutes at anchor for swimming and water toys, depending on how the rest of the route runs and the conditions. A four-hour charter can allow a longer, more relaxed stop. If you want a genuinely unhurried swim, book the extra hour rather than trying to fit it into a short charter — see [our duration guide](/blog/how-long-rent-yacht-dubai)."),
      H("Water toys"),
      P("Most yachts carry a swim ladder and basic equipment. Beyond that — a paddleboard, a large inflatable, a jet ski, a seabob — varies by yacht, and using them may carry a charge or require calm conditions. If water toys matter, get the specific list and any costs for your yacht in writing. See [what's included in a Dubai yacht rental](/blog/dubai-yacht-rental-whats-included) and [the extra costs guide](/blog/dubai-yacht-charter-hidden-costs)."),
      H("Practical points for a swim charter"),
      L([
        "Bring swimwear and a towel per person — yachts provide towels but often a limited number.",
        "Bring reef-safe sun protection; the sun on the water is stronger than the air temperature suggests.",
        "Tell the crew if anyone is a weak swimmer or nervous in open water — they will keep an eye out and can provide a flotation aid.",
        "Expect the captain to brief you before the swim: where the ladder is, how far to stay from the yacht, and the signal to come back aboard.",
      ]),
      H("The realistic expectation"),
      P("Book a three or four-hour charter, tell the operator you want to swim, choose a yacht with good swim access and a shaded deck to dry off on, and you will very likely get a swim stop. Just hold it loosely: if the sea is up on the day, the captain will shorten or skip it, and that is the call working as it should. The skyline is not going anywhere either way."),
      P("To plan a charter with swimming built in, tell an advisor and [explore the Dubai fleet](/yacht-charter/emirates/dubai)."),
      FAQ([
        { q: "Can you swim during a yacht charter in Dubai?", a: "Usually yes — most charters can include a swim stop at anchor, typically off Palm Jumeirah or another permitted spot along the coast. It depends on the route, the sea conditions on the day, maritime rules, and the captain's judgement. It is not guaranteed on every trip." },
        { q: "How long do you get to swim on a Dubai yacht charter?", a: "On a three-hour charter with a swim stop planned, expect roughly 20 to 40 minutes at anchor, conditions permitting. A four-hour charter allows a longer stop. For an unhurried swim, book the extra hour rather than squeezing it into a short charter." },
        { q: "Where can you swim on a Dubai yacht charter?", a: "In permitted areas the captain knows — most often at anchor near Palm Jumeirah, where the water is calm, and other designated spots along the Jumeirah coast, away from shipping lanes and marina channels." },
        { q: "What if the sea is too rough to swim?", a: "The captain will shorten or skip the swim stop. The decision is always the captain's, based on wind, swell, current and traffic — which is the safe way round. Treat a swim as likely but not guaranteed." },
      ]),
    ],
  },
]

async function main() {
  for (const post of posts) {
    const data = { ...post, readingMinutes: readingMinutes(post.content), status: 'published' }
    const saved = await prisma.yachtingBlogPost.upsert({
      where: { slug: post.slug },
      create: data,
      update: data,
    })
    const words = post.content.reduce((n, b) => n + ((b.type === 'list' ? b.items.join(' ') : b.type === 'faq' ? b.items.map((i) => `${i.q} ${i.a}`).join(' ') : (b.text || '')).split(/\s+/).filter(Boolean).length), 0)
    console.log(`✓ ${String(saved.id).padStart(3)}  /blog/${saved.slug.padEnd(38)}  ${saved.readingMinutes} min  ${words}w`)
  }
  const total = await prisma.yachtingBlogPost.count()
  console.log(`\nyachting_blog_post now holds ${total} rows.`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
