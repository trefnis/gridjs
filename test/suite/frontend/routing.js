(function() {
'use strict';
var states = initStates();
var stateNames = getStateNames(states);

angular
    .module('gridjs-test.routing', ['ui.router'])
    .value('states', states)
    .value('stateNames', stateNames)
    .config(['$stateProvider', '$urlRouterProvider', routeConfig]);

function initStates() {
    // All available states.
    return {
        'comparer': {
            url: '/compare',
            templateUrl: 'comparer/comparer.html',
            controller: 'ComparerController as comparer',
        },
        'editor': {
            url: '/editor',
            templateUrl: 'editor/editor.html',
            controller: 'EditorController as vm',
        },
    };
}

function getStateNames(states) {
    // Create object with state names available from DI
    // to get rid of magic strings for state names.
    var stateNames = {};
    Object.keys(states).forEach(function(stateName) {
        stateNames[stateName] = stateName;
    });
    return stateNames;
}

function routeConfig($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/editor');

    Object.keys(stateNames).forEach(function(stateName) {
        $stateProvider.state(stateName, states[stateName]);
    });
}

}());
