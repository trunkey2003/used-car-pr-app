using PRService as service from '../../srv/service';
annotate service.MaterialDocument with @(
    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'MaterialDocument',
                Value : MaterialDocument,
            },
            {
                $Type : 'UI.DataField',
                Label : 'MaterialDocumentYear',
                Value : MaterialDocumentYear,
            },
            {
                $Type : 'UI.DataField',
                Label : 'MaterialDocumentItem',
                Value : MaterialDocumentItem,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Material',
                Value : Material,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Plant',
                Value : Plant,
            },
            {
                $Type : 'UI.DataField',
                Label : 'StorageLocation',
                Value : StorageLocation,
            },
            {
                $Type : 'UI.DataField',
                Label : 'PurchaseOrder',
                Value : PurchaseOrder,
            },
            {
                $Type : 'UI.DataField',
                Label : 'PurchaseOrderItem',
                Value : PurchaseOrderItem,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Quantity',
                Value : Quantity,
            },
            {
                $Type : 'UI.DataField',
                Label : 'BaseUnit',
                Value : BaseUnit,
            },
            {
                $Type : 'UI.DataField',
                Label : 'MovementType',
                Value : MovementType,
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
    ],
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'MaterialDocumentItem',
            Value : MaterialDocumentItem,
        },
        {
            $Type : 'UI.DataField',
            Label : 'MaterialDocumentYear',
            Value : MaterialDocumentYear,
        },
        {
            $Type : 'UI.DataField',
            Label : 'MaterialDocument',
            Value : MaterialDocument,
        },
        {
            $Type : 'UI.DataField',
            Label : 'Material',
            Value : Material,
        },
        {
            $Type : 'UI.DataField',
            Label : 'Plant',
            Value : Plant,
        },
    ],
);

