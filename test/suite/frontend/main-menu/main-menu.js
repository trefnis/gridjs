(function() {
'use strict';

angular
    .module('gridjs-test.main-menu', [])
    .controller('MainMenuController', ['stateNames', MainMenuController])
    .directive('mainMenu', mainMenuDirective);

function mainMenuDirective() {
    return {
        template: '<nav navigation nav-tabs="mainMenu.navTabs"></nav>',
        controller: 'MainMenuController',
        controllerAs: 'mainMenu'
    };
}

function MainMenuController(stateNames) {
    this.navTabs = [
        {
            state: stateNames.elementsEditor,
            heading: 'Edit elements',
        },
        {
            state: stateNames.layout,
            heading: 'Algorithm layout',
        },
        {
            state: stateNames.layoutEditor,
            heading: 'Manual layout',
        },
        {
            state: stateNames.comparison,
            heading: 'Compare auto & manual',
        },
    ];
}

}());