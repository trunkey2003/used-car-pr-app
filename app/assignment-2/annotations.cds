using POManagementService as service from '../../srv/service';

annotate service.PurchaseOrderHeader with @(
    // Filters on the List Report
    UI.SelectionFields #App1              : [
        Supplier,
        PurchasingGroup,
        DocumentDate,
        PurchaseOrderType
    ],

    // Columns shown in the List Report table with navigation
    UI.LineItem #App1                     : [
        {
            $Type: 'UI.DataField',
            Value: PurchaseOrder,
            Label: 'Purchase Order'
        },
        {
            $Type : 'UI.DataFieldWithNavigationPath',
            Value : Supplier,
            Label : 'Supplier',
            Target: 'toVendorMaster'
        },
        {
            $Type: 'UI.DataField',
            Value: toVendorMaster.SupplierName,
            Label: 'Supplier Name'
        },
        {
            $Type: 'UI.DataField',
            Value: DocumentDate,
            Label: 'Document Date'
        },
        {
            $Type: 'UI.DataField',
            Value: Currency,
            Label: 'Currency'
        }
    ],

    // Default sorting by DocumentDate descending
    UI.PresentationVariant #App1          : {
        SortOrder     : [{
            Property  : DocumentDate,
            Descending: true
        }],
        Visualizations: ['@UI.LineItem#App1']
    },

    // Optional grouping or facets if desired
    UI.Facets #App1                       : [
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'General Information',
            ID    : 'GeneralInformation',
            Target: '@UI.FieldGroup#GeneralInformation_App1',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Items',
            ID    : 'Items',
            Target: 'toPurchaseOrderItem/@UI.LineItem#Items_App1',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : ' Supplier Details',
            ID    : 'SupplierDetails',
            Target: '@UI.FieldGroup#SupplierDetails_App1',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'PR Reference',
            ID    : 'PRReference',
            Target: 'toPurchaseOrderItem/@UI.LineItem#PRReference_App1',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Pricing',
            ID    : 'Pricing',
            Target: 'toPurchaseOrderItem/@UI.LineItem#Pricing_App1',
        },
    ],

    UI.FieldGroup #GeneralInformation_App1: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: Currency,
                Label: 'Currency'
            },
            {
                $Type: 'UI.DataField',
                Value: DocumentCategory,
                Label: 'DocumentCategory'
            },
            {
                $Type: 'UI.DataField',
                Value: DocumentDate,
                Label: 'DocumentDate'
            },
            {
                $Type: 'UI.DataField',
                Value: PaymentTerms,
                Label: 'PaymentTerms'
            },
            {
                $Type: 'UI.DataField',
                Value: PurchaseOrder,
                Label: 'PurchaseOrder'
            },
            {
                $Type: 'UI.DataField',
                Value: PurchaseOrderType,
                Label: 'PurchaseOrderType'
            },
            {
                $Type: 'UI.DataField',
                Value: PurchasingGroup,
                Label: 'PurchasingGroup'
            },
            {
                $Type : 'UI.DataFieldWithNavigationPath',
                Value : Supplier,
                Label : 'Supplier',
                Target: 'toVendorMaster'
            },
        ],
    },

    UI.FieldGroup #Items_App1             : {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: toPurchaseOrderItem.BaseUnit,
                Label: 'BaseUnit'
            },
            {
                $Type : 'UI.DataFieldWithNavigationPath',
                Value : toPurchaseOrderItem.Material,
                Label : 'Material',
                Target: 'toPurchaseOrderItem/toMaterial'
            },
            {
                $Type: 'UI.DataField',
                Value: toPurchaseOrderItem.NetPrice,
                Label: 'NetPrice'
            },
            {
                $Type: 'UI.DataField',
                Value: toPurchaseOrderItem.Plant,
                Label: 'Plant'
            },
            {
                $Type: 'UI.DataField',
                Value: toPurchaseOrderItem.PurchaseOrder,
                Label: 'PurchaseOrder'
            },
            {
                $Type: 'UI.DataField',
                Value: toPurchaseOrderItem.PurchaseOrderItem,
                Label: 'PurchaseOrderItem'
            },
            {
                $Type : 'UI.DataFieldWithNavigationPath',
                Value : toPurchaseOrderItem.PurchaseRequisition,
                Label : 'Purchase Requisition',
                Target: 'toPurchaseOrderItem/toPurchaseRequisition'
            },
            {
                $Type: 'UI.DataField',
                Value: toPurchaseOrderItem.Quantity,
                Label: 'Quantity'
            },
            {
                $Type: 'UI.DataField',
                Value: toPurchaseOrderItem.StorageLocation,
                Label: 'StorageLocation'
            },
        ],
    },

    UI.FieldGroup #SupplierDetails_App1   : {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataFieldWithNavigationPath',
                Value : toVendorMaster.Supplier,
                Label : 'Supplier',
                Target: 'toVendorMaster'
            },
            {
                $Type: 'UI.DataField',
                Value: toVendorMaster.SupplierName,
                Label: 'SupplierName'
            },
            {
                $Type: 'UI.DataField',
                Value: toVendorMaster.City,
                Label: 'City'
            },
            {
                $Type: 'UI.DataField',
                Value: toVendorMaster.Country,
                Label: 'Country'
            },
            {
                $Type: 'UI.DataField',
                Value: toVendorMaster.Street,
                Label: 'Street'
            },
        ],
    },

    UI.FieldGroup #PRReference_App1       : {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataFieldWithNavigationPath',
                Value : toPurchaseOrderItem.toPurchaseRequisition.PurchaseRequisition,
                Label : 'Purchase Requisition',
                Target: 'toPurchaseOrderItem/toPurchaseRequisition'
            },
            {
                $Type: 'UI.DataField',
                Value: toPurchaseOrderItem.toPurchaseRequisition.PurchaseReqnItem,
                Label: 'PurchaseReqnItem'
            },
            {
                $Type: 'UI.DataField',
                Value: toPurchaseOrderItem.toPurchaseRequisition.PurchaseRequisitionType,
                Label: 'PurchaseRequisitionType'
            },
            {
                $Type: 'UI.DataField',
                Value: toPurchaseOrderItem.toPurchaseRequisition.PurchasingGroup,
                Label: 'PurchasingGroup'
            },
            {
                $Type: 'UI.DataField',
                Value: toPurchaseOrderItem.toPurchaseRequisition.Quantity,
                Label: 'Quantity'
            },
            {
                $Type: 'UI.DataField',
                Value: toPurchaseOrderItem.toPurchaseRequisition.ReleaseStatus,
                Label: 'ReleaseStatus'
            },
            {
                $Type: 'UI.DataField',
                Value: toPurchaseOrderItem.toPurchaseRequisition.RequisitionDate,
                Label: 'RequisitionDate'
            },
            {
                $Type: 'UI.DataField',
                Value: toPurchaseOrderItem.toPurchaseRequisition.Requisitioner,
                Label: 'Requisitioner'
            },
            {
                $Type: 'UI.DataField',
                Value: toPurchaseOrderItem.toPurchaseRequisition.StorageLocation,
                Label: 'StorageLocation'
            },
            {
                $Type: 'UI.DataField',
                Value: toPurchaseOrderItem.toPurchaseRequisition.Plant,
                Label: 'Plant'
            },
            {
                $Type: 'UI.DataField',
                Value: toPurchaseOrderItem.toPurchaseRequisition.modifiedBy
            },
            {
                $Type: 'UI.DataField',
                Value: toPurchaseOrderItem.toPurchaseRequisition.modifiedAt
            },
            {
                $Type : 'UI.DataFieldWithNavigationPath',
                Value : toPurchaseOrderItem.toPurchaseRequisition.Material,
                Label : 'Material',
                Target: 'toPurchaseOrderItem/toPurchaseRequisition/toMaterial'
            },
            {
                $Type: 'UI.DataField',
                Value: toPurchaseOrderItem.toPurchaseRequisition.BaseUnit,
                Label: 'BaseUnit'
            },
            {
                $Type: 'UI.DataField',
                Value: toPurchaseOrderItem.toPurchaseRequisition.createdAt
            },
            {
                $Type: 'UI.DataField',
                Value: toPurchaseOrderItem.toPurchaseRequisition.createdBy
            },
        ],
    },

    UI.FieldGroup #Pricing_App1           : {
        $Type: 'UI.FieldGroupType',
        Data : [],
    },

    UI.HeaderFacets #App1                 : [{
        $Type : 'UI.ReferenceFacet',
        Label : 'Header',
        ID    : 'Header',
        Target: '@UI.FieldGroup#Header_App1',
    }],

    UI.FieldGroup #Header_App1            : {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: PurchaseOrder,
                Label: 'PurchaseOrder'
            },
            {
                $Type : 'UI.DataFieldWithNavigationPath',
                Value : Supplier,
                Label : 'Supplier',
                Target: 'toVendorMaster'
            },
            {
                $Type: 'UI.DataField',
                Value: DocumentDate,
                Label: 'DocumentDate'
            },
            {
                $Type: 'UI.DataField',
                Value: Currency,
                Label: 'Currency'
            },
        ],
    },

    UI.Identification #App1               : [
        {
            $Type      : 'UI.DataFieldForAction',
            Action     : 'PRService.approve',
            Label      : '{i18n>Approve}',
            Determining: true
        },
        {
            $Type      : 'UI.DataFieldForAction',
            Action     : 'PRService.reject',
            Label      : '{i18n>Reject1}',
            Determining: true
        },
    ],

    UI.FieldGroup #Item_App1              : {
        $Type: 'UI.FieldGroupType',
        Data : [],
    },
);

