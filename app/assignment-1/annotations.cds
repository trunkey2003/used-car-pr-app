using PRManagementService as service from '../../srv/service';

annotate service.PurchaseRequisition with @(
    UI.SelectionFields               : [
        Material,
        Plant,
        PurchasingGroup,
        ReleaseStatus,
        RequisitionDate
    ],

    UI.LineItem                      : [
        {
            $Type: 'UI.DataField',
            Value: PurchaseRequisition,
            Label: 'PR Number'
        },
        {
            $Type : 'UI.DataFieldWithNavigationPath',
            Value : Material,
            Label : 'Material',
            Target: 'toMaterial'
        },
        {
            $Type: 'UI.DataField',
            Value: toMaterial.MaterialDescription.MaterialDescription,
            Label: 'Material Description'
        },
        {
            $Type : 'UI.DataFieldWithNavigationPath',
            Value : Plant,
            Label : 'Plant',
            Target: 'toPlant'
        },
        // {
        //   $Type: 'UI.DataFieldWithNavigationPath',
        //   Value: Supplier,
        //   Label: 'Supplier',
        //   Target: 'toSupplier'
        // },
        {
            $Type: 'UI.DataField',
            Value: Quantity,
            Label: 'Quantity'
        },
        {
            $Type: 'UI.DataField',
            Value: DeliveryDate,
            Label: 'Delivery Date'
        },
        {
            $Type: 'UI.DataField',
            Value: ReleaseStatus,
            Label: 'Release Status'
        }
    ],

    UI.PresentationVariant           : {
        SortOrder     : [{
            Property  : RequisitionDate,
            Descending: true
        }],
        Visualizations: ['@UI.LineItem']
    },

    UI.HeaderFacets                  : [{
        $Type : 'UI.ReferenceFacet',
        Label : 'Header',
        ID    : 'Header',
        Target: '@UI.FieldGroup#Header'
    }],

    UI.FieldGroup #Header            : {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: PurchaseRequisition,
                Label: 'PurchaseRequisition'
            },
            {
                $Type : 'UI.DataFieldWithNavigationPath',
                Value : Material,
                Label : 'Material',
                Target: 'toMaterial'
            },
            {
                $Type : 'UI.DataFieldWithNavigationPath',
                Value : Plant,
                Label : 'Plant',
                Target: 'toPlant'
            },
            //   {
            //     $Type: 'UI.DataFieldWithNavigationPath',
            //     Value: Supplier,
            //     Label: 'Supplier',
            //     Target: '@UI.FieldGroup #SupplierInfo2'
            //   },
            {
                $Type: 'UI.DataField',
                Value: ReleaseStatus,
                Label: 'ReleaseStatus'
            }
        ]
    },

    UI.FieldGroup #GeneralInformation: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: PurchaseRequisition,
                Label: 'PurchaseRequisition'
            },
            {
                $Type: 'UI.DataField',
                Value: PurchaseReqnItem,
                Label: 'PurchaseReqnItem'
            },
            {
                $Type: 'UI.DataField',
                Value: BaseUnit,
                Label: 'BaseUnit'
            },
            {
                $Type: 'UI.DataField',
                Value: CreatedByUser,
                Label: 'CreatedByUser'
            },
            {
                $Type: 'UI.DataField',
                Value: DeliveryDate,
                Label: 'DeliveryDate'
            },
            {
                $Type : 'UI.DataFieldWithNavigationPath',
                Value : Material,
                Label : 'Material',
                Target: 'toMaterial'
            },
            {
                $Type : 'UI.DataFieldWithNavigationPath',
                Value : Plant,
                Label : 'Plant',
                Target: 'toPlant'
            },
            //   {
            //     $Type: 'UI.DataFieldWithNavigationPath',
            //     Value: Supplier,
            //     Label: 'Supplier',
            //     Target: 'toSupplier'
            //   },
            {
                $Type: 'UI.DataField',
                Value: PurchaseRequisitionType,
                Label: 'PurchaseRequisitionType'
            },
            {
                $Type: 'UI.DataField',
                Value: PurchasingGroup,
                Label: 'PurchasingGroup'
            },
            {
                $Type: 'UI.DataField',
                Value: Quantity,
                Label: 'Quantity'
            },
            {
                $Type: 'UI.DataField',
                Value: ReleaseStatus,
                Label: 'ReleaseStatus'
            },
            {
                $Type: 'UI.DataField',
                Value: RequisitionDate,
                Label: 'RequisitionDate'
            },
            {
                $Type: 'UI.DataField',
                Value: Requisitioner,
                Label: 'Requisitioner'
            },
            {
                $Type: 'UI.DataField',
                Value: StorageLocation,
                Label: 'StorageLocation'
            },
            {
                $Type: 'UI.DataField',
                Value: toPurchasingInfoRecord.toPurchasingOrgInfo.NetPrice,
                Label: 'NetPrice'
            },
            {
                $Type: 'UI.DataField',
                Value: toPurchasingInfoRecord.toPurchasingOrgInfo.PriceUnit,
                Label: 'PriceUnit'
            }
        ]
    },

    UI.FieldGroup #AccountAssignments: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: AccountAssignments.AcctAssignment,
                Label: 'AcctAssignment'
            },
            {
                $Type: 'UI.DataField',
                Value: AccountAssignments.AcctAssignmentCategory,
                Label: 'AcctAssignmentCategory'
            },
            {
                $Type: 'UI.DataField',
                Value: AccountAssignments.CostCenter,
                Label: 'CostCenter'
            },
            {
                $Type: 'UI.DataField',
                Value: AccountAssignments.GLAccount,
                Label: 'GLAccount'
            },
            {
                $Type: 'UI.DataField',
                Value: AccountAssignments.Order,
                Label: 'Order'
            },
            {
                $Type: 'UI.DataField',
                Value: AccountAssignments.PurchaseReqnItem,
                Label: 'PurchaseReqnItem'
            },
            {
                $Type: 'UI.DataField',
                Value: AccountAssignments.PurchaseRequisition,
                Label: 'PurchaseRequisition'
            }
        ]
    },

    UI.FieldGroup #MaterialDetails   : {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: toMaterial.BaseUnit,
                Label: 'BaseUnit'
            },
            {
                $Type: 'UI.DataField',
                Value: toMaterial.CreationDate,
                Label: 'CreationDate'
            },
            {
                $Type: 'UI.DataField',
                Value: toMaterial.IndustrySector,
                Label: 'IndustrySector'
            },
            {
                $Type: 'UI.DataField',
                Value: toMaterial.Material,
                Label: 'Material'
            },
            {
                $Type: 'UI.DataField',
                Value: toMaterial.MaterialType,
                Label: 'MaterialType'
            },
            {
                $Type: 'UI.DataField',
                Value: toMaterial.MaterialGroup,
                Label: 'MaterialGroup'
            },
            {
                $Type: 'UI.DataField',
                Value: toMaterial.MaterialDescription.Language,
                Label: 'Language'
            },
            {
                $Type: 'UI.DataField',
                Value: toMaterial.MaterialDescription.Material,
                Label: 'Material'
            },
            {
                $Type: 'UI.DataField',
                Value: toMaterial.MaterialDescription.MaterialDescription,
                Label: 'MaterialDescription'
            }
        ]
    },

    UI.FieldGroup #SupplierInfo      : {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: toPurchasingInfoRecord.Material,
                Label: 'Material'
            },
            {
                $Type: 'UI.DataField',
                Value: toPurchasingInfoRecord.PurchasingInfoRecord,
                Label: 'PurchasingInfoRecord'
            }
        ]
    },

    UI.FieldGroup #SupplierInfo2     : {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: toPurchasingInfoRecord.toSupplier.Supplier,
                Label: 'Supplier ID'
            },
            {
                $Type: 'UI.DataField',
                Value: toPurchasingInfoRecord.toSupplier.SupplierName,
                Label: 'Supplier Name'
            },
            {
                $Type: 'UI.DataField',
                Value: toPurchasingInfoRecord.toSupplier.City,
                Label: 'City'
            },
            {
                $Type: 'UI.DataField',
                Value: toPurchasingInfoRecord.toSupplier.Country,
                Label: 'Country'
            }
        ]
    },


    UI.Facets                        : [
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'General Information',
            ID    : 'GeneralInformation',
            Target: '@UI.FieldGroup#GeneralInformation'
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Account Assignments',
            ID    : 'AccountAssignments',
            Target: '@UI.FieldGroup#AccountAssignments'
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Material Details',
            ID    : 'MaterialDetails',
            Target: '@UI.FieldGroup#MaterialDetails'
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Supplier Info',
            ID    : 'PurchasingInfoRecords',
            Target: '@UI.FieldGroup#SupplierInfo'
        }
    ],

    UI.Identification                : [
        {
            $Type : 'UI.DataFieldForAction',
            Action: 'PRService.approve',
            Label : '{i18n>Approve}'
        },
        {
            $Type : 'UI.DataFieldForAction',
            Action: 'PRService.reject',
            Label : '{i18n>Reject}'
        }
    ],


);
