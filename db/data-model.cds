namespace usedcar;

using {
managed} from '@sap/cds/common';

// EBAN - Purchase Requisition
@odata.draft.enabled
entity PurchaseRequisition : managed {
  key PurchaseRequisition     : String(10);
  key PurchaseReqnItem        : String(5);

      @mandatory
      Material                : String(40);

      @mandatory
      Plant                   : String(4);
      StorageLocation         : String(4);

      @mandatory
      PurchasingGroup         : String(3);
      PurchaseRequisitionType : String(4);

      @mandatory
      Quantity                : Decimal(13, 3);
      BaseUnit                : String(3);

      @mandatory
      DeliveryDate            : Date;
      Requisitioner           : String(12);
      ReleaseStatus           : String(8);
      RequisitionDate         : String(20);
      CreatedByUser           : String(12);

      // Existing associations
      toMaterial              : Association to MaterialMaster
                                  on toMaterial.Material = Material;
      toPlant                 : Association to Plant
                                  on toPlant.Plant = Plant;
      toStorageLocation       : Association to StorageLocation
                                  on  toStorageLocation.Plant           = Plant
                                  and toStorageLocation.StorageLocation = StorageLocation;
      toPurchasingGroup       : Association to PurchasingGroup
                                  on toPurchasingGroup.PurchasingGroup = PurchasingGroup;
      toPurchasingDocType     : Association to PurchasingDocumentType
                                  on toPurchasingDocType.DocumentType = PurchaseRequisitionType;
      toPurchasingInfoRecord  : Association to PurchasingInfoRecord
                                  on toPurchasingInfoRecord.Material = Material;

      AccountAssignments      : Composition of many PurchaseRequisitionAccountAssignment
                                  on  AccountAssignments.PurchaseRequisition = PurchaseRequisition
                                  and AccountAssignments.PurchaseReqnItem    = PurchaseReqnItem;
}

// EBKN - Purchase Requisition Account Assignment
entity PurchaseRequisitionAccountAssignment {
  key PurchaseRequisition    : String(10); // BANFN
  key PurchaseReqnItem       : String(5); // BNFPO
  key AcctAssignment         : String(2); // ZEKKN - Sequential number
      AcctAssignmentCategory : String(1); // KNTTP - Category (e.g., 'K' for Cost Center)
      GLAccount              : String(10); // SAKTO
      CostCenter             : String(10); // KOSTL
      Order                  : String(12); // AUFNR
}

// MARA - Material Master
entity MaterialMaster {
  key Material                : String(40); // MATNR
      MaterialType            : String(4); // MTART
      IndustrySector          : String(1); // MBRSH
      BaseUnit                : String(3); // MEINS
      MaterialGroup           : String(9); // MATKL
      CreationDate            : Date; // ERSDA

      MaterialDescription     : Association to MaterialDescription
                                  on MaterialDescription.Material = Material; // 1:1
      toPurchasingInfoRecords : Association to many PurchasingInfoRecord
                                  on toPurchasingInfoRecords.Material = Material;
      toMaterialDocument      : Association to MaterialDocument
                                  on toMaterialDocument.Material = Material; // 1:1
      toPurchasingConditions  : Composition of many MaterialInfoRecordPurchasingConditions
                                  on toPurchasingConditions.Material = Material;
}

// MAKT - Material Descriptions
entity MaterialDescription {
  key Material            : String(40); // MATNR
  key Language            : String(2); // SPRAS
      MaterialDescription : String(40); // MAKTX
}

// T001W - Plants/Branches
entity Plant {
  key Plant                  : String(4); // WERKS
      PlantName              : String(30); // NAME1
      City                   : String(35); // ORT01
      Country                : String(3); // LAND1
      toPurchasingConditions : Composition of many MaterialInfoRecordPurchasingConditions
                                 on toPurchasingConditions.Plant = Plant;
}

// T001L - Storage Locations
entity StorageLocation {
  key Plant                      : String(4); // WERKS
  key StorageLocation            : String(4); // LGORT
      StorageLocationDescription : String(16); // LGOBE
}

// T024 - Purchasing Groups
entity PurchasingGroup {
  key PurchasingGroup            : String(3); // EKGRP
      PurchasingGroupDescription : String(30); // EKNAM
}

// T161 - Purchasing Document Types
entity PurchasingDocumentType {
  key DocumentCategory        : String(1); // BSTYP
  key DocumentType            : String(4); // BSART
      DocumentTypeDescription : String(20); // BATXT
}

