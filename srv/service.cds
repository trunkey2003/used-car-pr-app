using {usedcar as uc} from '../db/data-model';

service PRService {
  entity PurchaseRequisition                  as projection on uc.PurchaseRequisition
    actions {
      action approve() returns String;
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

  entity PurchaseOrderHeader                  as projection on uc.PurchaseOrderHeader
    actions {
      action approve() returns String;
    };

  entity PurchaseOrderItem                    as projection on uc.PurchaseOrderItem;
  entity MaterialDocument                    as projection on uc.MaterialDocument;
  
}
