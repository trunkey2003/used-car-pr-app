using PRService as service from '../../srv/service';
annotate service.SupplierInvoiceHeader with @(
    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'SupplierInvoice',
                Value : SupplierInvoice,
            },
            {
                $Type : 'UI.DataField',
                Label : 'FiscalYear',
                Value : FiscalYear,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Supplier',
                Value : Supplier,
            },
            {
                $Type : 'UI.DataField',
                Label : 'DocumentDate',
                Value : DocumentDate,
            },
            {
                $Type : 'UI.DataField',
                Label : 'GrossAmount',
                Value : GrossAmount,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Currency',
                Value : Currency,
            },
        ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet1',
            Label : 'General Information',
            Target : '@UI.FieldGroup#GeneratedGroup',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Items',
            ID : 'RSEG',
            Target : 'toSupplierInvoiceItem/@UI.LineItem#RSEG',
        },
    ],
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'SupplierInvoice',
            Value : SupplierInvoice,
        },
        {
            $Type : 'UI.DataField',
            Label : 'Supplier',
            Value : Supplier,
        },
        {
            $Type : 'UI.DataField',
            Label : 'DocumentDate',
            Value : DocumentDate,
        },
        {
            $Type : 'UI.DataField',
            Label : 'GrossAmount',
            Value : GrossAmount,
        },
        {
            $Type : 'UI.DataField',
            Value : toSupplier.SupplierName,
            Label : 'SupplierName',
        },
    ],
    UI.SelectionFields : [
        Supplier,
        DocumentDate,
        Currency,
    ],
    UI.PresentationVariant       : {
        SortOrder     : [{
            Property  : DocumentDate,
            Descending: true
        }],
        Visualizations: ['@UI.LineItem']
    },
    UI.HeaderFacets : [
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Header',
            ID : 'Header',
            Target : '@UI.FieldGroup#Header',
        },
    ],
    UI.FieldGroup #Header : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : SupplierInvoice,
                Label : 'SupplierInvoice',
            },
            {
                $Type : 'UI.DataField',
                Value : Supplier,
            },
            {
                $Type : 'UI.DataField',
                Value : DocumentDate,
            },
            {
                $Type : 'UI.DataField',
                Value : GrossAmount,
                Label : 'GrossAmount',
            },
        ],
    },
);

annotate service.SupplierInvoiceHeader with {
    Supplier @Common.Label : 'Supplier'
};

annotate service.SupplierInvoiceHeader with {
    DocumentDate @Common.Label : 'DocumentDate'
};

annotate service.SupplierInvoiceHeader with {
    Currency @Common.Label : 'Currency'
};

annotate service.SupplierInvoiceItem with @(
    UI.LineItem #RSEG : [
        {
            $Type : 'UI.DataField',
            Value : SupplierInvoice,
            Label : 'SupplierInvoice',
        },
        {
            $Type : 'UI.DataField',
            Value : SupplierInvoiceItem,
            Label : 'SupplierInvoiceItem',
        },
        {
            $Type : 'UI.DataField',
            Value : PurchaseOrder,
            Label : 'PurchaseOrder',
        },
        {
            $Type : 'UI.DataField',
            Value : PurchaseOrderItem,
            Label : 'PurchaseOrderItem',
        },
        {
            $Type : 'UI.DataField',
            Value : Material,
            Label : 'Material',
        },
        {
            $Type : 'UI.DataField',
            Value : BaseUnit,
            Label : 'BaseUnit',
        },
        {
            $Type : 'UI.DataField',
            Value : Amount,
            Label : 'Amount',
        },
        {
            $Type : 'UI.DataField',
            Value : Quantity,
            Label : 'Quantity',
        },
    ]
);

