import React from 'react'
import path from 'path'
import { Document, Page, Text, View, Image, StyleSheet, renderToBuffer } from '@react-pdf/renderer'

// SYRAMA's company stamp, with the manager's signature over it — dropped
// straight into the "For SYRAMA" signature box instead of a blank line.
const STAMP_PATH = path.join(process.cwd(), 'public/assets/contracts/syrama-stamp.png')

export interface ContractPdfData {
  bookingReference: string
  agreementDate: string
  clientFullName: string
  clientEmail: string
  clientPhone: string
  clientCountry: string | null
  yachtModel: string
  yachtOperator: string | null
  experienceDateLabel: string
  embarkation: string
  disembarkation: string
  numberOfGuests: string
  plannedItinerary: string
  deposit: string
  paymentDeadline: string
  totalPrice: string
  // Date the underlying reservation was created — shown as the SYRAMA
  // signature date, not the day the PDF happens to be (re)generated.
  syramaSignatureDate: string
}

const TBC = '[To be confirmed]'

const styles = StyleSheet.create({
  page: {
    fontSize: 9.5,
    fontFamily: 'Helvetica',
    color: '#1a1a1a',
    paddingTop: 70,
    paddingBottom: 56,
    paddingHorizontal: 44,
  },
  header: {
    position: 'absolute',
    top: 24,
    left: 44,
    right: 44,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#b8974a',
    paddingBottom: 8,
  },
  headerLeft: { fontSize: 8, fontFamily: 'Helvetica-Bold', letterSpacing: 1, color: '#b8974a' },
  headerRight: { fontSize: 8, color: '#666666' },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 44,
    right: 44,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#dddddd',
    paddingTop: 8,
    fontSize: 7.5,
    color: '#888888',
  },
  titleBlock: { alignItems: 'center', marginBottom: 24 },
  brand: { fontSize: 26, fontFamily: 'Helvetica-Bold', letterSpacing: 4, color: '#1a1a1a', marginBottom: 6 },
  subtitle: { fontSize: 11, color: '#555555', letterSpacing: 0.5 },
  metaTable: { borderWidth: 1, borderColor: '#dddddd', marginTop: 18, marginBottom: 18 },
  metaRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#dddddd' },
  metaRowLast: { flexDirection: 'row' },
  metaLabel: { width: '35%', backgroundColor: '#f5f5f0', padding: 6, fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: '#444444' },
  metaValue: { width: '65%', padding: 6, fontSize: 8.5 },
  sectionTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#1a1a1a', marginTop: 14, marginBottom: 6 },
  paragraph: { fontSize: 9, lineHeight: 1.5, color: '#333333', marginBottom: 4 },
  table: { borderWidth: 1, borderColor: '#dddddd', marginTop: 6, marginBottom: 6 },
  tableHeader: { backgroundColor: '#1a1a1a', padding: 6 },
  tableHeaderText: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: '#ffffff', letterSpacing: 0.5 },
  tableRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#eeeeee' },
  tableLabel: { width: '32%', padding: 6, fontSize: 8.5, color: '#555555' },
  tableValue: { width: '68%', padding: 6, fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: '#1a1a1a' },
  pageNumber: { position: 'absolute', bottom: 24, right: 44, fontSize: 7.5, color: '#888888' },
  signatureBlock: { flexDirection: 'row', gap: 16, marginTop: 22 },
  signatureCol: { flex: 1, borderWidth: 1, borderColor: '#dddddd', padding: 10 },
  signatureHeading: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: '#1a1a1a', marginBottom: 8, textTransform: 'uppercase' },
  signatureLine: { fontSize: 8.5, color: '#333333', marginBottom: 14, marginTop: 14 },
})

function Header() {
  return (
    <View style={styles.header} fixed>
      <Text style={styles.headerLeft}>SYRAMA</Text>
      <Text style={styles.headerRight}>PRIVATE YACHT EXPERIENCE AGREEMENT</Text>
    </View>
  )
}

function Footer() {
  return (
    <>
      <View style={styles.footer} fixed>
        <Text>SYRAMA CONCIERGE SERVICES - FZCO | Trade Licence No. 74796 | Dubai, UAE</Text>
      </View>
      <Text style={styles.pageNumber} fixed render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
    </>
  )
}

