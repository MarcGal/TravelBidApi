const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { isLoggedIn } = require('../helpers/middlewares');

const Room = require('../models/room');

router.post('/', (req, res, next) => {
  const { location, facilities:[...rest]  } = req.body;
  const userID  = req.session.currentUser._id;
  const newRoom = new Room({
    userID,
    location,
    facilities,
  });

  newRoom.save()
    .then((Room) => {
      res.status(200);
      res.json({Room});
      console.log({Room});
    })
    .catch(next);
});

router.get('/', (req, res, next) => {
  const id  = req.session.currentUser._id;
  Room.find({ userID: id })
    .then((Room) => {
      res.status(200);
      res.json(Room);
    })
    .catch(next);
});

router.put('/:id', isLoggedIn(), (req, res, next) => {
  const { location, facilities:[...rest]  } = req.body;
  const RoomID = req.params.id;
  const userID = req.session.currentUser._id;
  Room.findByIdAndUpdate(RoomID, {
    location,
    facilities
  }, { new: true })
    .then((Room) => {
      res.json({Room});
    })
    .catch((error) => {
      next(error);
    });
});

router.delete('/:id', isLoggedIn(), (req, res, next) => {
  const RoomID = req.params.id;
  Room.findByIdAndDelete(RoomID)
    .then(() => {
      res.json({ message: `Offer with ${RoomID} is removed successfully.` });
    })
    .catch((error) => {
      next(error);
    });
});

module.exports = router;