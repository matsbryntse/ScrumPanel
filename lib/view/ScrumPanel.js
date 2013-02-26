Ext.define('DEMO.view.ScrumPanel', {
    extend      : 'Ext.Panel',
    alias       : 'widget.scrumpanel',
    requires    : [
        "DEMO.model.User",
        "DEMO.model.Task",
        "DEMO.view.ScrumColumn"
    ],

    columnClass : 'DEMO.view.ScrumColumn',

    flex        : 1,
    border      : false,
    layout      : { type : 'hbox', align : 'stretch' },
    defaults    : { margin : '10 20 10 0' },
    taskCls     : 'sch-task',
    taskSelector: '.sch-task',
    taskStore   : null,
    userStore   : null,

    initComponent : function() {
        this.addBodyCls('sch-scrumpanel');

        this.items = this.createColumns();

        this.callParent(arguments);
    },

    createColumns : function() {
        var store = this.taskStore;

        return [
            new Ext.create(this.columnClass,{
                store : store,
                state : 0
            }),
            new Ext.create(this.columnClass, {
                store : store,
                state : 1
            }),
            new Ext.create(this.columnClass, {
                store : store,
                state : 2
            }),
            new Ext.create(this.columnClass, {
                store : store,
                state : 3
            })
        ];
    },

    afterRender : function() {
        var me = this;

        this.callParent(arguments);

        this.setupDragZone();
        this.initEditor();
        this.initAssignMenu();

        this.items.each(function(col) {
            me.relayEvents(col.down('dataview'), [
                'select',
                'deselect',
                'itemclick',
                'itemcontextmenu',
                'itemover',
                'itemdblclick'
            ]);

            this.el.on('click', function() {
                this.expand();
            }, this, { delegate : '.x-panel-header-vertical' });
        });

        this.on('select', this.onSelect, this);
    },

    setupDragZone : function() {
        var me = this;

        new Ext.dd.DropZone(this.id, {
            // If the mouse is over a grid row, return that node. This is
            // provided as the "target" parameter in all "onNodeXXXX" node event handling functions
            getTargetFromEvent: function(e) {
                return e.getTarget();
            },

            // While over a target node, return the default drop allowed class which
            // places a "tick" icon into the drag proxy.
            onNodeOver : function(target, dd, e, data){
                return e.getTarget('.sch-scrumcolumn') ? Ext.dd.DropZone.prototype.dropAllowed : Ext.dd.DropZone.prototype.dropNotAllowed;
            },

            notifyDrop : function(source, e, data) {
                var el          = data.ddel,
                    newState    = me.resolveState(e.getTarget());

                if (newState !== false) {
                    var record      = data.record;

                    if (record.isValidTransition(newState)) {
                        data.record.set('state', newState);
                    } else {
                        return false;
                    }
                }
            }
        });
    },

    resolveState : function(el) {
        var columnEl = Ext.fly(el).up('.sch-scrumcolumn');

        if (columnEl) {
            return parseInt(columnEl.dom.className.match(/state-([^\s]*)/)[1], 10);
        } else {
            return false;
        }
    },

    initEditor : function() {
        var me = this;

        this.editor = new Ext.Editor({
            delegate : '.sch-task-name',
            autoSize            : {
                width   : 'boundEl' // The width will be determined by the width of the boundEl, the height from the editor (21)
            },
            field : {
                xtype       : 'textfield',
                allowEmpty  : false
            },

            listeners : {
                startedit   : function(editor, el) {
                    this.record = me.resolveRecordByNode(el);
                },

                complete    : function(editor, value, original) {
                    var record = this.record;
                    record.set('name', value);
                }
            }
        });

        this.body.on('dblclick', function(e, t) { this.editor.startEdit(t); }, this, { delegate : '.sch-task-name' });
    },

    initAssignMenu : function() {
        var items = [];
        var me = this;

        this.userStore.each(function(user){
            items.push({
                text        : user.data.name,
                userId      : user.data.id,
                userImg     : user.data.img,
                handler     : me.onUserSelected,
                scope       : me
            })
        });

        this.assignMenu = new Ext.menu.Menu({
            renderTo    : document.body,
            cls         : 'sch-usermenu',
            items       : items,
            showForTask : function(task, xy) {
                this.task = task;
                this.showAt(xy);
            },
            listeners : {
                beforeshow : function() {
                    var userId = this.task.data.userId;

                    this.items.each(function(item) {
                        if (userId == item.userId) {
                            item.addCls('sch-user-selected');
                        }
                        else {
                            item.removeCls('sch-user-selected');
                        }
                    });
                }
            }
        });

        this.mon(this.el, {
            click       : this.onUserImgClick,
            delegate    : '.sch-user-avatar',
            scope       : this
        });
    },

    onUserSelected : function(item) {
        this.assignMenu.task.set({
            'userId'    : item.userId,
            'userName'  : item.text,
            'userImg'   : item.userImg
        });
    },

    onUserImgClick : function(e,t) {
        e.stopEvent();
        this.assignMenu.showForTask(this.resolveRecordByNode(t), e.getXY());
    },

    resolveViewByNode : function(node) {
        return this.down('[id=' + Ext.fly(node).up('.sch-scrum-tasklist').id + ']');
    },

    resolveRecordByNode : function(node) {
        var view = this.resolveViewByNode(node);
        return view.getRecord(view.findItemByChild(node));
    },

    onSelect : function(sm) {
        Ext.Array.each(this.query('dataview'), function(v){ v !== sm.view && v.getSelectionModel().deselectAll(); });
    }
});
