using {usedcar as uc} from '../../db/data-model';

// 1. Purchase Requisition (PR) Management Service
service PRManagementService {
  entity PurchaseRequisition                  as projection on uc.PurchaseRequisition
    actions {
      action approve()      returns String;
      action rejectCustom() returns String;
    };

  entity PurchaseRequisitionAccountAssignment as projection on uc.PurchaseRequisitionAccountAssignment;
  entity MaterialMaster                       as projection on uc.MaterialMaster;
  entity MaterialDescription                  as projection on uc.MaterialDescription;
  entity Plant                                as projection on uc.Plant;
  entity StorageLocation                      as projection on uc.StorageLocation;
  entity PurchasingGroup                      as projection on uc.PurchasingGroup;
  entity PurchasingDocumentType               as projection on uc.PurchasingDocumentType;
  entity PurchasingInfoRecord                 as projection on uc.PurchasingInfoRecord;
  entity PurchasingOrgInfoRecord              as projection on uc.PurchasingOrgInfoRecord;
  entity VendorMaster                         as projection on uc.VendorMaster;
}

// 2. Purchase Order (PO) Management Service
service POManagementService {
  entity PurchaseOrderHeader     as projection on uc.PurchaseOrderHeader;

  entity PurchaseOrderItem       as projection on uc.PurchaseOrderItem
    actions {
      action approve()      returns String;
      action rejectCustom() returns String;
    };

  entity PurchaseRequisition     as projection on uc.PurchaseRequisition

  entity MaterialMaster          as projection on uc.MaterialMaster;
  entity MaterialDescription     as projection on uc.MaterialDescription;
  entity Plant                   as projection on uc.Plant;
  entity StorageLocation         as projection on uc.StorageLocation;
  entity PurchasingGroup         as projection on uc.PurchasingGroup;
  entity PurchasingDocumentType  as projection on uc.PurchasingDocumentType;
  entity VendorMaster            as projection on uc.VendorMaster;
  entity PurchasingInfoRecord    as projection on uc.PurchasingInfoRecord;
  entity PurchasingOrgInfoRecord as projection on uc.PurchasingOrgInfoRecord;
}

// 3. Goods Receipt (GR) Management Service
service GRManagementService {
  entity MaterialDocument    as projection on uc.MaterialDocument;
  entity PurchaseOrderHeader as projection on uc.PurchaseOrderHeader;
  entity PurchaseOrderItem   as projection on uc.PurchaseOrderItem;
  entity MaterialMaster      as projection on uc.MaterialMaster;
  entity MaterialDescription as projection on uc.MaterialDescription;
  entity Plant               as projection on uc.Plant;
  entity StorageLocation     as projection on uc.StorageLocation;
}

// 4. Supplier Invoice Processing Service
service InvoiceProcessingService {
  entity SupplierInvoiceHeader    as projection on uc.SupplierInvoiceHeader;
  entity SupplierInvoiceItem      as projection on uc.SupplierInvoiceItem;
  entity AccountingDocumentHeader as projection on uc.AccountingDocumentHeader;
  entity AccountingDocumentItem   as projection on uc.AccountingDocumentItem;
  entity PurchaseOrderHeader      as projection on uc.PurchaseOrderHeader;
  entity PurchaseOrderItem        as projection on uc.PurchaseOrderItem;
  entity MaterialDocument         as projection on uc.MaterialDocument;
  entity MaterialMaster           as projection on uc.MaterialMaster;
  entity MaterialDescription      as projection on uc.MaterialDescription;
  entity VendorMaster             as projection on uc.VendorMaster;
}

// 5. Purchasing Info Records Management Service
service InfoRecordsManagementService {
  entity PurchasingInfoRecord                   as projection on uc.PurchasingInfoRecord;
  entity PurchasingOrgInfoRecord                as projection on uc.PurchasingOrgInfoRecord;
  entity MaterialInfoRecordPurchasingConditions as projection on uc.MaterialInfoRecordPurchasingConditions;
  entity MaterialMaster                         as projection on uc.MaterialMaster;
  entity MaterialDescription                    as projection on uc.MaterialDescription;
  entity VendorMaster                           as projection on uc.VendorMaster;
  entity Plant                                  as projection on uc.Plant;
}


// 6. Sourcing & RFQ Management Service - ENHANCED
service SourcingRFQService {
  // RFQ Header (PurchaseOrderHeader with DocumentCategory="Q")
  entity PurchaseOrderHeader as projection on uc.PurchaseOrderHeader
    where DocumentCategory = 'Q'
    actions {
      action sendRFQ()                returns String;
      action closeRFQ()               returns String;
      action convertToPR()            returns String;
      action convertToPO()            returns String;
    };

  // RFQ Items
  entity PurchaseOrderItem       as projection on uc.PurchaseOrderItem;
  
  // RFQ Quotes and Status - EXPOSE THESE ENTITIES
  entity RFQQuote               as projection on uc.RFQQuote
    actions {
      action selectQuote()        returns String;
      action rejectQuote()        returns String;
    };
    
  entity RFQStatus              as projection on uc.RFQStatus;
  
  // Master Data
  entity PurchaseRequisition     as projection on uc.PurchaseRequisition;
  entity MaterialMaster          as projection on uc.MaterialMaster;
  entity MaterialDescription     as projection on uc.MaterialDescription;
  entity Plant                   as projection on uc.Plant;
  entity StorageLocation         as projection on uc.StorageLocation;
  entity PurchasingGroup         as projection on uc.PurchasingGroup;
  entity PurchasingDocumentType  as projection on uc.PurchasingDocumentType;
  entity VendorMaster            as projection on uc.VendorMaster;
  entity PurchasingInfoRecord    as projection on uc.PurchasingInfoRecord;
  entity PurchasingOrgInfoRecord as projection on uc.PurchasingOrgInfoRecord;
  
  // Functions for quote evaluation
  function getQuoteComparison(rfqId: String) returns array of {
    Supplier: String;
    SupplierName: String;
    NetPrice: Decimal(11,2);
    DeliveryDate: Date;
    TotalValue: Decimal(13,2);
    Ranking: Integer;
  };
  
  function validateRFQBudget(rfqId: String, estimatedValue: Decimal(13,2)) returns {
    withinBudget: Boolean;
    availableBudget: Decimal(13,2);
    message: String;
  };
}