// EINA - Purchasing Info Record
@odata.draft.enabled
entity PurchasingInfoRecord {
  key PurchasingInfoRecord   : String(10); // INFNR

      @mandatory
      Material               : String(40); // foreign key

      @mandatory
      Supplier               : String(10); // foreign key

      // Associations based on foreign key fields
      toMaterial             : Association to MaterialMaster
                                 on toMaterial.Material = Material;
      toSupplier             : Association to VendorMaster
                                 on toSupplier.Supplier = Supplier;

      toPurchasingOrgInfo    : Association to many PurchasingOrgInfoRecord
                                 on toPurchasingOrgInfo.PurchasingInfoRecord = PurchasingInfoRecord;
      toPurchasingConditions : Composition of many MaterialInfoRecordPurchasingConditions
                                 on  toPurchasingConditions.Material = Material
                                 and toPurchasingConditions.Supplier = Supplier;
}

// EINE - Purchasing Info Record - Org Data
entity PurchasingOrgInfoRecord {
  key PurchasingInfoRecord   : String(10); // INFNR

      @mandatory
  key PurchasingOrganization : String(4); // EKORG

      @mandatory
      NetPrice               : Decimal(11, 2); // NETPR
      PriceUnit              : Decimal(5, 0); // PEINH

      InfoRecordHeader       : Association to PurchasingInfoRecord
                                 on InfoRecordHeader.PurchasingInfoRecord = PurchasingInfoRecord; // n:1
}

// LFA1 - Vendor Master
entity VendorMaster {
  key Supplier               : String(10); // LIFNR
      SupplierName           : String(35); // NAME1
      Country                : String(3); // LAND1
      City                   : String(35); // ORT01
      Street                 : String(35); // STRAS
      toPurchasingConditions : Composition of many MaterialInfoRecordPurchasingConditions
                                 on toPurchasingConditions.Supplier = Supplier;
}

// EKKO - Purchase Order Header
@odata.draft.enabled
entity PurchaseOrderHeader {
  key PurchaseOrder       : String(10); // EBELN
      DocumentCategory    : String(1); // BSTYP

      @mandatory
      PurchaseOrderType   : String(4); // BSART

      @mandatory
      Supplier            : String(10); // LIFNR
      PurchasingGroup     : String(3); // EKGRP

      @mandatory
      DocumentDate        : Date; // BEDAT

      @mandatory
      Currency            : String(5); // WAERS
      PaymentTerms        : String(4); // ZTERM

      toVendorMaster      : Association to VendorMaster
                              on toVendorMaster.Supplier = Supplier;
      toPurchasingGroup   : Association to PurchasingGroup
                              on toPurchasingGroup.PurchasingGroup = PurchasingGroup;
      toPurchasingDocType : Association to PurchasingDocumentType
                              on toPurchasingDocType.DocumentType = PurchaseOrderType;
      toPurchaseOrderItem : Composition of many PurchaseOrderItem
                              on toPurchaseOrderItem.PurchaseOrder = PurchaseOrder;
      // toPurchaseOrder: Association to PurchaseRequisition
      //                         on toPurchaseOrderItem.PurchaseOrder = PurchaseOrder;
      toRFQStatus         : Association to RFQStatus
                              on toRFQStatus.PurchaseOrder = PurchaseOrder;
      toRFQQuotes         : Association to many RFQQuote
                              on toRFQQuotes.PurchaseOrder = PurchaseOrder;
}

// EKPO - Purchase Order Item
entity PurchaseOrderItem {
  key PurchaseOrder         : String(10); // EBELN
  key PurchaseOrderItem     : String(5); // EBELP
      Material              : String(40); // MATNR
      Plant                 : String(4); // WERKS
      StorageLocation       : String(4); // LGORT
      Quantity              : Decimal(13, 3); // MENGE
      BaseUnit              : String(3); // MEINS
      NetPrice              : Decimal(11, 2); // NETPR
      PurchaseRequisition   : String(10); // BANFN

      toPurchaseOrderHeader : Association to PurchaseOrderHeader
                                on toPurchaseOrderHeader.PurchaseOrder = PurchaseOrder;
      toMaterial            : Association to MaterialMaster
                                on toMaterial.Material = Material;
      toPlant               : Association to Plant
                                on toPlant.Plant = Plant;
      toStorageLocation     : Association to StorageLocation
                                on  toStorageLocation.Plant           = Plant
                                and toStorageLocation.StorageLocation = StorageLocation;
      toPurchaseRequisition : Association to PurchaseRequisition
                                on toPurchaseRequisition.PurchaseRequisition = PurchaseRequisition;
}

