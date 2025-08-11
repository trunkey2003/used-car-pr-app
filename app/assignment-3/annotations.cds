using PRService as service from '../../srv/service';

annotate service.MaterialDocument with @(
    UI.FieldGroup #GeneratedGroup: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Label: 'MaterialDocument',
                Value: MaterialDocument,
            },
            {
                $Type: 'UI.DataField',
                Label: 'MaterialDocumentYear',
                Value: MaterialDocumentYear,
            },
            {
                $Type: 'UI.DataField',
                Label: 'MaterialDocumentItem',
                Value: MaterialDocumentItem,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Material',
                Value: Material,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Plant',
                Value: Plant,
            },
            {
                $Type: 'UI.DataField',
                Label: 'StorageLocation',
                Value: StorageLocation,
            },
            {
                $Type: 'UI.DataField',
                Label: 'PurchaseOrder',
                Value: PurchaseOrder,
            },
            {
                $Type: 'UI.DataField',
                Label: 'PurchaseOrderItem',
                Value: PurchaseOrderItem,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Quantity',
                Value: Quantity,
            },
            {
                $Type: 'UI.DataField',
                Label: 'BaseUnit',
                Value: BaseUnit,
            },
            {
                $Type: 'UI.DataField',
                Label: 'MovementType',
                Value: MovementType,
            },
        ],
    },
    UI.Facets                    : [{
        $Type : 'UI.ReferenceFacet',
        ID    : 'GeneratedFacet1',
        Label : 'General Information',
        Target: '@UI.FieldGroup#GeneratedGroup',
    },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Material Details',
            ID : 'MaterialDetails',
            Target : '@UI.FieldGroup#MaterialDetails',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'PO Details',
            ID : 'PODetails',
            Target : '@UI.FieldGroup#PODetails',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Plant/Storage',
            ID : 'PlantStorage',
            Target : '@UI.FieldGroup#PlantStorage',
        }, ],
    UI.LineItem                  : [
        {
            $Type: 'UI.DataField',
            Label: 'MaterialDocument',
            Value: MaterialDocument,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Material',
            Value: Material,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Plant',
            Value: Plant,
        },
        {
            $Type: 'UI.DataField',
            Value: PurchaseOrder,
        },
        {
            $Type: 'UI.DataField',
            Value: Quantity,
            Label: 'Quantity',
        },
        {
            $Type: 'UI.DataField',
            Value: toMaterial.MaterialDescription.MaterialDescription,
            Label: 'MaterialDescription',
        },
        {
            $Type: 'UI.DataField',
            Value: MaterialDocumentYear,
            Label: 'MaterialDocumentYear',
        },
    ],
    UI.SelectionFields           : [
        Material,
        Plant,
        PurchaseOrder,
        MovementType,
    ],
    UI.PresentationVariant       : {
        SortOrder     : [{
            Property  : MaterialDocumentYear,
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
                Value : MaterialDocument,
                Label : 'MaterialDocument',
            },
            {
                $Type : 'UI.DataField',
                Value : MaterialDocumentYear,
                Label : 'MaterialDocumentYear',
            },
            {
                $Type : 'UI.DataField',
                Value : MovementType,
            },
        ],
    },
    UI.FieldGroup #MaterialDetails : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : toMaterial.BaseUnit,
                Label : 'BaseUnit',
            },
            {
                $Type : 'UI.DataField',
                Value : toMaterial.CreationDate,
                Label : 'CreationDate',
            },
            {
                $Type : 'UI.DataField',
                Value : toMaterial.IndustrySector,
                Label : 'IndustrySector',
            },
            {
                $Type : 'UI.DataField',
                Value : toMaterial.Material,
                Label : 'Material',
            },
            {
                $Type : 'UI.DataField',
                Value : toMaterial.MaterialGroup,
                Label : 'MaterialGroup',
            },
            {
                $Type : 'UI.DataField',
                Value : toMaterial.MaterialType,
                Label : 'MaterialType',
            },
            {
                $Type : 'UI.DataField',
                Value : toMaterial.MaterialDescription.MaterialDescription,
                Label : 'MaterialDescription',
            },
            {
                $Type : 'UI.DataField',
                Value : toMaterial.MaterialDescription.Material,
                Label : 'Material',
            },
            {
                $Type : 'UI.DataField',
                Value : toMaterial.MaterialDescription.Language,
                Label : 'Language',
            },
        ],
    },
    UI.FieldGroup #PODetails : {
        $Type : 'UI.FieldGroupType',
        Data : [
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
                Value : toPurchaseOrderHeader.PurchaseOrder,
                Label : 'PurchaseOrder',
            },
            {
                $Type : 'UI.DataField',
                Value : toPurchaseOrderHeader.PurchaseOrderType,
                Label : 'PurchaseOrderType',
            },
            {
                $Type : 'UI.DataField',
                Value : toPurchaseOrderHeader.PurchasingGroup,
                Label : 'PurchasingGroup',
            },
            {
                $Type : 'UI.DataField',
                Value : toPurchaseOrderHeader.Currency,
                Label : 'Currency',
            },
            {
                $Type : 'UI.DataField',
                Value : toPurchaseOrderHeader.DocumentCategory,
                Label : 'DocumentCategory',
            },
            {
                $Type : 'UI.DataField',
                Value : toPurchaseOrderHeader.DocumentDate,
                Label : 'DocumentDate',
            },
            {
                $Type : 'UI.DataField',
                Value : toPurchaseOrderHeader.PaymentTerms,
                Label : 'PaymentTerms',
            },
            {
                $Type : 'UI.DataField',
                Value : toPurchaseOrderHeader.Supplier,
                Label : 'Supplier',
            },
        ],
    },
    UI.FieldGroup #PlantStorage : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : toPlant.Plant,
                Label : 'Plant',
            },
            {
                $Type : 'UI.DataField',
                Value : toPlant.PlantName,
                Label : 'PlantName',
            },
            {
                $Type : 'UI.DataField',
                Value : toPlant.City,
                Label : 'City',
            },
            {
                $Type : 'UI.DataField',
                Value : toPlant.Country,
                Label : 'Country',
            },
            {
                $Type : 'UI.DataField',
                Value : toStorageLocation.StorageLocation,
                Label : 'StorageLocation',
            },
            {
                $Type : 'UI.DataField',
                Value : toStorageLocation.StorageLocationDescription,
                Label : 'StorageLocationDescription',
            },
        ],
    },
);

annotate service.MaterialDocument with {
    Material @Common.Label: 'Material'
};

annotate service.MaterialDocument with {
    Plant @Common.Label: 'Plant'
};

annotate service.MaterialDocument with {
    PurchaseOrder @Common.Label: 'PurchaseOrder'
};

annotate service.MaterialDocument with {
    MovementType @Common.Label: 'MovementType'
};
