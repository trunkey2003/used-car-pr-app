using InvoiceProcessingService as service from '../../srv/PRManagementService/service';
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
        {
            $Type : 'UI.CollectionFacet',
            Label : 'Accounting',
            ID : 'Accounting',
            Facets : [
                {
                    $Type : 'UI.ReferenceFacet',
                    Label : 'AccountingDocumentHeader',
                    ID : 'BKPF',
                    Target : '@UI.FieldGroup#BKPF',
                },
                {
                    $Type : 'UI.ReferenceFacet',
                    Label : 'AccountingDocumentItem',
                    ID : 'AccountingDocumentItem',
                    Target : 'toAccountingDocumentItem/@UI.LineItem#AccountingDocumentItem',
                },
            ],
        },
        {
            $Type : 'UI.CollectionFacet',
            Label : 'PO Details',
            ID : 'PODetails',
            Facets : [
                {
                    $Type : 'UI.ReferenceFacet',
                    Label : 'PurchaseOrderHeader',
                    ID : 'PurchaseOrderHeader',
                    Target : '@UI.FieldGroup#PurchaseOrderHeader',
                },
                {
                    $Type : 'UI.ReferenceFacet',
                    Label : 'PurchaseOrderItems',
                    ID : 'PurchaseOrderItems',
                    Target : 'toSupplierInvoiceItem/@UI.LineItem#PurchaseOrderItems',
                },
            ],
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'GR Details',
            ID : 'GRDetails',
            Target : 'toSupplierInvoiceItem/@UI.LineItem#GRDetails',
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
    UI.FieldGroup #BKPF : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : toAccountingDocumentItem.toAccountingDocumentHeader.AccountingDocument,
                Label : 'AccountingDocument',
            },
            {
                $Type : 'UI.DataField',
                Value : toAccountingDocumentItem.toAccountingDocumentHeader.CompanyCode,
                Label : 'CompanyCode',
            },
            {
                $Type : 'UI.DataField',
                Value : toAccountingDocumentItem.toAccountingDocumentHeader.DocumentDate,
                Label : 'DocumentDate',
            },
            {
                $Type : 'UI.DataField',
                Value : toAccountingDocumentItem.toAccountingDocumentHeader.DocumentType,
                Label : 'DocumentType',
            },
            {
                $Type : 'UI.DataField',
                Value : toAccountingDocumentItem.toAccountingDocumentHeader.FiscalYear,
                Label : 'FiscalYear',
            },
        ],
    },
    UI.FieldGroup #PODetails : {
        $Type : 'UI.FieldGroupType',
        Data : [
        ],
    },
    UI.FieldGroup #PurchaseOrderHeader : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : toSupplierInvoiceItem.toPurchaseOrderHeader.Currency,
                Label : 'Currency',
            },
            {
                $Type : 'UI.DataField',
                Value : toSupplierInvoiceItem.toPurchaseOrderHeader.DocumentCategory,
                Label : 'DocumentCategory',
            },
            {
                $Type : 'UI.DataField',
                Value : toSupplierInvoiceItem.toPurchaseOrderHeader.DocumentDate,
                Label : 'DocumentDate',
            },
            {
                $Type : 'UI.DataField',
                Value : toSupplierInvoiceItem.toPurchaseOrderHeader.PaymentTerms,
                Label : 'PaymentTerms',
            },
            {
                $Type : 'UI.DataField',
                Value : toSupplierInvoiceItem.toPurchaseOrderHeader.PurchaseOrder,
                Label : 'PurchaseOrder',
            },
            {
                $Type : 'UI.DataField',
                Value : toSupplierInvoiceItem.toPurchaseOrderHeader.PurchaseOrderType,
                Label : 'PurchaseOrderType',
            },
            {
                $Type : 'UI.DataField',
                Value : toSupplierInvoiceItem.toPurchaseOrderHeader.PurchasingGroup,
                Label : 'PurchasingGroup',
            },
            {
                $Type : 'UI.DataField',
                Value : toSupplierInvoiceItem.toPurchaseOrderHeader.Supplier,
                Label : 'Supplier',
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
    ],
    UI.LineItem #PurchaseOrderItems : [
        {
            $Type : 'UI.DataField',
            Value : toPurchaseOrderItem.PurchaseOrder,
            Label : 'PurchaseOrder',
        },
        {
            $Type : 'UI.DataField',
            Value : toPurchaseOrderItem.PurchaseOrderItem,
            Label : 'PurchaseOrderItem',
        },
        {
            $Type : 'UI.DataField',
            Value : toPurchaseOrderItem.PurchaseRequisition,
            Label : 'PurchaseRequisition',
        },
        {
            $Type : 'UI.DataField',
            Value : toPurchaseOrderItem.Quantity,
            Label : 'Quantity',
        },
        {
            $Type : 'UI.DataField',
            Value : toPurchaseOrderItem.StorageLocation,
            Label : 'StorageLocation',
        },
        {
            $Type : 'UI.DataField',
            Value : toPurchaseOrderItem.Material,
            Label : 'Material',
        },
        {
            $Type : 'UI.DataField',
            Value : toPurchaseOrderItem.NetPrice,
            Label : 'NetPrice',
        },
        {
            $Type : 'UI.DataField',
            Value : toPurchaseOrderItem.Plant,
            Label : 'Plant',
        },
        {
            $Type : 'UI.DataField',
            Value : toPurchaseOrderItem.BaseUnit,
            Label : 'BaseUnit',
        },
    ],
    UI.LineItem #GRDetails : [
        {
            $Type : 'UI.DataField',
            Value : toMaterial.toMaterialDocument.Material,
        },
        {
            $Type : 'UI.DataField',
            Value : toMaterial.toMaterialDocument.MaterialDocument,
            Label : 'MaterialDocument',
        },
        {
            $Type : 'UI.DataField',
            Value : toMaterial.toMaterialDocument.MaterialDocumentItem,
            Label : 'MaterialDocumentItem',
        },
        {
            $Type : 'UI.DataField',
            Value : toMaterial.toMaterialDocument.MaterialDocumentYear,
            Label : 'MaterialDocumentYear',
        },
        {
            $Type : 'UI.DataField',
            Value : toMaterial.toMaterialDocument.MovementType,
        },
        {
            $Type : 'UI.DataField',
            Value : toMaterial.toMaterialDocument.Plant,
        },
        {
            $Type : 'UI.DataField',
            Value : toMaterial.toMaterialDocument.PurchaseOrder,
        },
        {
            $Type : 'UI.DataField',
            Value : toMaterial.toMaterialDocument.PurchaseOrderItem,
            Label : 'PurchaseOrderItem',
        },
        {
            $Type : 'UI.DataField',
            Value : toMaterial.toMaterialDocument.Quantity,
            Label : 'Quantity',
        },
        {
            $Type : 'UI.DataField',
            Value : toMaterial.toMaterialDocument.StorageLocation,
            Label : 'StorageLocation',
        },
        {
            $Type : 'UI.DataField',
            Value : toMaterial.toMaterialDocument.BaseUnit,
            Label : 'BaseUnit',
        },
    ],
);

annotate service.AccountingDocumentItem with @(
    UI.LineItem #AccountingDocumentItem : [
        {
            $Type : 'UI.DataField',
            Value : AccountingDocument,
            Label : 'AccountingDocument',
        },
        {
            $Type : 'UI.DataField',
            Value : AccountingDocumentItem,
            Label : 'AccountingDocumentItem',
        },
        {
            $Type : 'UI.DataField',
            Value : Amount,
            Label : 'Amount',
        },
        {
            $Type : 'UI.DataField',
            Value : CostCenter,
            Label : 'CostCenter',
        },
        {
            $Type : 'UI.DataField',
            Value : Currency,
            Label : 'Currency',
        },
        {
            $Type : 'UI.DataField',
            Value : FiscalYear,
            Label : 'FiscalYear',
        },
        {
            $Type : 'UI.DataField',
            Value : GLAccount,
            Label : 'GLAccount',
        },
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
    ]
);

