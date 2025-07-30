using PRService as service from '../../srv/service';
annotate service.PurchaseOrderHeader with @(
  // Filters on the List Report
  UI.SelectionFields: [
    Supplier,
    PurchasingGroup,
    DocumentDate,
    PurchaseOrderType
  ],

  // Columns shown in the List Report table
  UI.LineItem: [
    {
      $Type: 'UI.DataField',
      Value: PurchaseOrder,
      Label: 'Purchase Order'
    },
    {
      $Type: 'UI.DataFieldWithNavigationPath',
      Value: Supplier,
      Label: 'Supplier',
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
  UI.PresentationVariant: {
    SortOrder: [
      {
        Property: DocumentDate,
        Descending: true
      }
    ],
    Visualizations: ['@UI.LineItem']
  },

  // Optional grouping or facets if desired
  UI.Facets: [
    {
        $Type : 'UI.ReferenceFacet',
        Label : 'General Information',
        ID : 'GeneralInformation',
        Target : '@UI.FieldGroup#GeneralInformation',
    },
    {
        $Type : 'UI.ReferenceFacet',
        Label : 'Items',
        ID : 'Items',
        Target : '@UI.FieldGroup#Items',
    },
    {
        $Type : 'UI.ReferenceFacet',
        Label : ' Supplier Details',
        ID : 'SupplierDetails',
        Target : '@UI.FieldGroup#SupplierDetails',
    },
    {
        $Type : 'UI.ReferenceFacet',
        Label : 'PR Reference',
        ID : 'PRReference',
        Target : '@UI.FieldGroup#PRReference',
    },
    {
        $Type : 'UI.ReferenceFacet',
        Label : 'Pricing',
        ID : 'Pricing',
        Target : '@UI.FieldGroup#Pricing',
    },
],
    UI.FieldGroup #GeneralInformation : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : Currency,
                Label : 'Currency',
            },
            {
                $Type : 'UI.DataField',
                Value : DocumentCategory,
                Label : 'DocumentCategory',
            },
            {
                $Type : 'UI.DataField',
                Value : DocumentDate,
                Label : 'DocumentDate',
            },
            {
                $Type : 'UI.DataField',
                Value : PaymentTerms,
                Label : 'PaymentTerms',
            },
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
        ],
    },
    UI.FieldGroup #Items : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : toPurchaseOrderItem.BaseUnit,
                Label : 'BaseUnit',
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
        ],
    },
    UI.FieldGroup #SupplierDetails : {
        $Type : 'UI.FieldGroupType',
        Data : [
        ],
    },
    UI.FieldGroup #PRReference : {
        $Type : 'UI.FieldGroupType',
        Data : [
        ],
    },
    UI.FieldGroup #Pricing : {
        $Type : 'UI.FieldGroupType',
        Data : [
        ],
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
                Value : PurchaseOrder,
                Label : 'PurchaseOrder',
            },
            {
                $Type : 'UI.DataField',
                Value : Supplier,
                Label : 'Supplier',
            },
            {
                $Type : 'UI.DataField',
                Value : DocumentDate,
                Label : 'DocumentDate',
            },
            {
                $Type : 'UI.DataField',
                Value : Currency,
                Label : 'Currency',
            },
        ],
    },
    UI.Identification : [
        {
            $Type : 'UI.DataFieldForAction',
            Action : 'PRService.approve',
            Label : '{i18n>Approve1}',
            Determining : true,
        },
        {
            $Type : 'UI.DataFieldForAction',
            Action : 'PRService.reject',
            Label : '{i18n>Reject1}',
            Determining : true,
        },
    ],
);

