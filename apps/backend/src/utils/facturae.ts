
export function generateFacturaeXML(data: any) {
  const { 
    invoiceNumber, 
    invoiceSeries,
    issueDate, 
    items, 
    seller, // El emisor (usuario actual)
    buyer   // El cliente (receptor)
  } = data;

  const totalBase = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
  const totalTax = items.reduce((sum: number, item: any) => {
    const base = item.quantity * item.unitPrice;
    return sum + (base * (item.taxPercentage / 100));
  }, 0);
  const totalAmount = totalBase + totalTax;

  const formatDate = (date: string) => new Date(date).toISOString().split('T')[0];
  const batchId = `${seller.cif}${formatDate(issueDate).replace(/-/g, '')}${invoiceNumber}`;

  // Bloque de Impuestos (Agrupados por tipo de IVA)
  const taxRates = Array.from(new Set(items.map((i: any) => i.taxPercentage)));
  const taxesXml = taxRates.map(rate => {
    const rateItems = items.filter((i: any) => i.taxPercentage === rate);
    const base = rateItems.reduce((sum: number, i: any) => sum + (i.quantity * i.unitPrice), 0);
    const quota = base * (Number(rate) / 100);
    return `
          <Tax>
            <TaxTypeCode>01</TaxTypeCode>
            <TaxRate>${Number(rate).toFixed(2)}</TaxRate>
            <TaxableBase>
              <TotalAmount>${base.toFixed(2)}</TotalAmount>
            </TaxableBase>
            <TaxAmount>
              <TotalAmount>${quota.toFixed(2)}</TotalAmount>
            </TaxAmount>
          </Tax>`;
  }).join('');

  // Bloque de Líneas de Factura
  const itemsXml = items.map((item: any) => {
    const base = item.quantity * item.unitPrice;
    const quota = base * (item.taxPercentage / 100);
    return `
        <InvoiceLine>
          <ItemDescription>${item.concept}</ItemDescription>
          <Quantity>${Number(item.quantity).toFixed(2)}</Quantity>
          <UnitOfMeasure>01</UnitOfMeasure>
          <UnitPriceWithoutTax>${Number(item.unitPrice).toFixed(6)}</UnitPriceWithoutTax>
          <TotalCost>${base.toFixed(2)}</TotalCost>
          <TaxesOutputs>
            <Tax>
              <TaxTypeCode>01</TaxTypeCode>
              <TaxRate>${Number(item.taxPercentage).toFixed(2)}</TaxRate>
              <TaxableBase>
                <TotalAmount>${base.toFixed(2)}</TotalAmount>
              </TaxableBase>
              <TaxAmount>
                <TotalAmount>${quota.toFixed(2)}</TotalAmount>
              </TaxAmount>
            </Tax>
          </TaxesOutputs>
        </InvoiceLine>`;
  }).join('');

  const paymentXml = seller.iban ? `
      <PaymentDetails>
        <Installment>
          <InstallmentDueDate>${formatDate(data.due_date || issueDate)}</InstallmentDueDate>
          <InstallmentAmount>${totalAmount.toFixed(2)}</InstallmentAmount>
          <PaymentMeans>04</PaymentMeans>
          <AccountToBeCredited>
            <IBAN>${seller.iban.replace(/\s/g, '')}</IBAN>
            ${seller.swiftBic ? `<BIC>${seller.swiftBic}</BIC>` : ''}
            ${seller.bankName ? `<BankName>${seller.bankName}</BankName>` : ''}
          </AccountToBeCredited>
        </Installment>
      </PaymentDetails>` : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<fe:Facturae xmlns:fe="http://www.facturae.es/Facturae/2014/v3.2.2/Facturae" xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
  <FileHeader>
    <SchemaVersion>3.2.2</SchemaVersion>
    <Modality>I</Modality>
    <InvoiceIssuerType>EM</InvoiceIssuerType>
    <BatchIdentifier>${batchId}</BatchIdentifier>
    <InvoicesCount>1</InvoicesCount>
    <TotalInvoicesAmount>
      <TotalAmount>${totalAmount.toFixed(2)}</TotalAmount>
    </TotalInvoicesAmount>
    <TotalOutstandingAmount>
      <TotalAmount>${totalAmount.toFixed(2)}</TotalAmount>
    </TotalOutstandingAmount>
    <TotalExecutableAmount>
      <TotalAmount>${totalAmount.toFixed(2)}</TotalAmount>
    </TotalExecutableAmount>
    <BatchCurrencyCode>EUR</BatchCurrencyCode>
  </FileHeader>
  <Parties>
    <SellerParty>
      <TaxIdentification>
        <PersonTypeCode>J</PersonTypeCode>
        <ResidenceTypeCode>R</ResidenceTypeCode>
        <TaxIdentificationNumber>${seller.cif}</TaxIdentificationNumber>
      </TaxIdentification>
      <LegalEntity>
        <CorporateName>${seller.name}</CorporateName>
        <RegistrationData>
          <AddressInSpain>
            <Address>${seller.address}</Address>
            <PostCode>${seller.zipCode}</PostCode>
            <Town>${seller.city}</Town>
            <Province>${seller.province}</Province>
            <CountryCode>ESP</CountryCode>
          </AddressInSpain>
        </RegistrationData>
      </LegalEntity>
    </SellerParty>
    <BuyerParty>
      <TaxIdentification>
        <PersonTypeCode>J</PersonTypeCode>
        <ResidenceTypeCode>R</ResidenceTypeCode>
        <TaxIdentificationNumber>${buyer.cif}</TaxIdentificationNumber>
      </TaxIdentification>
      <LegalEntity>
        <CorporateName>${buyer.name}</CorporateName>
        <RegistrationData>
          <AddressInSpain>
            <Address>${buyer.address}</Address>
            <PostCode>${buyer.zipCode}</PostCode>
            <Town>${buyer.city}</Town>
            <Province>${buyer.province}</Province>
            <CountryCode>ESP</CountryCode>
          </AddressInSpain>
        </RegistrationData>
      </LegalEntity>
    </BuyerParty>
  </Parties>
  <Invoices>
    <Invoice>
      <InvoiceHeader>
        <InvoiceNumber>${invoiceNumber}</InvoiceNumber>
        <InvoiceSeriesCode>${invoiceSeries || ''}</InvoiceSeriesCode>
        <InvoiceDocumentType>FE</InvoiceDocumentType>
        <InvoiceClass>OR</InvoiceClass>
      </InvoiceHeader>
      <InvoiceIssueData>
        <IssueDate>${formatDate(issueDate)}</IssueDate>
        <InvoiceCurrencyCode>EUR</InvoiceCurrencyCode>
        <TaxCurrencyCode>EUR</TaxCurrencyCode>
        <LanguageName>es</LanguageName>
      </InvoiceIssueData>
      <TaxesOutputs>
        ${taxesXml}
      </TaxesOutputs>
      <InvoiceTotals>
        <TotalGrossAmount>${totalBase.toFixed(2)}</TotalGrossAmount>
        <TotalGrossAmountBeforeTaxes>${totalBase.toFixed(2)}</TotalGrossAmountBeforeTaxes>
        <TotalTaxOutputs>${totalTax.toFixed(2)}</TotalTaxOutputs>
        <TotalInvoicesAmount>${totalAmount.toFixed(2)}</TotalInvoicesAmount>
        <TotalOutstandingAmount>${totalAmount.toFixed(2)}</TotalOutstandingAmount>
        <TotalExecutableAmount>${totalAmount.toFixed(2)}</TotalExecutableAmount>
      </InvoiceTotals>
      <Items>
        ${itemsXml}
      </Items>
      ${paymentXml}
    </Invoice>
  </Invoices>
</fe:Facturae>`;
}
