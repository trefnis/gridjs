(function() {
'use strict';

angular
    .module('gridjs-test.numeral-input', [])
    .controller('NumeralInputController', NumeralInputController)
    .directive('numeralInput', numeralInputDirective);
    
function NumeralInputController() {
    this.increment = function(step) {
        this.getIncrementHandler()(step);
    }.bind(this);

    this.decrement = function(step) {
        this.getDecrementHandler()(step);
    }.bind(this);

}

function numeralInputDirective() {
    return {
        templateUrl: 'components/numeral-input/numeral-input.html',
        controller: 'NumeralInputController',
        controllerAs: 'numeralInput',
        bindToController: {
            step: '@',
            value: '=',
            getIncrementHandler: '&onIncrement',
            getDecrementHandler: '&onDecrement',
        },
        scope: {},
        link: function(scope) {
            if (scope.numeralInput.step === undefined) {
                scope.numeralInput.step = 1;
            }
        }
    };
}

}());