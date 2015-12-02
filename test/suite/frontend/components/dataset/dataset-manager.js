(function() {
'use strict';

angular
    .module('gridjs-test.dataset')
    .factory('datasetManager', [
        'Dataset',
        'datasetRepository',
        createDatasetManager
    ]);

function createDatasetManager(Dataset, datasetRepository) {
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
            return datasetRepository.load(name).then(createDatasetFromJson);
        },
        save: function(dataset) {
            return datasetRepository.save(dataset.name, normalize(dataset));
        }

    };

    return datasetManager;
}

function createDatasetFromJson(datasetJson) {
    // TODO: handle differences between actual data set and
    // application state handling Dataset object
    return datasetJson;
}

function normalize(dataset) {
    // TODO: analogous to the method above
    return dataset;
}

}());
