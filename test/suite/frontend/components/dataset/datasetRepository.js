(function() {
'use strict';

angular
    .module('app')
    .factory('datasetRepository', ['apiUrl', '$http', DatasetRepository]);

function DatasetRepository(apiUrl, $http) {
    return {
        load: load,
        save: save
    };

    function url(name) {
        return apiUrl + '/data/' + name + '.json';
    }

    function load(name) {
        return $http.get(url(name)).then(function(response) {
            return response.data;
        });
    }

    function save(name, dataset) {
        return $http.post(url(name), dataset);
    }    
}

}());