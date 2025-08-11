sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'ns.assignment-3',
            componentId: 'MaterialDocumentObjectPage',
            contextPath: '/MaterialDocument'
        },
        CustomPageDefinitions
    );
});