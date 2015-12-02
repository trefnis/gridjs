(function() {
'use strict';

angular
    .module('gridjs-test.main-menu', [])
    .controller('MainMenuController', [
        'stateNames',
        'datasetManager',
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

function MainMenuController(stateNames, datasetManager, $uibModal, dialog, 
    loadSetDialog, messenger) {
    
    this.currentSet = datasetManager.currentSet;

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
            datasetManager.initializeNewSet();
            this.currentSet = datasetManager.currentSet;
            return;
        }

        modal("Do you want to discard unsaved changes?")
            .then(function(result) {
                if (result) {
                    datasetManager.initializeNewSet();
                    self.currentSet = datasetManager.currentSet;
                }
            });
    };


    this.saveCurrentSet = function() {
        var self = this;
        var shouldSave = false;

        if (!this.currentSet.name) {
            messenger.error('set must have a name');
            return;
        }

        datasetManager.list()
            .then(function(existingSets) {
                return _.includes(existingSets, self.currentSet.name)
                    ? modal("Do you want to overwrite existing set?")
                    : true;
            })
            .then(function(save) {
                shouldSave = save;
                return shouldSave 
                    ? datasetManager.save(self.currentSet)
                    : false;
            })
            .then(function(response) {
                var isSaved = response === true;
                self.currentSet.isSaved = isSaved;
                if (isSaved) {
                    messenger.info('saved current set');
                } else if (shouldSave) {
                    messenger.error('an error occured when saving');
                }
            });
    };

    this.loadSet = function() {
        var self = this;
        var name;

        datasetManager.list()
            .then(loadSetDialog)
            .then(function(selectedName) {
                name = selectedName;
                return datasetManager.load(selectedName);
            })
            .then(function(dataSet) {
                self.currentSet.isSaved = true;
                self.currentSet.name = name;
                self.currentSet.dataSet = dataSet;
            })
            .catch(function(reason) {
                if (reason !== 'cancel' && reason !== 'backdrop click') {
                    messenger.error('unable to load data set');
                }
            });
    }
}

function modalDialog($uibModal, dialog) {
    return function(text) {
        return $uibModal.open(dialog(text)).result;
    }
}

}());