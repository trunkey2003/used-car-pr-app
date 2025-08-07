using PRService as service from '../../srv/service';
using from '../../db/data-model';

annotate service.PurchasingInfoRecord with @(
    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'PurchasingInfoRecord',
                Value : PurchasingInfoRecord,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Material',
                Value : Material,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Supplier',
                Value : Supplier,
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
            Label : 'Pricing',
            ID : 'Pricing',
            Target : 'toPurchasingOrgInfo/@UI.LineItem#Pricing',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Conditions',
            ID : 'Conditions',
            Target : 'toPurchasingConditions/@UI.LineItem#Conditions',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Material Details',
            ID : 'MaterialDetails',
            Target : '@UI.FieldGroup#MaterialDetails',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Supplier Details',
            ID : 'SupplierDetails',
            Target : '@UI.FieldGroup#SupplierDetails',
        },
    ],
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'PurchasingInfoRecord',
            Value : PurchasingInfoRecord,
        },
        {
            $Type : 'UI.DataField',
            Label : 'Material',
            Value : Material,
        },
        {
            $Type : 'UI.DataField',
            Label : 'Supplier',
            Value : Supplier,
        },
        {
            $Type : 'UI.DataField',
            Value : toMaterial.MaterialDescription.MaterialDescription,
            Label : 'MaterialDescription',
        },
        {
            $Type : 'UI.DataField',
            Value : toSupplier.SupplierName,
            Label : 'SupplierName',
        },
        {
            $Type : 'UI.DataField',
            Value : toPurchasingOrgInfo.NetPrice,
            Label : 'NetPrice',
        },
    ],
    UI.SelectionFields : [
        Material,
        Supplier,
        toPurchasingConditions.PurchasingOrganization,
    ],
     UI.PresentationVariant           : {
        SortOrder     : [{
            Property  : PurchasingInfoRecord,
            Descending: false
        }],
        Visualizations: ['@UI.LineItem']
    },
    UI.HeaderFacets : [
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Header',
            ID : 'Headers',
            Target : '@UI.FieldGroup#Headers',
        },
    ],
    UI.FieldGroup #Headers : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : PurchasingInfoRecord,
                Label : 'PurchasingInfoRecord',
            },
            {
                $Type : 'UI.DataField',
                Value : Material,
            },
            {
                $Type : 'UI.DataField',
                Value : Supplier,
            },
        ],
    },
    UI.FieldGroup #Pricing : {
        $Type : 'UI.FieldGroupType',
        Data : [
        ],
    },
    UI.FieldGroup #MaterialDetails : {
        $Type : 'UI.FieldGroupType',
        Data : [
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
                Value : toMaterial.MaterialDescription.Language,
                Label : 'Language',
            },
            {
                $Type : 'UI.DataField',
                Value : toMaterial.MaterialDescription.MaterialDescription,
                Label : 'MaterialDescription',
            },
        ],
    },
    UI.FieldGroup #SupplierDetails : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : toSupplier.Supplier,
                Label : 'Supplier',
            },
            {
                $Type : 'UI.DataField',
                Value : toSupplier.SupplierName,
                Label : 'SupplierName',
            },
            {
                $Type : 'UI.DataField',
                Value : toSupplier.City,
                Label : 'City',
            },
            {
                $Type : 'UI.DataField',
                Value : toSupplier.Country,
                Label : 'Country',
            },
            {
                $Type : 'UI.DataField',
                Value : toSupplier.Street,
                Label : 'Street',
            },
        ],
    },
);

annotate service.PurchasingInfoRecord with {
    Material @Common.Label : 'Material'
};

annotate service.PurchasingInfoRecord with {
    Supplier @Common.Label : 'Supplier'
};

annotate service.MaterialInfoRecordPurchasingConditions with {
    PurchasingOrganization @Common.Label : 'toPurchasingConditions/PurchasingOrganization'
};

annotate service.PurchasingOrgInfoRecord with @(
    UI.LineItem #Pricing : [
        {
            $Type : 'UI.DataField',
            Value : PurchasingInfoRecord,
            Label : 'PurchasingInfoRecord',
        },
        {
            $Type : 'UI.DataField',
            Value : PurchasingOrganization,
            Label : 'PurchasingOrganization',
        },
        {
            $Type : 'UI.DataField',
            Value : PriceUnit,
            Label : 'PriceUnit',
        },
        {
            $Type : 'UI.DataField',
            Value : NetPrice,
            Label : 'NetPrice',
        },
    ]
);

annotate service.MaterialInfoRecordPurchasingConditions with @(
    UI.LineItem #Conditions : [
        {
            $Type : 'UI.DataField',
            Value : PurchaseContract,
            Label : 'PurchaseContract',
        },
        {
            $Type : 'UI.DataField',
            Value : PurchasingOrganization,
        },
        {
            $Type : 'UI.DataField',
            Value : ConditionType,
            Label : 'ConditionType',
        },
        {
            $Type : 'UI.DataField',
            Value : Application,
            Label : 'Application',
        },
        {
            $Type : 'UI.DataField',
            Value : Material,
            Label : 'Material',
        },
        {
            $Type : 'UI.DataField',
            Value : Plant,
            Label : 'Plant',
        },
        {
            $Type : 'UI.DataField',
            Value : Supplier,
            Label : 'Supplier',
        },
    ]
);

