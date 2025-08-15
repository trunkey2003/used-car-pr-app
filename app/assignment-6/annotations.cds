using SourcingRFQService as service from '../../srv/PRManagementService/service';
using from '../../srv/PRManagementService/service';

// Enhanced RFQ List Report
annotate service.PurchaseOrderHeader with @(
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Value : PurchaseOrder,
            Label : 'RFQ Number',
        },
        {
            $Type : 'UI.DataField',
            Value : toPurchaseOrderItem.Material,
            Label : 'Material',
        },
        {
            $Type : 'UI.DataField',
            Value : toPurchaseOrderItem.Plant,
            Label : 'Plant',
        },
        {
            $Type : 'UI.DataField',
            Value : toPurchaseOrderItem.Quantity,
            Label : 'Quantity',
        },
        {
            $Type : 'UI.DataField',
            Value : Supplier,
            Label : 'Supplier',
        },
        {
            $Type : 'UI.DataField',
            Value : PurchasingGroup,
            Label : 'Purchasing Group',
        },
        {
            $Type : 'UI.DataField',
            Value : DocumentDate,
            Label : 'RFQ Date',
        },
        {
            $Type : 'UI.DataField',
            Value : Currency,
            Label : 'Currency',
        },
        // RFQ Status from associated RFQStatus entity
        {
            $Type : 'UI.DataField',
            Value : toRFQStatus.Status,
            Label : 'RFQ Status',
        },
        {
            $Type : 'UI.DataField',
            Value : DocumentCategory,
            Label : 'DocumentCategory',
        },
    ],
    UI.SelectionFields : [
        toPurchaseOrderItem.Material,
        Supplier,
        DocumentDate,
        toPurchaseOrderItem.Plant,
        PurchasingGroup,
        toRFQStatus.Status,
    ],
    UI.HeaderInfo : {
        TypeName : 'RFQ',
        TypeNamePlural : 'RFQs',
        Title : {
            $Type : 'UI.DataField',
            Value : PurchaseOrder
        },
        Description : {
            $Type : 'UI.DataField',
            Value : 'Request for Quotation'
        }
    }
);

// Object Page for RFQ Details
annotate service.PurchaseOrderHeader with @(
    UI.HeaderFacets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'HeaderGeneralInfo',
            Target : '@UI.FieldGroup#GeneralInfo'
        },
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'HeaderStatusInfo',
            Target : '@UI.FieldGroup#StatusInfo'
        }
    ],
    UI.FieldGroup #GeneralInfo : {
        Data : [
            {
                $Type : 'UI.DataField',
                Value : PurchaseOrder,
                Label : 'RFQ Number'
            },
            {
                $Type : 'UI.DataField',
                Value : DocumentDate,
                Label : 'RFQ Date'
            },
            {
                $Type : 'UI.DataField',
                Value : PurchasingGroup,
                Label : 'Purchasing Group'
            },
            {
                $Type : 'UI.DataField',
                Value : Currency,
                Label : 'Currency'
            }
        ]
    },
    UI.FieldGroup #StatusInfo : {
        Data : [
            {
                $Type : 'UI.DataField',
                Value : toRFQStatus.Status,
                Label : 'RFQ Status'
            },
            {
                $Type : 'UI.DataField',
                Value : toRFQStatus.SentDate,
                Label : 'Sent Date'
            },
            {
                $Type : 'UI.DataField',
                Value : toRFQStatus.ResponseDeadline,
                Label : 'Response Deadline'
            },
            {
                $Type : 'UI.DataField',
                Value : toRFQStatus.EvaluationDate,
                Label : 'Evaluation Date'
            }
        ]
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'RFQItems',
            Label : 'RFQ Items',
            Target : 'toPurchaseOrderItem/@UI.LineItem'
        },
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'RFQQuotes',
            Label : 'Supplier Quotes',
            Target : 'toRFQQuotes/@UI.LineItem'
        }
    ]
);

// RFQ Items Table
annotate service.PurchaseOrderItem with @(
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Value : PurchaseOrderItem,
            Label : 'Item'
        },
        {
            $Type : 'UI.DataField',
            Value : Material,
            Label : 'Material'
        },
        {
            $Type : 'UI.DataField',
            Value : toMaterial.MaterialDescription.MaterialDescription,
            Label : 'Material Description'
        },
        {
            $Type : 'UI.DataField',
            Value : Plant,
            Label : 'Plant'
        },
        {
            $Type : 'UI.DataField',
            Value : StorageLocation,
            Label : 'Storage Location'
        },
        {
            $Type : 'UI.DataField',
            Value : Quantity,
            Label : 'Quantity'
        },
        {
            $Type : 'UI.DataField',
            Value : BaseUnit,
            Label : 'Unit'
        }
    ]
);