// MSEG - Material Document
@odata.draft.enabled
entity MaterialDocument {
  key MaterialDocument      : String(10); // MBLNR
  key MaterialDocumentYear  : String(4); // MJAHR
  key MaterialDocumentItem  : String(4); // ZEILE

      @mandatory
      Material              : String(40); // MATNR

      @mandatory
      Plant                 : String(4); // WERKS

      @mandatory
      StorageLocation       : String(4); // LGORT

      @mandatory
      PurchaseOrder         : String(10); // EBELN
      PurchaseOrderItem     : String(5); // EBELP

      @mandatory
      Quantity              : Decimal(13, 3); // MENGE
      BaseUnit              : String(3);

      @mandatory
      MovementType          : String(3);

      // Associations into your masters
      toMaterial            : Association to MaterialMaster
                                on toMaterial.Material = Material;
      toPlant               : Association to Plant
                                on toPlant.Plant = Plant;
      toStorageLocation     : Association to StorageLocation
                                on  toStorageLocation.Plant           = Plant
                                and toStorageLocation.StorageLocation = StorageLocation;
      toPurchaseOrderHeader : Association to PurchaseOrderHeader
                                on toPurchaseOrderHeader.PurchaseOrder = PurchaseOrder;
      toPurchaseOrderItem   : Association to PurchaseOrderItem
                                on  toPurchaseOrderItem.PurchaseOrder     = PurchaseOrder
                                and toPurchaseOrderItem.PurchaseOrderItem = PurchaseOrderItem;
}

// RBKP - Supplier Invoice Header
@odata.draft.enabled
entity SupplierInvoiceHeader {
  key SupplierInvoice          : String(10); // BELNR
  key FiscalYear               : String(4); // GJAHR

      @mandatory
      Supplier                 : String(10); // LIFNR

      @mandatory
      DocumentDate             : Date; // BLDAT

      @mandatory
      GrossAmount              : Decimal(13, 2); // RMWWR

      @mandatory
      Currency                 : String(5); // WAERS

      // Associations
      toSupplier               : Association to VendorMaster
                                   on toSupplier.Supplier = Supplier;
      toSupplierInvoiceItem    : Composition of many SupplierInvoiceItem
                                   on toSupplierInvoiceItem.SupplierInvoice = SupplierInvoice;
      toAccountingDocumentItem : Composition of many AccountingDocumentItem
                                   on toAccountingDocumentItem.SupplierInvoice = SupplierInvoice;
}

// RSEG - Supplier Invoice Item
entity SupplierInvoiceItem {
  key SupplierInvoice         : String(10); // BELNR
  key SupplierInvoiceItem     : String(6); // BUZEI

      @mandatory
      PurchaseOrder           : String(10); // EBELN
      PurchaseOrderItem       : String(5); // EBELP
      Material                : String(40); // MATNR

      @mandatory
      Quantity                : Decimal(13, 3); // MENGE
      BaseUnit                : String(3);

      @mandatory
      Amount                  : Decimal(13, 2); // WRBTR

      // Associations
      toSupplierInvoiceHeader : Association to SupplierInvoiceHeader
                                  on toSupplierInvoiceHeader.SupplierInvoice = SupplierInvoice;
      toPurchaseOrderHeader   : Association to PurchaseOrderHeader
                                  on toPurchaseOrderHeader.PurchaseOrder = PurchaseOrder;
      toPurchaseOrderItem     : Association to PurchaseOrderItem
                                  on  toPurchaseOrderItem.PurchaseOrder     = PurchaseOrder
                                  and toPurchaseOrderItem.PurchaseOrderItem = PurchaseOrderItem;
      toMaterial              : Association to MaterialMaster
                                  on toMaterial.Material = Material;
}

// BKPF - Accounting Document Header
entity AccountingDocumentHeader {
  key AccountingDocument       : String(10); // BELNR
  key FiscalYear               : String(4); // GJAHR

      @mandatory
      DocumentType             : String(2); // BLART

      @mandatory
      DocumentDate             : Date; // BLDAT

      @mandatory
      CompanyCode              : String(4); // BUKRS

      toAccountingDocumentItem : Composition of many AccountingDocumentItem
                                   on  toAccountingDocumentItem.AccountingDocument = AccountingDocument
                                   and toAccountingDocumentItem.FiscalYear         = FiscalYear;
}

