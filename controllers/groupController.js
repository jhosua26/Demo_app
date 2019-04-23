const model = require('../models/groupModel');

module.exports = (server) => {

    server.post('/group',  (req, res) => {
        model.saveGroup({name: req.body.name}, (success, result) => {
            // if (success) res.json({
            //     status: 'OK'
            // })
            // else res.json({
            //     status: 'Error'
            // })
            if(success) {
                res.json(success)
            } else {
                res.json({
                    status: 'Error'
                })
            }
        })
    })

    server.get('/group', (req, res) => {
        model.getGroups((result) => {
            res.send(result)
        })
    })

    server.get('/group/:group_id', (req, res) => {
        model.getGroup(req.params.group_id, (result) => {
            res.send(result)
        })
    })

    server.put('/group/:group_id', (req, res) => {
        model.updateGroup({name: req.body.name}, req.params.group_id, (result) => {
            res.send(result)
        })
    })

    server.del('/group/:group_id', (req, res) => {
        model.deleteGroup(req.params.group_id, (result) => {
            res.send(result)
        })
    })
};