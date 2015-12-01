(function() {
'use strict';

angular
    .module('gridjs-test.navigation', [])
    .directive('navigation', navigationDirective)
    .controller('NavigationController', 
        ['$rootScope', '$state', NavigationController]);

function navigationDirective() {
    return {
        templateUrl: 'components/navigation/navigation.html',
        scope: {
            navTabs: '='
        },
        bindToController: true,
        controller: 'NavigationController',
        controllerAs: 'navigation'
    };
}

function NavigationController($rootScope, $state) {
    this.$state = $state;

    $rootScope.$on('$stateChangeSuccess', this.updateStatesActivity.bind(this));
    // Reflect current state.
    this.updateStatesActivity();
}

NavigationController.prototype.navigate = function(state) {
    this.$state.go(state);
};

NavigationController.prototype.updateStatesActivity = function() {
    this.navTabs.forEach(function(tab) {
        tab.isActive = this.$state.includes(tab.state);
    }.bind(this));
};

}());