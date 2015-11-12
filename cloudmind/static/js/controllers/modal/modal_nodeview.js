app.controller('Modal_NodeView', ['$scope', '$modalInstance', 'NodeStore', 'UserStore', 'HttpSvc',
    function ($scope, $modalInstance, NodeStore, UserStore, HttpSvc) {

        init_NodeViewModal();

        $scope.searchingUser = [
            {account_id: "1", name: "chorong", email: "crjang91@gmail.com", profile_url: "../../img/a0.jpg"},
            {account_id: "2", name: "chorong2", email: "crjang91@gmail.com", profile_url: "../../img/a0.jpg"},
            {account_id: "3", name: "chorong3", email: "crjang91@gmail.com", profile_url: "../../img/a0.jpg"},
            {account_id: "4", name: "jinsil", email: "crjang91@gmail.com", profile_url: "../../img/a0.jpg"},
            {account_id: "5", name: "jinsil2", email: "crjang91@gmail.com", profile_url: "../../img/a0.jpg"}
        ];

        $scope.cancel = function () {
            $modalInstance.close();
        };

        /* Node */
        $scope.applyInModal = function () {

            var node = $scope.modalNode;
            var dueDate = new Date(node);

            NodeStore.updateNode(node.node_idx, node.name, dueDate.toJSON(),
                $scope.newDes, function (_node_idx, _node_list) {

                    if ($scope.modal_callback.updateNode)
                        $scope.modal_callback.updateNode(_node_idx, _node_list);
                    $scope.nodes = _node_list;

                    $modalInstance.close({
                        name: $scope.name,
                        groupType: $scope.groupType
                    });
                });
        };

        $scope.addNodeInModal = function (_nodename) {

            if (!_nodename) return;

            NodeStore.addNode(_nodename, $scope.modalNode.parent_idx,
                $scope.modalNode.root_idx, function (_node, _node_list) {

                    if ($scope.modal_callback.addNode) $scope.modal_callback.addNode(_node, _node_list);
                    $scope.clickChildNodeInModal(_node);
                });
        };

        $scope.clickChildNodeInModal = function (_node) {
            $scope.modalNode = JSON.parse(JSON.stringify(_node));
            init_NodeViewModal();
        };

        $scope.filterChildNode = function (_node) {

            if (_node.parent_idx == $scope.modalNode.node_idx) return true;
            else return false;
        };

        $scope.filterChildLeaf = function (leaf) {

        };

        /* label */
        $scope.addLabelInModal = function (_idx) {
            var node = $scope.modalNode;

            NodeStore.addLabel(node.node_idx, _idx,
                function (_node_id, _node_list, _palette_id) {
                    $scope.modalNode.labels.push(_palette_id);

                    if ($scope.modal_callback.addLabel)
                        $scope.modal_callback.addLabel(_node_id, _node_list, _palette_id);
                });
        };

        $scope.removeLabelInModal = function (_idx) {
            NodeStore.removeLabel($scope.modalNode.node_idx, _idx,
                function (_node_id, _node_list, _palette_id) {

                    var idx = $scope.modalNode.labels.indexOf(_palette_id);
                    $scope.modalNode.labels.splice(idx, 1);
                    if ($scope.modal_callback.removeLabel) {
                        $scope.modal_callback.removeLabel(_node_id, _node_list, _palette_id);
                    }
                });
        };

        $scope.hasLabel = function (_idx) {

            var labelIdx = $scope.modalNode.labels.indexOf(_idx);
            if (labelIdx == -1) {
                $scope.addLabelInModal(_idx);
            }
            else  $scope.removeLabelInModal(_idx);
        };

        /* Participant */
        $scope.addParticipantInModal = function (_user_idx) {
            console.log($scope.users);
            console.log(_user_idx);
            $scope.modalNode.assigned_users.push(_user_idx);
        };

        $scope.inviteUserInModal = function (_user) {

            HttpSvc.inviteRoot($scope.modalNode.root_idx, _user.description)
                .success(function (res) {
                    console.log(res);
                })
                .error(function (err) {
                    console.log(err);
                });
        };

        $scope.clearInput = function (id) {
            if (id) {
                $scope.$broadcast('angucomplete-alt:clearInput', id);
            }
            else {
                $scope.$broadcast('angucomplete-alt:clearInput');
            }
        };


        /* label palette */
        $scope.updateLabelPalette = function (_palette, _newPaletteName) {

            NodeStore.updateLabelPalette(_palette.palette_idx, _newPaletteName, _palette.color,
                function (_palette) {
                    $scope.cancelEditPaletteMode(_palette.palette_idx);

                    $scope.labelPalette[_palette.palette_idx].name = _palette.name;
                    $scope.$apply();

                    if ($scope.modal_callback.updatePalette)
                        $scope.modal_callback.updatePalette(_palette);
                });
        };

        $scope.editPaletteMode = function (_idx) {
            $scope.editPalette[_idx] = true;
            $scope.newPaletteName = $scope.labelPalette[_idx].name;
        };

        $scope.cancelEditPaletteMode = function (_idx) {
            $scope.editPalette[_idx] = false;
        };

        $scope.addLeafInModal = function () {
            NodeStore.addLeaf($scope.newLeaf, $scope.modalNode.node_idx, function (_node_idx, _leaf, _node_list) {

                document.getElementById('leafName').value = null;
                $scope.modalNode.leafs.push(_leaf);
                if ($scope.modal_callback.addLeaf)
                    $scope.modal_callback.addLeaf(_node_idx, _leaf, _node_list);
            });
        };

        $scope.removeLeafInModal = function (_idx) {

        };

        $scope.downloadLeafInModal = function (_idx) {
            var URL = "/api/v1/leaf/" + _idx;
            window.open(URL, '_blank');
            return URL + _idx;
        };

        function init_NodeViewModal() {

            $scope.labelPalette = NodeStore.getLabelPalette();
            $scope.users = UserStore.syncUserList();

            $scope.editPalette = new Object();
            $scope.isEditmode = false;
            $scope.newDes = $scope.modalNode.description;
            $scope.newLeaf = null;

            $scope.modalNode.due_date = $scope.modalNode.due_date.substring(0, 10);

            for (var p in $scope.labelPalette) {
                $scope.editPalette[p] = false;
            }
        }
    }]);

app.controller('DatepickekCtrl', ['$scope', function ($scope) {

    $scope.$watch('dt', function () {
            var year = $scope.dt.getFullYear();
            var month = $scope.dt.getMonth() + 1;
            var date = $scope.dt.getDate();

            $scope.modalNode.due_date = (year + '-' + month + '-' + date);
        }
    );

    $scope.setDate = function (_date) {
        var date = _date.split('-');
        $scope.dt = new Date(date[0], date[1] - 1, date[2]);
    };

    $scope.open = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.opened = !$scope.opened;
    };

    initDatePicker();

    function initDatePicker() {
        $scope.setDate($scope.modalNode.due_date);
    }

    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1,
        class: 'datepicker'
    };

    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[1];
}]);

