(function() {
'use strict';

angular
    .module('gridjs-test.main-menu')
    .factory('loadSetDialog', 
        ['$uibModal', modal])
    .controller('LoadSetDialogController', 
        ['$uibModalInstance', '$scope', 'setNames', LoadSetDialogController]);

function modal($uibModal) {
    return function(setNames) {
        return $uibModal.open(loadSetDialog(setNames)).result;
    } 
}

function loadSetDialog(setNames) {
    return {
        templateUrl: 'main-menu/load-set-dialog.html',
        controller: 'LoadSetDialogController',
        controllerAs: "dialog",
        bindToController: true,
        resolve: {
            setNames: function() {
                return setNames;
            }
        }
    };
}

function LoadSetDialogController($uibModalInstance, $scope, setNames) {
    this.modal = $uibModalInstance;
    this.setNames = setNames;

    this.selectedName = this.setNames.length > 0 ? this.setNames[0] : null;

    this.submit = function() {
        this.modal.close(this.selectedName);
    };
}

}());