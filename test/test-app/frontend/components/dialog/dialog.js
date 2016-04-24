(function() {
'use strict';

angular
    .module('gridjs-test.dialog', [])
    .factory('dialog', ['$rootScope', function() { return dialog; }])
    .controller('DialogController', 
        ['$uibModalInstance', '$scope', 'text', DialogController]);

function dialog(text) {
    return {
        templateUrl: 'components/dialog/dialog.html',
        controller: 'DialogController',
        controllerAs: "dialog",
        bindToController: true,
        resolve: {
            text: function() {
                return text;
            }
        }
    };
}

function DialogController($uibModalInstance, $scope, text) {
    this.text = text;
    this.answer = this.answer.bind(this, $uibModalInstance);
}

DialogController.prototype.answer = function(modal, answer) {
    modal.close(answer);
};

}());