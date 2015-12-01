(function() {
'use strict';

angular
    .module('gridjs-test.main-menu', [])
    .controller('MainMenuController', [
        'stateNames',
        'datasetRepository',
        '$uibModal',
        'dialog',
        'loadSetDialog',
        'messenger',
        MainMenuController
    ])
    .directive('mainMenu', mainMenuDirective);

function mainMenuDirective() {
    return {
        templateUrl: 'main-menu/main-menu.html',
        controller: 'MainMenuController',
        controllerAs: 'mainMenu'
    };
}

function MainMenuController(stateNames, datasetRepository, $uibModal, dialog,
 loadSetDialog, messenger) {
    //TODO get last used one from cookies/local storage etc
    this.currentSet = createNewSet();

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

    this.navTabs.type = 'pills';

    var modal = modalDialog($uibModal, dialog);

    this.newSet = function() {
        var self = this;

        if (this.currentSet.isSaved) {
            this.currentSet = createNewSet();
            return;
        }

        modal("Do you want to discard unsaved changes?")
            .then(function(result) {
                if (result) {
                    self.currentSet = createNewSet();
                }
            });
    };


    this.saveCurrentSet = function() {
        var self = this;
        var setName = this.currentSet.name;
        var dataSet = this.currentSet.dataSet;

        datasetRepository.list()
            .then(function(existingSets) {
                return _.includes(existingSets, setName + '.json')
                    ? modal("Do you want to overwrite existing set?")
                    : true;
            })
            .then(function(shouldSave) {
                return shouldSave 
                    ? datasetRepository.save(setName, dataSet)
                    : false;
            })
            .then(function(response) {
                var isSaved = response === true;
                self.currentSet.isSaved = isSaved;
                if (isSaved) {
                    messenger.info('saved current set');
                } else {
                    messenger.error('an error occured when saving');
                }
            });
    };

    this.loadSet = function() {
        var self = this;
        var name;

        datasetRepository.list()
            .then(loadSetDialog)
            .then(function(selectedName) {
                name = selectedName;
                return datasetRepository.load(selectedName);
            })
            .then(function(dataSet) {
                self.currentSet.isSaved = true;
                self.currentSet.name = name;
                self.currentSet.dataSet = dataSet;
            })
            .catch(function(reason) {
                messenger.error('unable to load data set');
            });
    }
}

function modalDialog($uibModal, dialog) {
    return function(text) {
        return $uibModal.open(dialog(text)).result;
    }
}

function createNewSet() {
    return {
        name: 'test',
        dataSet: {
            whatever: 'it is'
        }
    };
}

}());