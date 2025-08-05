sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'einalp/test/integration/FirstJourney',
		'einalp/test/integration/pages/PurchasingInfoRecordList',
		'einalp/test/integration/pages/PurchasingInfoRecordObjectPage',
		'einalp/test/integration/pages/MaterialInfoRecordPurchasingConditionsObjectPage'
    ],
    function(JourneyRunner, opaJourney, PurchasingInfoRecordList, PurchasingInfoRecordObjectPage, MaterialInfoRecordPurchasingConditionsObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('einalp') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onThePurchasingInfoRecordList: PurchasingInfoRecordList,
					onThePurchasingInfoRecordObjectPage: PurchasingInfoRecordObjectPage,
					onTheMaterialInfoRecordPurchasingConditionsObjectPage: MaterialInfoRecordPurchasingConditionsObjectPage
                }
            },
            opaJourney.run
        );
    }
);