function InfoTable({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <View style={styles.table}>
      <View style={styles.tableHeader}>
        <Text style={styles.tableHeaderText}>{title}</Text>
      </View>
      {rows.map(([label, value], i) => (
        <View style={styles.tableRow} key={i}>
          <Text style={styles.tableLabel}>{label}</Text>
          <Text style={styles.tableValue}>{value}</Text>
        </View>
      ))}
    </View>
  )
}

// The full numbered clauses (1-28) — reproduced verbatim from the SYRAMA
// Private Yacht Experience Agreement template supplied by the client, so
// every generated contract carries the exact same legal wording.
const CLAUSE_1_PURPOSE = {
  title: '1. PURPOSE OF THE AGREEMENT',
  body: 'The Client appoints SYRAMA to design, arrange and coordinate a private yacht experience (the "Experience"). SYRAMA acts as the Client\'s principal point of contact and may coordinate yacht selection, itinerary, onboard arrangements, catering, beverages, water activities, transportation, reservations and other requested concierge services. Maritime navigation and technical operation are performed exclusively by the Yacht Operator, Captain and crew. SYRAMA is not the registered owner, shipowner, Captain, crew employer or technical operator of the yacht.',
}

// Clause 3 — clause 1 (Purpose) renders before Experience Details and
// clause 2 (Experience Details) is the data table above, matching the
// template's own page-1 layout.
const CLAUSE_3_SERVICES = {
  title: '3. SERVICES INCLUDED',
  body: 'The Experience includes the captain and crew, the yacht rental, fuel, all applicable fees and taxes, the cruise experience, and snorkeling equipment. Any other water toys and equipment are offered as a separate, additional service and are not included unless expressly stated otherwise in the Booking Summary. Any other item not expressly stated as included is excluded unless otherwise confirmed in writing by SYRAMA.',
}

// Clause 4 (Price) needs the booking's own total price, so it renders
// dynamically alongside clause 3 rather than from the static list below.
function priceClauseBody(totalPrice: string) {
  return `The total price for this Experience is ${totalPrice}, taxes included. SYRAMA may provide a single consolidated price incorporating yacht costs, operational costs, third-party services, concierge services, coordination fees and SYRAMA's commercial remuneration. SYRAMA is not required to disclose supplier rates, margins, commissions or commercial arrangements except where required by applicable law.`
}

