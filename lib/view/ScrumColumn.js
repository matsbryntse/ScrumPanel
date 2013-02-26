Ext.define('DEMO.view.ScrumColumn', {
    extend  : 'Ext.Panel',
    cls     : 'sch-scrumcolumn',
    flex    : 1,
    layout  : 'fit',
    collapseDirection : 'right',

    state   : null,
    store   : null,

    tools : [
        {
            type : 'plus',
            handler : function() {
                var pnl = this.up('[store]');
                var store = pnl.store;
                store.add({
                    name    : 'New Task...',
                    state   : pnl.state
                })
            }
        },
        {
            type : 'minimize',
            handler : function() {
                this.up('panel').collapse();
            }
        }
    ],

    taskBodyTpl : '<div class="sch-color"></div>' +
                  '<div class="sch-task-name">{name}</div>' +
                    '<img src="{userImg}" class="sch-user-avatar {[values.userImg ? \"\" : \"sch-no-img\"]}" />',

    taskToolTpl : '<div class="sch-tool-ct">' +
                     '<div class="sch-tool sch-tool-comment {[ values.nbrComments > 0 ? \"\" : \"x-hidden\"]}">{nbrComments}</div>' +
                   '</div>',

    initComponent : function () {
        var me = this;
        this.title = ScrumTexts[this.state];

        this.addCls('state-' + this.state);
        var taskStore = this.store;

        if (typeof this.taskBodyTpl === "string") {
            this.taskBodyTpl = new Ext.XTemplate(this.taskBodyTpl);
        }

        if (typeof this.taskToolTpl === "string") {
            this.taskToolTpl = new Ext.XTemplate(this.taskToolTpl);
        }

        this.items = this.view = new Ext.view.View({
            store           : this.store,
            autoScroll      : true,
            trackOver       : true,
            overItemCls     : 'sch-task-over',
            itemSelector    : '.sch-task',
            cls             : 'sch-scrum-tasklist',
            tpl             : new Ext.XTemplate(
                '<tpl for=".">',
                    '<div class="sch-task {[values.state !== ' + this.state + ' ? "sch-hidden" : ""]}">',
                        '{[this.getInner(values, parent[xindex-1])]}',
                        '{[this.getTools(values)]}',
                        '<div style="clear:both"></div>',
                    '</div>',
                '</tpl>',
                {
                    getInner : function (values, record) {
                        return me.taskBodyTpl.apply(values);
                    }
                },
                {
                    getTools : function (values) {
                        return me.taskToolTpl.apply(values);
                    }
                }
            )
        });

        this.store.on({
            load            : this.refreshTitle,
            datachanged     : this.refreshTitle,
            update          : this.refreshTitle,
            add             : this.refreshTitle,
            remove          : this.refreshTitle,
            scope           : this
        });

        this.callParent(arguments);

        this.refreshTitle();
    },

    refreshTitle : function() {
        var me = this;
        var nbrTasks = this.store.queryBy(function(t) { return t.data.state == me.state; }).length;

        this.setTitle(ScrumTexts[this.state] + (nbrTasks ? ' (' + nbrTasks + ')' : ''));
    },

    afterRender : function() {
        this.callParent(arguments);
        var me = this;

        new Ext.dd.DragZone(this.id, {
            getDragData : function(e) {
                var target = me.view.findItemByChild(e.getTarget());

                if (target) {
                    var record  = me.view.getRecord(target);

                    return {
                        ddel    : target,
                        record  : record
                    };
                }
            }
        });
    }
});
