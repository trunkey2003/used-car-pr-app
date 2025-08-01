sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'ns/mseg-lp/test/integration/FirstJourney',
		'ns/mseg-lp/test/integration/pages/MaterialDocumentList',
		'ns/mseg-lp/test/integration/pages/MaterialDocumentObjectPage'
    ],
    function(JourneyRunner, opaJourney, MaterialDocumentList, MaterialDocumentObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('ns/mseg-lp') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheMaterialDocumentList: MaterialDocumentList,
					onTheMaterialDocumentObjectPage: MaterialDocumentObjectPage
                }
            },
            opaJourney.run
        );
    }
);