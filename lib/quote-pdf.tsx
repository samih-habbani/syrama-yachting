import React from 'react'
import { Document, Page, Text, View, Image, renderToBuffer } from '@react-pdf/renderer'
import { styles, NAVY, LOGO_PATH, BankDetails, TripDetails } from '@/lib/invoice-pdf'

export interface QuotePdfData {
  quoteNumber: string
  date: string
  validUntil: string | null
  startDate: string | null
  endDate: string | null
  serviceName: string
  billToName: string | null
  billToLines: string[]
  items: { description: string; quantity: number; unitPrice: string; total: string }[]
  applyVat: boolean
  vatRate: number
  subtotal: string
  vatAmount: string | null
  totalDue: string
  currency: string
  notes: string | null
  trip: { startTime: string | null; endTime: string | null; departurePort: string | null; city: string | null }
}

function QuoteDocument({ data }: { data: QuotePdfData }) {
  return (
    <Document title={`SYRAMA Quote ${data.quoteNumber}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View style={{ width: '52%' }}>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf's Image, not an HTML img */}
            <Image src={LOGO_PATH} style={{ width: 77, height: 46, marginBottom: 6 }} />
            <Text style={styles.companyName}>Syrama Concierge Services</Text>
            <Text style={styles.companyLegal}>FZCO — License No. 74796</Text>
            <Text style={styles.companyAddr}>
              IFZA Properties, Dubai Silicon Oasis{'\n'}
              DSO-IFZA, Dubai, United Arab Emirates{'\n'}
              contact@syrama-services.com · www.syrama-services.com
            </Text>
          </View>
          <View style={{ width: '48%' }}>
            <Text style={styles.docLabel}>Quote</Text>
            <Text style={styles.docMeta}>
              <Text style={styles.docMetaBold}>Quote No. :</Text> {data.quoteNumber}{'\n'}
              <Text style={styles.docMetaBold}>Date :</Text> {data.date}
              {data.validUntil ? <>{'\n'}<Text style={styles.docMetaBold}>Valid until :</Text> {data.validUntil}</> : null}
            </Text>
          </View>
        </View>

        <View style={styles.partyRow}>
          <View style={styles.partyBox}>
            <Text style={styles.partyLabel}>From — Issuer</Text>
            <Text style={styles.partyName}>Syrama Concierge Services FZCO</Text>
            <Text style={styles.partyDetail}>
              IFZA Properties, Dubai Silicon Oasis{'\n'}DSO-IFZA, Dubai, UAE{'\n'}License No. 74796 — DIEZA{'\n'}contact@syrama-services.com
            </Text>
          </View>
          <View style={styles.partyBox}>
            <Text style={styles.partyLabel}>Prepared for — Client</Text>
            {data.billToName ? (
              <>
                <Text style={styles.partyName}>{data.billToName}</Text>
                <Text style={styles.partyDetail}>{data.billToLines.join('\n')}</Text>
              </>
            ) : (
              <Text style={[styles.partyDetail, { color: '#bbb' }]}>— Not specified —</Text>
            )}
          </View>
        </View>

        <TripDetails englishOnly rows={[['Embarkation', data.trip.startTime], ['Disembarkation', data.trip.endTime], ['Embarkation port', data.trip.departurePort], ['City', data.trip.city]]} />

        <Text style={styles.sectionTitle}>Proposed Services</Text>
        <View style={styles.table}>
          <View style={styles.tableHead}>
            <Text style={[styles.th, { width: '52%' }]}>Description</Text>
            <Text style={[styles.th, { width: '10%', textAlign: 'right' }]}>Qty</Text>
            <Text style={[styles.th, { width: '19%', textAlign: 'right' }]}>Unit price</Text>
            <Text style={[styles.th, { width: '19%', textAlign: 'right' }]}>Total</Text>
          </View>
          {data.items.map((it, i) => (
            <View key={i} style={styles.tableRow} wrap={false}>
              <View style={[styles.td, { width: '52%' }]}>
                <Text style={i === 0 ? styles.serviceName : { fontSize: 10, color: '#333' }}>{it.description}</Text>
                {i === 0 && (data.startDate || data.endDate) && (
                  <Text style={styles.serviceDetail}>{[data.startDate, data.endDate].filter(Boolean).join(' - ')}</Text>
                )}
              </View>
              <Text style={[styles.td, { width: '10%', textAlign: 'right' }]}>{it.quantity}</Text>
              <Text style={[styles.td, { width: '19%', textAlign: 'right' }]}>{it.unitPrice}</Text>
              <Text style={[styles.td, { width: '19%', textAlign: 'right' }]}>{it.total} {data.currency}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsTable}>
          {data.applyVat && (
            <>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Subtotal</Text>
                <Text style={styles.totalsVal}>{data.subtotal} {data.currency}</Text>
              </View>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>VAT ({data.vatRate}%)</Text>
                <Text style={styles.totalsVal}>{data.vatAmount} {data.currency}</Text>
              </View>
            </>
          )}
          <View style={styles.grandRow}>
            <Text style={styles.grandLabel}>{data.applyVat ? 'Total (incl. VAT)' : 'Total'}</Text>
            <Text style={styles.grandVal}>{data.totalDue} {data.currency}</Text>
          </View>
        </View>
        {!data.applyVat && (
          <Text style={styles.noVat}>VAT exempt — Free Zone entity (UAE)</Text>
        )}

        <BankDetails englishOnly />

        {data.notes && (
          <View style={styles.notesBox}>
            <Text style={{ fontFamily: 'Helvetica-Bold', marginBottom: 2 }}>Notes :</Text>
            <Text>{data.notes}</Text>
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: NAVY }]}>Acceptance</Text>
        <Text style={{ fontSize: 9, color: '#555', lineHeight: 1.5 }}>
          This quote is an estimate and is subject to yacht availability at the time of confirmation. Reply to this quote to confirm and a contract and invoice will follow.
        </Text>

        <Text style={styles.footer}>
          <Text style={{ color: '#888888', fontFamily: 'Helvetica-Bold' }}>Syrama Concierge Services FZCO</Text> · License No. 74796 · IFZA Properties, Dubai Silicon Oasis, DSO-IFZA, Dubai, UAE · Issued by Dubai Integrated Economic Zones Authority (DIEZA)
        </Text>
      </Page>
    </Document>
  )
}

export async function generateQuotePdf(data: QuotePdfData): Promise<Buffer> {
  return Buffer.from(await renderToBuffer(<QuoteDocument data={data} />))
}
