sap.ui.define(['sap/fe/test/ListReport'], function(ListReport) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ListReport(
        {
            appId: 'ns1.ebanlp',
            componentId: 'PurchaseRequisitionList',
            contextPath: '/PurchaseRequisition'
        },
        CustomPageDefinitions
    );
});