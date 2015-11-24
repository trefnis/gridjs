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
        'comparison': {
            url: '/comparison',
            templateUrl: 'comparison/comparison.html',
            controller: 'ComparisonController as comparison',
        },
        'elementsEditor': {
            url: '/elements-editor',
            templateUrl: 'elements-editor/elements-editor.html',
            controller: 'ElementsEditorController as elementsEditor',
        },
        'layout': {
            url: '/layout',
            templateUrl: 'layout/layout.html',
            controller: 'LayoutController as layout',
        },
        'layoutEditor': {
            url: '/layout-editor',
            templateUrl: 'layout-editor/layout-editor.html',
            controller: 'LayoutEditorController as layoutEditor',
        }
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
    $urlRouterProvider.otherwise('/');

    Object.keys(stateNames).forEach(function(stateName) {
        $stateProvider.state(stateName, states[stateName]);
    });
}

}());
