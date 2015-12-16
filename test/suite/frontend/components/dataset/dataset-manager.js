(function() {
'use strict';

angular
    .module('gridjs-test.dataset')
    .factory('datasetManager', [
        '$rootScope',
        'Dataset',
        'datasetRepository',
        createDatasetManager
    ]);

function createDatasetManager($rootScope, Dataset, datasetRepository) {
    //TODO get last used one from cookies/local storage etc
    var currentSet = null;

    var datasetManager = {
        get currentSet() {
            if (!currentSet) {
                this.initializeNewSet();
            }
            return currentSet;
        },
        initializeNewSet: function() {
            currentSet = new Dataset();
        },
        list: datasetRepository.list,
        load: function(name) {
            return datasetRepository
                .load(name)
                .then(function(datasetJson) {
                    return new Dataset(datasetJson);
                })
                .then(function(dataset) {
                    currentSet = dataset;
                    $rootScope.$broadcast('newCurrentSet', currentSet);
                    return currentSet;
                });
        },
        save: function(dataset) {
            return datasetRepository.save(dataset.name, normalize(dataset));
        }

    };

    return datasetManager;
}

function normalize(dataset) {
    // TODO: analogous to the method above
    return dataset;
}

}());
