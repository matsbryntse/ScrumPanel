ScrumState = {
    "0" : 'NotStarted',
    "1" : 'InProgress',
    "2" : 'Test',
    "3" : 'Done'
}

ScrumTexts = {
    "0" : 'Not Started',
    "1" : 'In Progress',
    "2" : 'Test',
    "3" : 'Done'
}

Ext.define('DEMO.model.Task', {
    extend : 'Ext.data.Model',

    fields : [
        { name : 'name' },
        { name : 'state', type : 'int' },
        { name : 'nbrComments', type : 'int' },
        { name : 'userId' },
        { name : 'userName' },
        { name : 'userImg' }
    ],

    isValidTransition : function(toState) {
        var toStateName = ScrumState[toState];

        switch(ScrumState[this.data.state]){
            case 'NotStarted':
                return toStateName == "InProgress";
            case 'InProgress':
                return toStateName != "Done";
            case 'Test':
                return toStateName != "NotStarted";
            case 'Done':
                return toStateName == "Test";

            throw 'Invalid to state ' + toState;
        }
    }
});