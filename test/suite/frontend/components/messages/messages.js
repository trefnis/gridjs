(function() {
'use strict';

angular
    .module('gridjs-test.messages', [])
    .factory('messenger', [messenger])
    .controller('MessagesController', ['messenger', MessagesController])
    .directive('messages', messagesDirective);

function messenger() {
    var messageTypes = {
        'info': 'info',
        'success': 'success',
        'warning': 'warning',
        'error': 'danger'
    };

    var messenger = {
        messages: [],
        defaultTimeout: 5000
    };

    _.forOwn(messageTypes, addMessageListener.bind(messenger));

    return messenger;
}

function addMessageListener(typeValue, typeName) {
    this[typeName] = function(text, timeout) {
        this.messages.push({
            text: text,
            timeout: timeout,
            type: typeValue
        });
    };
}

function MessagesController(messenger) {
    this.messages = messenger.messages;
    this.defaultTimeout = messenger.defaultTimeout;

    this.closeMsg = function(index) {
        this.messages.splice(index, 1);
    };
}

function messagesDirective() {
    return {
        templateUrl: 'components/messages/messages.html',
        scope: true,
        controller: 'MessagesController',
        controllerAs: 'messenger',
        bindToController: true,
    };
}

}());