// BSEG - Accounting Document Item
entity AccountingDocumentItem {
  key AccountingDocument         : String(10); // BELNR
  key FiscalYear                 : String(4); // GJAHR
  key AccountingDocumentItem     : String(3); // BUZEI

      @mandatory
      Amount                     : Decimal(13, 2); // WRBTR

      @mandatory
      GLAccount                  : String(10); // HKONT

      SupplierInvoice            : String(10); // Reference to RBKP

      SupplierInvoiceItem        : String(6);

      CostCenter                 : String(10);
      Currency                   : String(5);

      // Associations
      toAccountingDocumentHeader : Association to AccountingDocumentHeader
                                     on  toAccountingDocumentHeader.AccountingDocument = AccountingDocument
                                     and toAccountingDocumentHeader.FiscalYear         = FiscalYear;
      toSupplierInvoiceHeader    : Association to SupplierInvoiceHeader
                                     on toSupplierInvoiceHeader.SupplierInvoice = SupplierInvoice;
      toSupplierInvoiceItem      : Association to SupplierInvoiceItem
                                     on  toSupplierInvoiceItem.SupplierInvoice     = SupplierInvoice
                                     and toSupplierInvoiceItem.SupplierInvoiceItem = SupplierInvoiceItem;
}

// A017 - Material Info Record (Purchasing Conditions)
entity MaterialInfoRecordPurchasingConditions {
  key Application            : String(2); // KAPPL
  key ConditionType          : String(4); // KSCHL
  key Supplier               : String(10); // LIFNR
  key Material               : String(40); // MATNR

      @mandatory
  key PurchasingOrganization : String(4); // EKORG
  key Plant                  : String(4); // WERKS
  key PurchaseContract       : String(10); // KONNR

      // Associations based on foreign key relationships
      toSupplier             : Association to VendorMaster
                                 on toSupplier.Supplier = Supplier;
      toMaterial             : Association to MaterialMaster
                                 on toMaterial.Material = Material;
      toPlant                : Association to Plant
                                 on toPlant.Plant = Plant;
      toPurchasingInfoRecord : Association to PurchasingInfoRecord
                                 on  toPurchasingInfoRecord.Supplier = Supplier
                                 and toPurchasingInfoRecord.Material = Material;
}


// ZRFQ_QUOTE - Custom table for storing RFQ quotes
entity RFQQuote : managed {
  key RFQQuoteID          : String(10);

      @mandatory
      PurchaseOrder       : String(10); // Link to EKKO (RFQ)
      PurchaseOrderItem   : String(5); // Link to EKPO

      @mandatory
      Supplier            : String(10); // Supplier who submitted the quote

      @mandatory
      Material            : String(40);

      @mandatory
      NetPrice            : Decimal(11, 2);
      PriceUnit           : Decimal(5, 0) default 1;

      @mandatory
      DeliveryDate        : Date;

      @mandatory
      ValidityDate        : Date; // Quote validity end date

      QuoteStatus         : String(10) default 'SUBMITTED'; // SUBMITTED, SELECTED, REJECTED

      Currency            : String(5) default 'AUD';

      // Additional quote details
      PaymentTerms        : String(4);
      DeliveryTerms       : String(20);
      Comments            : String(1000);

      // Associations
      toPurchaseOrder     : Association to PurchaseOrderHeader
                              on toPurchaseOrder.PurchaseOrder = PurchaseOrder;
      toPurchaseOrderItem : Association to PurchaseOrderItem
                              on  toPurchaseOrderItem.PurchaseOrder     = PurchaseOrder
                              and toPurchaseOrderItem.PurchaseOrderItem = PurchaseOrderItem;
      toSupplier          : Association to VendorMaster
                              on toSupplier.Supplier = Supplier;
      toMaterial          : Association to MaterialMaster
                              on toMaterial.Material = Material;
}

// RFQ Status tracking
entity RFQStatus : managed {
  key PurchaseOrder    : String(10); // RFQ Number

      @mandatory
      Status           : String(20) default 'DRAFT'; // DRAFT, SENT, RESPONDED, EVALUATED, CLOSED

      SentDate         : DateTime;
      ResponseDeadline : DateTime;
      EvaluationDate   : DateTime;
      ClosedDate       : DateTime;

      // Associations
      toPurchaseOrder  : Association to PurchaseOrderHeader
                           on toPurchaseOrder.PurchaseOrder = PurchaseOrder;
      toQuotes         : Composition of many RFQQuote
                           on toQuotes.PurchaseOrder = PurchaseOrder;
}
