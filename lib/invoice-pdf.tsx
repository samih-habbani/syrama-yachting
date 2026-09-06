import React from 'react'
import path from 'path'
import { Document, Page, Text, View, Image, StyleSheet, renderToBuffer } from '@react-pdf/renderer'

// Extracted from the client's own reference invoice PDF (same emblem used
// on every SYRAMA document).
const LOGO_PATH = path.join(process.cwd(), 'public/assets/invoices/syrama-logo.png')

export interface InvoicePdfData {
  invoiceNumber: string
  date: string
  type: string
  status: 'draft' | 'sent' | 'paid'
  isService: boolean

  issuerLabel: string
  billToLabel: string
  billToName: string | null
  billToLines: string[]

  serviceName: string
  serviceDetail: string | null
  // Commission invoices only — the reservation's own client, shown as a
  // "Client :" subline under the service description.
  clientLine: string | null
  startDate: string | null
  endDate: string | null
  lineAmount: string | null

  commissionRate: number | null
  applyVat: boolean
  vatRate: number
  subtotal: string | null
  vatAmount: string | null
  totalDue: string | null
  currency: string

  notes: string | null
}

const NAVY = '#0d1b2e'

const styles = StyleSheet.create({
  page: {
    fontSize: 9.5,
    fontFamily: 'Helvetica',
    color: '#1a1a1a',
    padding: '16px 36px',
  },
  headerRow: { flexDirection: 'row', borderBottomWidth: 3, borderBottomColor: NAVY, paddingBottom: 8, marginBottom: 10 },
  // react-pdf's `letterSpacing` adds that many points between EVERY
  // character (not a subtle CSS-style tracking adjustment), so values
  // that would read as normal tracking in HTML/CSS blow up into
  // letter-by-letter spacing here — kept deliberately small.
  companyName: { fontSize: 14, fontFamily: 'Helvetica-Bold', letterSpacing: 0.5, textTransform: 'uppercase', color: NAVY },
  companyLegal: { fontSize: 8, color: '#888', letterSpacing: 0.3, textTransform: 'uppercase', marginTop: 1 },
  companyAddr: { fontSize: 8.5, color: '#555', marginTop: 4, lineHeight: 1.6 },
  docLabelFr: { fontSize: 9, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.3, textAlign: 'right' },
  docLabel: { fontSize: 21, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', color: NAVY, letterSpacing: 0.3, textAlign: 'right', marginTop: 2 },
  docMeta: { fontSize: 9, color: '#555', textAlign: 'right', marginTop: 6, lineHeight: 1.6 },
  docMetaBold: { fontFamily: 'Helvetica-Bold', color: '#1a1a1a' },
  badge: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.4, padding: '3px 8px', borderRadius: 2, alignSelf: 'flex-end', marginTop: 6 },
  partyRow: { flexDirection: 'row', marginBottom: 10, gap: 16 },
  partyBox: { flex: 1, borderWidth: 1, borderColor: '#d8d8d8', padding: '8px 13px' },
  partyLabel: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.5, color: '#888', borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 3, marginBottom: 5 },
  partyName: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: NAVY, marginBottom: 3 },
  partyDetail: { fontSize: 9, color: '#555', lineHeight: 1.6 },
  sectionTitle: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.6, color: '#888', borderBottomWidth: 2, borderBottomColor: NAVY, paddingBottom: 3, marginTop: 6, marginBottom: 5 },
  clientBox: { backgroundColor: '#f8f8f8', borderLeftWidth: 3, borderLeftColor: NAVY, padding: '6px 12px', fontSize: 9.5, lineHeight: 1.5, color: '#333' },
  table: { marginTop: 4 },
  tableHead: { flexDirection: 'row', backgroundColor: NAVY },
  th: { padding: '7px 9px', fontSize: 8, color: '#fff', textTransform: 'uppercase', letterSpacing: 0.3 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee' },
  td: { padding: '9px 9px', fontSize: 10, color: '#333' },
  serviceName: { fontFamily: 'Helvetica-Bold', fontSize: 10.5, color: NAVY },
  serviceDetail: { fontSize: 8.5, color: '#888', marginTop: 2 },
  totalsTable: { width: 260, marginTop: 4, marginLeft: 'auto' },
  totalsRow: { flexDirection: 'row', padding: '5px 12px', fontSize: 10, color: '#555', borderBottomWidth: 1, borderBottomColor: '#eee' },
  totalsLabel: { width: '58%' },
  totalsVal: { width: '42%', textAlign: 'right', color: '#1a1a1a' },
  grandRow: { flexDirection: 'row', padding: '7px 12px', backgroundColor: NAVY, fontSize: 11, fontFamily: 'Helvetica-Bold', alignItems: 'center' },
  grandLabel: { width: '58%', color: '#fff', lineHeight: 1.3 },
  grandVal: { width: '42%', textAlign: 'right', color: '#fff' },
  noVat: { fontSize: 7.5, color: '#aaa', textAlign: 'right', marginTop: 4, fontStyle: 'italic', width: 260, marginLeft: 'auto' },
  bankBox: { flexDirection: 'row', backgroundColor: '#f8f8f8', borderLeftWidth: 3, borderLeftColor: NAVY, fontSize: 9.5, color: '#333', lineHeight: 1.6 },
  bankCol: { flex: 1, padding: '8px 13px' },
  bankHeading: { color: NAVY, fontFamily: 'Helvetica-Bold' },
  notesBox: { backgroundColor: '#f9f9f9', borderLeftWidth: 3, borderLeftColor: NAVY, padding: '7px 12px', fontSize: 9, lineHeight: 1.5, color: '#555', marginTop: 6 },
  footer: { marginTop: 7, borderTopWidth: 1, borderTopColor: '#ddd', paddingTop: 5, fontSize: 7.5, color: '#aaa', textAlign: 'center', lineHeight: 1.5 },
})