annotate service.PurchaseOrderItem with @(
    UI.LineItem #Items_App1      : [
        {
            $Type: 'UI.DataField',
            Value: PurchaseOrder,
            Label: 'PurchaseOrder'
        },
        {
            $Type: 'UI.DataField',
            Value: PurchaseOrderItem,
            Label: 'PurchaseOrderItem'
        },
        {
            $Type : 'UI.DataFieldWithNavigationPath',
            Value : PurchaseRequisition,
            Label : 'Purchase Requisition',
            Target: 'toPurchaseRequisition'
        },
        {
            $Type: 'UI.DataField',
            Value: Quantity,
            Label: 'Quantity'
        },
        {
            $Type: 'UI.DataField',
            Value: StorageLocation,
            Label: 'StorageLocation'
        },
        {
            $Type: 'UI.DataField',
            Value: BaseUnit,
            Label: 'BaseUnit'
        },
        {
            $Type : 'UI.DataFieldWithNavigationPath',
            Value : Material,
            Label : 'Material',
            Target: 'toMaterial'
        },
        {
            $Type: 'UI.DataField',
            Value: NetPrice,
            Label: 'NetPrice'
        },
        {
            $Type: 'UI.DataField',
            Value: Plant,
            Label: 'Plant'
        },
    ],

    UI.LineItem #PRReference_App1: [
        {
            $Type: 'UI.DataField',
            Value: PurchaseOrder,
            Label: 'PurchaseOrder'
        },
        {
            $Type: 'UI.DataField',
            Value: toPurchaseRequisition.PurchaseReqnItem,
            Label: 'PurchaseReqnItem'
        },
        {
            $Type : 'UI.DataFieldWithNavigationPath',
            Value : toPurchaseRequisition.PurchaseRequisition,
            Label : 'Purchase Requisition',
            Target: 'toPurchaseRequisition'
        },
        {
            $Type: 'UI.DataField',
            Value: toPurchaseRequisition.PurchaseRequisitionType,
            Label: 'PurchaseRequisitionType'
        },
        {
            $Type: 'UI.DataField',
            Value: toPurchaseRequisition.PurchasingGroup,
            Label: 'PurchasingGroup'
        },
        {
            $Type: 'UI.DataField',
            Value: toPurchaseRequisition.Quantity,
            Label: 'Quantity'
        },
        {
            $Type: 'UI.DataField',
            Value: toPurchaseRequisition.ReleaseStatus,
            Label: 'ReleaseStatus'
        },
        {
            $Type: 'UI.DataField',
            Value: toPurchaseRequisition.RequisitionDate,
            Label: 'RequisitionDate'
        },
        {
            $Type: 'UI.DataField',
            Value: toPurchaseRequisition.Requisitioner,
            Label: 'Requisitioner'
        },
        {
            $Type: 'UI.DataField',
            Value: toPurchaseRequisition.StorageLocation,
            Label: 'StorageLocation'
        },
        {
            $Type: 'UI.DataField',
            Value: toPurchaseRequisition.BaseUnit,
            Label: 'BaseUnit'
        },
        {
            $Type: 'UI.DataField',
            Value: toPurchaseRequisition.createdAt
        },
        {
            $Type : 'UI.DataFieldWithNavigationPath',
            Value : toPurchaseRequisition.Material,
            Label : 'Material',
            Target: 'toPurchaseRequisition/toMaterial'
        },
        {
            $Type: 'UI.DataField',
            Value: toPurchaseRequisition.Plant,
            Label: 'Plant'
        },
        {
            $Type: 'UI.DataField',
            Value: toPurchaseRequisition.modifiedAt
        },
        {
            $Type: 'UI.DataField',
            Value: toPurchaseRequisition.modifiedBy
        },
    ],

    UI.LineItem #Pricing_App1    : [
        {
            $Type: 'UI.DataField',
            Value: PurchaseOrder,
            Label: 'PurchaseOrder'
        },
        {
            $Type: 'UI.DataField',
            Value: PurchaseOrderItem,
            Label: 'PurchaseOrderItem'
        },
        {
            $Type: 'UI.DataField',
            Value: toPurchaseRequisition.toPurchasingInfoRecord.toPurchasingOrgInfo.PurchasingInfoRecord,
            Label: 'PurchasingInfoRecord'
        },
        {
            $Type: 'UI.DataField',
            Value: toPurchaseRequisition.toPurchasingInfoRecord.toPurchasingOrgInfo.PurchasingOrganization,
            Label: 'PurchasingOrganization'
        },
        {
            $Type: 'UI.DataField',
            Value: Quantity,
            Label: 'Quantity'
        },
        {
            $Type : 'UI.DataFieldWithNavigationPath',
            Value : Material,
            Label : 'Material',
            Target: 'toMaterial'
        },
        {
            $Type: 'UI.DataField',
            Value: toPurchaseRequisition.toPurchasingInfoRecord.toPurchasingOrgInfo.NetPrice,
            Label: 'NetPrice'
        },
    ],
);