// Clauses 5 onward.
const CLAUSES: { title: string; body: string }[] = [
  {
    title: '5. PAYMENT AND CONFIRMATION',
    body: 'The booking is confirmed once this Agreement is accepted and the Deposit stated in the Booking Summary, if any, is received in cleared funds. The balance shall be paid in cleared funds no later than the Payment Deadline stated in the Booking Summary. Failure to pay by the agreed deadline may result in cancellation, subject to applicable law.',
  },
  {
    title: '6. ROLE OF SYRAMA',
    body: 'SYRAMA designs, arranges and coordinates the Experience and remains the Client\'s primary concierge contact. Certain services necessarily require specialist or licensed providers. Those providers remain responsible for services falling within their professional and operational control. SYRAMA shall exercise reasonable care in selecting and coordinating them but does not assume statutory or professional responsibilities legally belonging to the Yacht Operator, Captain, crew or another licensed provider.',
  },
  {
    title: '7. YACHT OPERATION AND CAPTAIN\'S AUTHORITY',
    body: 'The Yacht Operator is responsible for the yacht\'s seaworthiness, legal compliance, registration, required insurance, maintenance, technical operation, crew qualifications, navigation and mandatory safety equipment. The Captain has final authority aboard the yacht and may alter the itinerary, delay departure, return to port or terminate navigation when reasonably required for safety, weather, sea conditions, technical reasons, authority instructions, port restrictions or applicable law. All guests must comply with the Captain\'s safety instructions.',
  },
  {
    title: '8. WEATHER AND SEA CONDITIONS',
    body: 'The Client may not unilaterally decide to cancel the Experience on grounds of weather or sea conditions. The Captain has final authority to determine whether weather and sea conditions permit safe navigation. Where the Captain determines that navigation may proceed safely, the booking remains valid and applicable, and a decision by the Client not to participate shall be treated as a cancellation by the Client under Clause 9. Where the Captain determines that the Experience cannot safely or lawfully take place due to adverse weather, unsafe or impracticable sea conditions, or another event of force majeure preventing navigation, the Client shall be entitled to a full refund, less any applicable bank or transaction fees. The Captain\'s determination as to safety, weather and sea conditions is final.',
  },
  {
    title: '9. CANCELLATION BY THE CLIENT',
    body: 'Cancellation by the Client is subject to the following schedule, calculated by reference to the scheduled charter date: more than 3 months before the charter date, no amount is retained; between 3 months and 1 month before the charter date, 30% of the total price is retained; between 30 and 15 days before the charter date, 50% of the total price is retained; between 14 and 8 days before the charter date, 80% of the total price is retained; less than 8 days before the charter date, or in the event of a no-show, 100% of the total price is retained and no refund is due. For bookings coinciding with a high-demand event (including, without limitation, the Monaco Grand Prix, the Monaco Yacht Show, the Cannes Film Festival or a similar event), the booking shall be non-refundable where expressly stated in the Booking Summary. Bank charges and transaction fees may be deducted from any refund due. Special Cancellation Terms may apply to this booking only where expressly stated in the Booking Summary and accepted by the Client prior to payment or confirmation, in which case such Special Cancellation Terms shall prevail over the schedule above.',
  },
  {
    title: '10. CANCELLATION BY THE YACHT OPERATOR',
    body: 'If the Yacht Operator cancels the Experience, or the booked yacht becomes unavailable due to breakdown, technical failure, force majeure or another circumstance outside SYRAMA\'s reasonable control, SYRAMA may propose a reasonably comparable substitute yacht or equivalent service. Where no reasonably comparable alternative can be offered and the Experience cannot take place, the Client shall be entitled to a full refund of the amounts paid for the affected service.',
  },
  {
    title: '11. DELAYS',
    body: 'The Client must arrive at the agreed embarkation time. Client-caused delay does not automatically extend the booking. Additional time, crew overtime, port costs or other properly incurred charges resulting from the Client\'s delay may be charged to the Client.',
  },
  {
    title: '12. CLIENT AND GUEST RESPONSIBILITIES',
    body: 'The Client is responsible for ensuring that all guests comply with this Agreement and reasonable instructions from SYRAMA, the Yacht Operator, Captain and crew. Illegal substances, threatening or violent conduct, harassment, deliberate damage and unsafe conduct are prohibited. The Captain may refuse boarding or terminate the Experience where conduct creates a material safety, legal or operational risk.',
  },
  {
    title: '13. CHILDREN',
    body: 'Children remain under the supervision and responsibility of their parent or responsible adult at all times. The Client must advise SYRAMA in advance of the number and ages of children. Any safety or life-jacket requirements imposed by the Captain must be followed.',
  },
  {
    title: '14. WATER SPORTS AND EQUIPMENT',
    body: 'Water-sports equipment may only be used with the Captain\'s authorization and in compliance with local regulations. Certain activities may require licences, permits, age restrictions or specialist operators. Availability is not guaranteed unless expressly confirmed.',
  },
  {
    title: '15. DAMAGE',
    body: 'The Client is responsible, subject to applicable law, for damage directly caused by the intentional act, negligence or misconduct of the Client or guests. Any damage claim should, where practicable, be supported by evidence and the associated repair or replacement cost.',
  },
  {
    title: '16. PERSONAL BELONGINGS',
    body: 'The Client and guests remain responsible for personal belongings and valuables. Neither SYRAMA nor the Yacht Operator shall be responsible for loss or damage except to the extent caused by proven fault and where liability cannot legally be excluded.',
  },
  {
    title: '17. INSURANCE',
    body: 'The Yacht Operator warrants that the yacht is covered by all insurance required by applicable law for the contemplated commercial operation and navigation. The Yacht Operator remains responsible for maintaining such insurance throughout the Experience.',
  },
  {
    title: '18. FORCE MAJEURE',
    body: 'Neither SYRAMA nor the Yacht Operator shall be considered in breach where performance is prevented or materially affected by circumstances outside reasonable control, including severe weather, unsafe sea conditions, natural disaster, fire, governmental restriction, port closure, maritime-authority decision, strike, war, civil unrest or another event legally qualifying as force majeure. SYRAMA shall use reasonable efforts to reorganize, reschedule or provide an appropriate alternative.',
  },
  {
    title: '19. LIABILITY',
    body: 'SYRAMA remains responsible for the concierge and coordination services it directly undertakes. The Yacht Operator remains responsible for maritime and technical operation and obligations imposed upon it by applicable maritime law. SYRAMA shall not be liable for matters falling exclusively within the operational control of the Yacht Operator, Captain, crew or another independent provider, except where loss results from SYRAMA\'s own proven fault. Nothing excludes liability or mandatory consumer rights where exclusion is prohibited by law.',
  },
  {
    title: '20. COMPLAINTS AND INCIDENTS',
    body: 'Any incident concerning navigation, crew, equipment or safety should be reported promptly to the Captain and SYRAMA. Any subsequent written complaint should be submitted to contact@syrama-services.com within 7 days following the Experience, without prejudice to mandatory statutory rights.',
  },
  {
    title: '21. PERSONAL DATA',
    body: 'SYRAMA may process and share personal information reasonably necessary to organize and perform the Experience with the relevant Yacht Operator and other service providers, in accordance with applicable data-protection legislation.',
  },
  {
    title: '22. PHOTOGRAPHY AND MEDIA',
    body: 'Commercial filming, professional production or drone operation requires prior authorization from SYRAMA and, where applicable, the Yacht Operator or Captain. Personal photography and ordinary social-media use are permitted unless otherwise restricted.',
  },
  {
    title: '23. CONFIDENTIALITY AND COMMERCIAL RELATIONSHIPS',
    body: 'SYRAMA\'s negotiated supplier rates, commissions, contractual arrangements, sourcing methods and other non-public commercial information are confidential. SYRAMA is not required to disclose such information except where required by law.',
  },
  {
    title: '24. ENTIRE AGREEMENT',
    body: 'This Agreement, the Booking Summary, invoice and written amendments accepted by the Parties constitute the agreement concerning the Experience. Vessel-specific operational or safety conditions may be incorporated before confirmation.',
  },
  {
    title: '25. SEVERABILITY',
    body: 'If any provision is invalid or unenforceable, the remaining provisions continue in force to the maximum extent permitted by law.',
  },
  {
    title: '26. GOVERNING LAW AND JURISDICTION',
    body: 'This Agreement shall be governed by the laws applicable in the United Arab Emirates and the Emirate of Dubai, subject to mandatory law applicable to maritime services performed in another jurisdiction. Disputes arising from SYRAMA\'s services shall be submitted to the competent courts of Dubai unless mandatory applicable law requires otherwise. Mandatory consumer rights are preserved.',
  },
  {
    title: '27. ELECTRONIC ACCEPTANCE',
    body: 'This Agreement may be accepted electronically to the extent permitted by applicable law.',
  },
  {
    title: '28. CLIENT DECLARATION',
    body: 'By signing, the Client confirms that the booking details, included and excluded services, payment and cancellation conditions have been reviewed and accepted, and acknowledges that navigation remains subject to the Captain\'s authority.',
  },
]

