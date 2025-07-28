using PRService as service from '../../srv/service';

annotate service.PurchaseRequisition with @(
    // FILTERS
    UI.SelectionFields : [
        Material,
        Plant,
        PurchasingGroup,
        ReleaseStatus,
        RequisitionDate
    ],

    // LIST COLUMNS
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Value : PurchaseRequisition,
            Label : 'PR Number'
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
            Value : Quantity,
            Label : 'Quantity'
        },
        {
            $Type : 'UI.DataField',
            Value : DeliveryDate,
            Label : 'Delivery Date'
        },
        {
            $Type : 'UI.DataField',
            Value : ReleaseStatus,
            Label : 'Release Status'
        },
         {
            $Type : 'UI.DataField',
            Value : RequisitionDate,
            Label : 'Requisition Date'
        },
        
    ],

    
);
