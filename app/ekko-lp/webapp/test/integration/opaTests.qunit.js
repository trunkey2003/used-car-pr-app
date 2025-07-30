sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'ns/ekkolp/test/integration/FirstJourney',
		'ns/ekkolp/test/integration/pages/PurchaseOrderHeaderList',
		'ns/ekkolp/test/integration/pages/PurchaseOrderHeaderObjectPage'
    ],
    function(JourneyRunner, opaJourney, PurchaseOrderHeaderList, PurchaseOrderHeaderObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('ns/ekkolp') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onThePurchaseOrderHeaderList: PurchaseOrderHeaderList,
					onThePurchaseOrderHeaderObjectPage: PurchaseOrderHeaderObjectPage
                }
            },
            opaJourney.run
        );
    }
);