function ContractDocument({ data }: { data: ContractPdfData }) {
  return (
    <Document title={`SYRAMA Agreement ${data.bookingReference}`}>
      <Page size="A4" style={styles.page}>
        <Header />
        <Footer />

        <View style={styles.titleBlock}>
          <Text style={styles.brand}>SYRAMA</Text>
          <Text style={styles.subtitle}>PRIVATE YACHT EXPERIENCE AGREEMENT</Text>
        </View>

        <View style={styles.metaTable}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>BOOKING REFERENCE</Text>
            <Text style={styles.metaValue}>{data.bookingReference}</Text>
          </View>
          <View style={styles.metaRowLast}>
            <Text style={styles.metaLabel}>DATE OF AGREEMENT</Text>
            <Text style={styles.metaValue}>{data.agreementDate}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>PARTIES</Text>
        <Text style={styles.paragraph}>
          This Agreement is entered into between SYRAMA CONCIERGE SERVICES - FZCO, a company incorporated in Dubai, United Arab Emirates, under Trade Licence No. 74796, having its registered office at DSO-IFZA, IFZA Properties, Dubai Silicon Oasis, Dubai, United Arab Emirates (the &quot;Organizer&quot; or &quot;SYRAMA&quot;), and the Client identified below.
        </Text>

        <InfoTable
          title="CLIENT"
          rows={[
            ['Full Name', data.clientFullName],
            ['Country of Residence', data.clientCountry || TBC],
            ['Email', data.clientEmail],
            ['Phone', data.clientPhone],
          ]}
        />

        <Text style={styles.paragraph}>
          The maritime component of the Experience shall be performed by the professional yacht operator identified for the booking (the &quot;Yacht Operator&quot;{data.yachtOperator ? `, ${data.yachtOperator}` : ''}). SYRAMA remains the Client&apos;s principal point of contact for the organization and coordination of the Experience.
        </Text>

        <Text style={styles.sectionTitle}>{CLAUSE_1_PURPOSE.title}</Text>
        <Text style={styles.paragraph}>{CLAUSE_1_PURPOSE.body}</Text>

        <Text style={styles.sectionTitle}>2. EXPERIENCE DETAILS</Text>
        <InfoTable
          title="EXPERIENCE"
          rows={[
            ['Yacht', data.yachtModel],
            ['Date', data.experienceDateLabel],
            ['Embarkation', data.embarkation],
            ['Disembarkation', data.disembarkation],
            ['Number of Guests', data.numberOfGuests],
            ['Planned Itinerary', data.plannedItinerary],
            ['Total Price', data.totalPrice],
          ]}
        />
        <Text style={styles.paragraph}>
          The itinerary remains subject to weather, sea conditions, port restrictions, applicable regulations and the Captain&apos;s authority.
        </Text>

        <View wrap={false}>
          <Text style={styles.sectionTitle}>{CLAUSE_3_SERVICES.title}</Text>
          <Text style={styles.paragraph}>{CLAUSE_3_SERVICES.body}</Text>
        </View>
        <View wrap={false}>
          <Text style={styles.sectionTitle}>4. PRICE</Text>
          <Text style={styles.paragraph}>{priceClauseBody(data.totalPrice)}</Text>
        </View>

        {CLAUSES.map((clause) => (
          <View key={clause.title} wrap={false}>
            <Text style={styles.sectionTitle}>{clause.title}</Text>
            <Text style={styles.paragraph}>{clause.body}</Text>
          </View>
        ))}
      </Page>

      <Page size="A4" style={styles.page}>
        <Header />
        <Footer />

        <View style={{ alignItems: 'center', marginBottom: 6 }}>
          <Text style={{ fontSize: 18, fontFamily: 'Helvetica-Bold' }}>BOOKING SUMMARY</Text>
          <Text style={{ fontSize: 9, color: '#666666', marginTop: 4 }}>Complete for each individual yacht experience before signature.</Text>
        </View>

        <InfoTable
          title="BOOKING SUMMARY"
          rows={[
            ['Yacht', data.yachtModel],
            ['Date', data.experienceDateLabel],
            ['Guests', data.numberOfGuests],
            ['Embarkation', data.embarkation],
            ['Disembarkation', data.disembarkation],
            ['Destination / Itinerary', data.plannedItinerary],
            ['Deposit', data.deposit],
            ['Payment Deadline', data.paymentDeadline],
            ['Total Price', data.totalPrice],
          ]}
        />

        <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold', marginTop: 20, marginBottom: 8 }}>SIGNATURES</Text>
        <View style={styles.signatureBlock}>
          <View style={styles.signatureCol}>
            <Text style={styles.signatureHeading}>For SYRAMA</Text>
            <Text style={{ fontSize: 8.5 }}>SYRAMA CONCIERGE SERVICES - FZCO</Text>
            <Text style={{ fontSize: 8.5 }}>Name: Samih Nicolas Daniel Habbani</Text>
            <Text style={{ fontSize: 8.5 }}>Title: Manager</Text>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf's Image, not an HTML img */}
            <Image src={STAMP_PATH} style={{ width: 132, height: 78, marginTop: 8, marginBottom: 6 }} />
            <Text style={{ fontSize: 8.5 }}>Date: {data.syramaSignatureDate}</Text>
          </View>
          <View style={styles.signatureCol}>
            <Text style={styles.signatureHeading}>The Client</Text>
            <Text style={{ fontSize: 8.5 }}>Full Name: {data.clientFullName}</Text>
            <Text style={styles.signatureLine}>Signature: ___________________________</Text>
            <Text style={styles.signatureLine}>Date: ___________________________</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}

export async function generateContractPdf(data: ContractPdfData): Promise<Buffer> {
  const buffer = await renderToBuffer(<ContractDocument data={data} />)
  return Buffer.from(buffer)
}
