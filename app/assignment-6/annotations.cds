using SourcingRFQService as service from '../../srv/PRManagementService/service';
using from '../../srv/PRManagementService/service';

annotate service.PurchaseOrderHeader with @(
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Value : PurchaseOrder,
            Label : 'PurchaseOrder',
        },
        {
            $Type : 'UI.DataField',
            Value : PurchaseOrderType,
            Label : 'PurchaseOrderType',
        },
        {
            $Type : 'UI.DataField',
            Value : PurchasingGroup,
            Label : 'PurchasingGroup',
        },
        {
            $Type : 'UI.DataField',
            Value : Supplier,
            Label : 'Supplier',
        },
        {
            $Type : 'UI.DataField',
            Value : Currency,
            Label : 'Currency',
        },
        {
            $Type : 'UI.DataField',
            Value : PaymentTerms,
            Label : 'PaymentTerms',
        },
        {
            $Type : 'UI.DataField',
            Value : DocumentDate,
            Label : 'DocumentDate',
        },
        {
            $Type : 'UI.DataField',
            Value : DocumentCategory,
            Label : 'DocumentCategory',
        },
    ],
    UI.SelectionFields : [
        Supplier,
        DocumentDate,
        toPurchaseOrderItem.Material,
        toPurchaseOrderItem.Plant,
    ],
);

annotate service.PurchaseOrderHeader with {
    Supplier @Common.Label : 'Supplier'
};

annotate service.PurchaseOrderHeader with {
    DocumentDate @Common.Label : 'DocumentDate'
};

annotate service.PurchaseOrderItem with {
    Material @Common.Label : 'toPurchaseOrderItem/Material'
};

annotate service.PurchaseOrderItem with {
    Plant @Common.Label : 'toPurchaseOrderItem/Plant'
};