const BADGE_STYLE: Record<InvoicePdfData['status'], { background: string; color: string }> = {
  draft: { background: '#eeeeee', color: '#666666' },
  sent: { background: '#e8a100', color: '#ffffff' },
  paid: { background: '#1a7a4a', color: '#ffffff' },
}
const BADGE_LABEL: Record<InvoicePdfData['status'], string> = {
  draft: 'Draft / Brouillon',
  sent: 'Sent / Envoyée',
  paid: 'Paid / Payée',
}

function InvoiceDocument({ data }: { data: InvoicePdfData }) {
  const badge = BADGE_STYLE[data.status]

  return (
    <Document title={`SYRAMA Invoice ${data.invoiceNumber}`}>
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
            <Text style={styles.docLabelFr}>{data.isService ? 'Facture' : 'Facture de Commission'}</Text>
            <Text style={styles.docLabel}>{data.isService ? 'Invoice' : 'Commission\nInvoice'}</Text>
            <Text style={styles.docMeta}>
              <Text style={styles.docMetaBold}>Invoice No. / N° :</Text> {data.invoiceNumber}{'\n'}
              <Text style={styles.docMetaBold}>Date :</Text> {data.date}{'\n'}
              <Text style={styles.docMetaBold}>Type :</Text> {data.type.toUpperCase()}
            </Text>
            <Text style={[styles.badge, { backgroundColor: badge.background, color: badge.color }]}>
              {BADGE_LABEL[data.status]}
            </Text>
          </View>
        </View>

        <View style={styles.partyRow}>
          <View style={styles.partyBox}>
            <Text style={styles.partyLabel}>From / De — Issuer / Émetteur</Text>
            <Text style={styles.partyName}>Syrama Concierge Services FZCO</Text>
            <Text style={styles.partyDetail}>
              IFZA Properties, Dubai Silicon Oasis{'\n'}
              DSO-IFZA, Dubai, UAE{'\n'}
              License No. 74796 — DIEZA{'\n'}
              contact@syrama-services.com
            </Text>
          </View>
          <View style={styles.partyBox}>
            <Text style={styles.partyLabel}>{data.billToLabel}</Text>
            {data.billToName ? (
              <>
                <Text style={styles.partyName}>{data.billToName}</Text>
                <Text style={styles.partyDetail}>{data.billToLines.join('\n')}</Text>
              </>
            ) : (
              <Text style={[styles.partyDetail, { color: '#bbb' }]}>— Not specified / Non renseigné —</Text>
            )}
          </View>
        </View>

        {!data.isService && data.clientLine && (
          <>
            <Text style={styles.sectionTitle}>Client / Client concerné</Text>
            <View style={styles.clientBox}>
              <Text style={{ fontFamily: 'Helvetica-Bold' }}>{data.clientLine}</Text>
            </View>
          </>
        )}

        <Text style={styles.sectionTitle}>Services Rendered / Prestation réalisée</Text>
        <View style={styles.table}>
          <View style={styles.tableHead}>
            <Text style={[styles.th, { width: '50%' }]}>Description</Text>
            <Text style={[styles.th, { width: '15%' }]}>Start / Début</Text>
            <Text style={[styles.th, { width: '15%' }]}>End / Fin</Text>
            <Text style={[styles.th, { width: '20%', textAlign: 'right' }]}>Total Price / Prix total</Text>
          </View>
          <View style={styles.tableRow}>
            <View style={[styles.td, { width: '50%' }]}>
              <Text style={styles.serviceName}>{data.serviceName}</Text>
              {data.serviceDetail && <Text style={styles.serviceDetail}>{data.serviceDetail}</Text>}
              {!data.isService && data.clientLine && (
                <Text style={[styles.serviceDetail, { marginTop: 6, color: '#555' }]}>
                  <Text style={{ color: '#333', fontFamily: 'Helvetica-Bold' }}>Client : </Text>{data.clientLine}
                </Text>
              )}
            </View>
            <Text style={[styles.td, { width: '15%' }]}>{data.startDate || '—'}</Text>
            <Text style={[styles.td, { width: '15%' }]}>{data.endDate || '—'}</Text>
            <Text style={[styles.td, { width: '20%', textAlign: 'right' }]}>{data.lineAmount ? `${data.lineAmount} ${data.currency}` : '—'}</Text>
          </View>
        </View>

        <View style={styles.totalsTable}>
          {!data.isService && data.commissionRate != null && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Commission rate / Taux</Text>
              <Text style={styles.totalsVal}>{data.commissionRate}%</Text>
            </View>
          )}
          {data.applyVat ? (
            <>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>{data.isService ? 'Subtotal / Sous-total' : 'Commission / Commission'}</Text>
                <Text style={styles.totalsVal}>{data.subtotal ? `${data.subtotal} ${data.currency}` : '—'}</Text>
              </View>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>VAT ({data.vatRate}%) / TVA ({data.vatRate}%)</Text>
                <Text style={styles.totalsVal}>{data.vatAmount ? `${data.vatAmount} ${data.currency}` : '—'}</Text>
              </View>
              <View style={styles.grandRow}>
                <Text style={styles.grandLabel}>Total due (incl. VAT) / Total dû (TTC)</Text>
                <Text style={styles.grandVal}>{data.totalDue ? `${data.totalDue} ${data.currency}` : '—'}</Text>
              </View>
            </>
          ) : (
            <View style={styles.grandRow}>
              <Text style={styles.grandLabel}>{data.isService ? 'Total due / Total dû' : 'Commission due / Due'}</Text>
              <Text style={styles.grandVal}>{data.totalDue ? `${data.totalDue} ${data.currency}` : '—'}</Text>
            </View>
          )}
        </View>
        <Text style={styles.noVat}>
          {data.applyVat
            ? `VAT ${data.vatRate}% applied as per UAE Federal Tax Authority / TVA ${data.vatRate}% appliquée conformément à la Federal Tax Authority (EAU)`
            : 'VAT exempt — Free Zone entity (UAE) / Exonéré de TVA — Zone franche (EAU)'}
        </Text>

        <Text style={styles.sectionTitle}>Bank Transfer Details / Coordonnées bancaires</Text>
        <View style={styles.bankBox}>
          <View style={styles.bankCol}>
            <Text><Text style={styles.bankHeading}>Account Holder / Titulaire :</Text>{'\n'}SYRAMA CONCIERGE SERVICES - FZCO{'\n\n'}</Text>
            <Text><Text style={styles.bankHeading}>IBAN :</Text>{'\n'}AE36 0860 0000 0954 7977 433</Text>
          </View>
          <View style={styles.bankCol}>
            <Text><Text style={styles.bankHeading}>BIC / SWIFT :</Text>{'\n'}WIOBAEADXXX{'\n\n'}</Text>
            <Text><Text style={styles.bankHeading}>Bank Address / Adresse banque :</Text>{'\n'}Etihad Airways Centre, 5th Floor{'\n'}Abu Dhabi, UAE</Text>
          </View>
        </View>

        {data.notes && (
          <View style={styles.notesBox}>
            <Text style={{ fontFamily: 'Helvetica-Bold', marginBottom: 2 }}>Notes :</Text>
            <Text>{data.notes}</Text>
          </View>
        )}

        <Text style={styles.footer}>
          <Text style={{ color: '#888888', fontFamily: 'Helvetica-Bold' }}>Syrama Concierge Services FZCO</Text> · License No. 74796 · IFZA Properties, Dubai Silicon Oasis, DSO-IFZA, Dubai, UAE · Issued by Dubai Integrated Economic Zones Authority (DIEZA){'\n'}
          This document is issued without VAT as per UAE Free Zone regulations. / Ce document est émis sans TVA conformément aux réglementations des zones franches des EAU.
        </Text>
      </Page>
    </Document>
  )
}

export async function generateInvoicePdf(data: InvoicePdfData): Promise<Buffer> {
  const buffer = await renderToBuffer(<InvoiceDocument data={data} />)
  return Buffer.from(buffer)
}