// RFQ Quotes Table
annotate service.RFQQuote with @(
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Value : Supplier,
            Label : 'Supplier'
        },
        {
            $Type : 'UI.DataField',
            Value : toSupplier.SupplierName,
            Label : 'Supplier Name'
        },
        {
            $Type : 'UI.DataField',
            Value : Material,
            Label : 'Material'
        },
        {
            $Type : 'UI.DataField',
            Value : NetPrice,
            Label : 'Net Price'
        },
        {
            $Type : 'UI.DataField',
            Value : PriceUnit,
            Label : 'Price Unit'
        },
        {
            $Type : 'UI.DataField',
            Value : DeliveryDate,
            Label : 'Delivery Date'
        },
        {
            $Type : 'UI.DataField',
            Value : ValidityDate,
            Label : 'Quote Valid Until'
        },
        {
            $Type : 'UI.DataField',
            Value : QuoteStatus,
            Label : 'Status',
            Criticality : {$edmType : 'Edm.String'}
        },
        {
            $Type : 'UI.DataFieldForAction',
            Action : 'SourcingRFQService.selectQuote',
            Label : 'Select Quote',
            ![@UI.Hidden] : {$edmType : 'Edm.Boolean'}
        }
    ],
    UI.SelectionFields : [
        Supplier,
        QuoteStatus,
        DeliveryDate,
        Material
    ]
);

// Labels for filter fields
annotate service.PurchaseOrderHeader with {
    Supplier @Common.Label : 'Supplier';
    DocumentDate @Common.Label : 'RFQ Date';
    PurchasingGroup @Common.Label : 'Purchasing Group';
};

annotate service.PurchaseOrderItem with {
    Material @Common.Label : 'Material';
    Plant @Common.Label : 'Plant';
};

annotate service.RFQStatus with {
    Status @Common.Label : 'RFQ Status';
};

// Value helps for dropdowns
annotate service.PurchaseOrderHeader with {
    Supplier @Common.ValueList : {
        $Type : 'Common.ValueListType',
        CollectionPath : 'VendorMaster',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                LocalDataProperty : Supplier,
                ValueListProperty : 'Supplier'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'SupplierName'
            }
        ]
    };
    PurchasingGroup @Common.ValueList : {
        $Type : 'Common.ValueListType',
        CollectionPath : 'PurchasingGroup',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                LocalDataProperty : PurchasingGroup,
                ValueListProperty : 'PurchasingGroup'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'PurchasingGroupDescription'
            }
        ]
    };
};

annotate service.PurchaseOrderItem with {
    Material @Common.ValueList : {
        $Type : 'Common.ValueListType',
        CollectionPath : 'MaterialMaster',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                LocalDataProperty : Material,
                ValueListProperty : 'Material'
            }
        ]
    };
    Plant @Common.ValueList : {
        $Type : 'Common.ValueListType',
        CollectionPath : 'Plant',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                LocalDataProperty : Plant,
                ValueListProperty : 'Plant'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'PlantName'
            }
        ]
    };
};

// Actions for RFQ Header
annotate service.PurchaseOrderHeader with @(
    UI.Identification : [
        {
            $Type : 'UI.DataFieldForAction',
            Action : 'SourcingRFQService.sendRFQ',
            Label : 'Send RFQ'
        },
        {
            $Type : 'UI.DataFieldForAction',
            Action : 'SourcingRFQService.closeRFQ',
            Label : 'Close RFQ'
        },
        {
            $Type : 'UI.DataFieldForAction',
            Action : 'SourcingRFQService.convertToPR',
            Label : 'Convert to PR'
        },
        {
            $Type : 'UI.DataFieldForAction',
            Action : 'SourcingRFQService.convertToPO',
            Label : 'Convert to PO'
        }
    ]
);

// Status criticality for better visualization
annotate service.RFQStatus with {
    Status @Common.Text : Status;
};

annotate service.RFQQuote with {
    QuoteStatus @Common.Text : QuoteStatus;
};