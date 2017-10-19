const
  User = require('../models/User.js'),
  Property = require('../models/Property.js'),
  Conversation = require('../models/Conversation.js')

module.exports = {
  dashboard: (req, res) => {
    Property.find({owner: req.user._id}).populate('inquiries').exec((req, properties) => {
      res.render('users/dashboard', { properties })
    })
  },

  myResidents: (req, res) => {
    User.findById(req.user.id)
    .populate({
      path: 'ownedProperties',
      populate: {
        path: 'resident',
        populate: {
          path: 'residence',
          model: 'Property'
        },
        model: 'User'
      }
    })
    .exec((err, user) => {
      var promises = []
      var myResidents = []
      var conversations = {} // key = resident id, value = conversation id

      user.ownedProperties.forEach((property) => {
        if(property.resident) {
          let conversationPromise = Conversation.findOne({ propertyOwner: req.user.id, propertyResident: property.resident.id }, (err, conversation) => {
            conversations[property.resident.id] = conversation.id
            return true
          })
          promises.push(conversationPromise)
          myResidents.push(property.resident)
        }
      })

      Promise.all(promises).then(function(result){
        res.render('users/myResidents', { myResidents, conversations })
      })
    })
  },

  show: (req, res) => {
    res.render('users/profile', { user: req.user })
  },

  new: (req, res) => {
    res.render('users/new')
  },

  create: (req, res) => {
    res.json("user create route")
  },

  edit: (req, res) => {
    User.findById(req.params.id, (err, user) => {
      res.render('users/edit', { user })
    })
  },

  update: (req, res) => {
    console.log(req.body)
    User.findByIdAndUpdate(req.params.id, req.body, { new: true }, (err, user) => {
      res.redirect('/profile')
    })
  },

  resetPassword: (req, res) => {
    res.render('users/resetPassword')
  },

  updatePassword: (req, res) => {
    User.findById(req.user._id, (err, user) => {
      user.password = user.generateHash(req.body.password)
      user.save((err) => {
        if(err) return console.log(err)
        res.redirect('/profile')
      })
    })
  },

  destroy: (req, res) => {
    res.json("user destroy route")
  },
}