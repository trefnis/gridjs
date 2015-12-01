(function() {
'use strict';

angular
    .module('gridjs-test.dataset', [])
    .factory('datasetRepository', ['apiUrl', '$http', DatasetRepository]);

function DatasetRepository(apiUrl, $http) {
    return {
        load: load,
        save: save,
        list: list
    };

    function load(name) {
        return $http.get(url(name)).then(responseData);
    }

    function save(name, dataset) {
        return $http.post(url(name), dataset)
            .then(function(response) {
                if (response.status === 200) {
                    return true;
                }
            });
    }

    function list() {
        return $http.get(apiUrl + '/data')
            .then(function(response) {
                var files = response.data;
                return files.map(truncateExtension);
            });
    }

    function url(name) {
        return apiUrl + '/data/' + name + '.json';
    }

    function responseData(response) {
        return response.data;
    }

    function truncateExtension(filename) {
        return filename.slice(0, filename.lastIndexOf('.'));
    }
}

}());