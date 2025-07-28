namespace usedcar;

// EBAN - Purchase Requisition
entity PurchaseRequisition {
  key PurchaseRequisition       : String(10);  // BANFN - Unique identifier for the purchase requisition
  key PurchaseReqnItem          : String(5);   // BNFPO - Item number of the requisition
  Material                      : String(40);  // foreign key
  Plant                         : String(4);   // foreign key
  StorageLocation               : String(4);   // foreign key
  PurchasingGroup               : String(3);   // foreign key
  PurchaseRequisitionType       : String(4);   // foreign key

  Quantity                      : Decimal(13,3); // MENGE - Requested quantity
  BaseUnit                      : String(3);     // MEINS - Unit of measure
  DeliveryDate                  : Date;          // LFDAT - Desired delivery date
  Requisitioner                 : String(12);    // AFNAM - Person requesting the material
  ReleaseStatus                 : String(8);     // FRGZU - Approval status
  RequisitionDate               : String(20);          // BADAT - Date of requisition creation
  CreatedByUser                 : String(12);    // PREQ_NAME - Name of creator

  toMaterial            : Association to MaterialMaster on toMaterial.Material = Material;
  toPlant               : Association to Plant on toPlant.Plant = Plant;
  toStorageLocation     : Association to StorageLocation on toStorageLocation.Plant = Plant and toStorageLocation.StorageLocation = StorageLocation;
  toPurchasingGroup     : Association to PurchasingGroup on toPurchasingGroup.PurchasingGroup = PurchasingGroup;
  toPurchasingDocType   : Association to PurchasingDocumentType on toPurchasingDocType.DocumentType = PurchaseRequisitionType;

  AccountAssignments : Composition of many PurchaseRequisitionAccountAssignment on AccountAssignments.PurchaseRequisition = PurchaseRequisition and AccountAssignments.PurchaseReqnItem = PurchaseReqnItem; // 1:n
}

// EBKN - Purchase Requisition Account Assignment
entity PurchaseRequisitionAccountAssignment {
  key PurchaseRequisition : String(10); // BANFN
  key PurchaseReqnItem    : String(5);  // BNFPO
  key AcctAssignment      : String(2);  // ZEKKN - Sequential number
  AcctAssignmentCategory  : String(1);  // KNTTP - Category (e.g., 'K' for Cost Center)
  GLAccount               : String(10); // SAKTO
  CostCenter              : String(10); // KOSTL
  Order                   : String(12); // AUFNR
}

// MARA - Material Master
entity MaterialMaster {
  key Material       : String(40); // MATNR
  MaterialType       : String(4);  // MTART
  IndustrySector     : String(1);  // MBRSH
  BaseUnit           : String(3);  // MEINS
  MaterialGroup      : String(9);  // MATKL
  CreationDate       : Date;       // ERSDA

  MaterialDescription       : Association to MaterialDescription on MaterialDescription.Material = Material; // 1:1
}

// MAKT - Material Descriptions
entity MaterialDescription {
  key Material      : String(40); // MATNR
  key Language      : String(2);  // SPRAS
  MaterialDescription       : String(40); // MAKTX
}

// T001W - Plants/Branches
entity Plant {
  key Plant     : String(4);  // WERKS
  PlantName     : String(30); // NAME1t
  City          : String(35); // ORT01
  Country       : String(3);  // LAND1
}

// T001L - Storage Locations
entity StorageLocation {
  key Plant                   : String(4);  // WERKS
  key StorageLocation         : String(4);  // LGORT
  StorageLocationDescription : String(16); // LGOBE
}

// T024 - Purchasing Groups
entity PurchasingGroup {
  key PurchasingGroup         : String(3);  // EKGRP
  PurchasingGroupDescription : String(30); // EKNAM
}

// T161 - Purchasing Document Types
entity PurchasingDocumentType {
  key DocumentCategory        : String(1);  // BSTYP
  key DocumentType            : String(4);  // BSART
  DocumentTypeDescription     : String(20); // BATXT
}

// EINA - Purchasing Info Record
entity PurchasingInfoRecord {
  key PurchasingInfoRecord : String(10); // INFNR

  Material : String(40); // foreign key for association
  Supplier : String(10); // foreign key for association

  // Associations based on foreign key fields
  toMaterial : Association to MaterialMaster on toMaterial.Material = Material;
  toSupplier : Association to VendorMaster on toSupplier.Supplier = Supplier;
}

// EINE - Purchasing Info Record - Org Data
entity PurchasingOrgInfoRecord {
  key PurchasingInfoRecord   : String(10); // INFNR
  key PurchasingOrganization : String(4);  // EKORG
  NetPrice                   : Decimal(11,2); // NETPR
  PriceUnit                  : Decimal(5,0);  // PEINH

  InfoRecordHeader           : Association to PurchasingInfoRecord on InfoRecordHeader.PurchasingInfoRecord = PurchasingInfoRecord; // n:1
}

// LFA1 - Vendor Master
entity VendorMaster {
  key Supplier     : String(10); // LIFNR
  SupplierName     : String(35); // NAME1
  Country          : String(3);  // LAND1
  City             : String(35); // ORT01
  Street           : String(35); // STRAS
}