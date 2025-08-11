sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'ns/assignment-3/test/integration/FirstJourney',
		'ns/assignment-3/test/integration/pages/MaterialDocumentList',
		'ns/assignment-3/test/integration/pages/MaterialDocumentObjectPage'
    ],
    function(JourneyRunner, opaJourney, MaterialDocumentList, MaterialDocumentObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('ns/assignment-3') + '/index.html'
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