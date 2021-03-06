
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const {
  isLoggedIn,
} = require('../helpers/middlewares');

const Bid = require('../models/bid');
const Offer = require('../models/offer');
const Room = require('../models/room');
const User = require('../models/user');


router.post('/', async (req, res, next) => {
  const { description, value, offerID } = req.body;
  const userID  = req.session.currentUser._id;
  const room = await Room.findOne({userID});
  const roomID = room._id;
  const newBid = new Bid({
    userID,
    offerID,
    roomID,
    description,
    value ,
  });

  newBid.save()
    .then((bid) => {
      res.status(200);
      res.json({bid});
    })
    .catch(next);
});
router.post('/a', (req, res, next) => {
  const { id } = req.body;
  Bid.findById( id)
      .then((bid) => {
        res.status(200);
        res.json(bid);
      })
      .catch(next);
});


router.get('/:offerID', (req, res, next) => {
  const { offerID } = req.params;
  Bid.find({offerID}).populate('userID').populate('roomID')
      .then((bids) => {
        res.status(200);
        res.json(bids);
      })
      .catch(next);
});

router.get('/userBids/:userID', (req, res, next) => {
    const { userID } = req.params;
    Bid.find({userID}).populate('offerID')
      .then((bids) => {
        res.json({bids});
      })
      .catch((error) => {
        next(error);
      });
});



router.delete('/:bidID', (req, res, next) => {
  const bidID  = req.params.bidID;
  Bid.findByIdAndDelete(bidID)
    .then(() => {
      res.json({ message: `Bid with ${bidID} was removed successfully.` });
    })
    .catch(next);
});


router.put('/:bidID', isLoggedIn(), (req, res, next) => {
  const { description, value, Status } = req.body;
  const bidID = req.params.bidID;
  Bid.findByIdAndUpdate(bidID, {
    description,
    value,
    Status,
  }, { new: true })
    .then((bid) => {
      res.json({bid});
    })
    .catch((error) => {
      next(error);
    });
});


router.put('/:bidID/accept', isLoggedIn(), async (req, res, next) => {
  try {
    const { Status, offerID } = req.body;
    const bidID = req.params.bidID;
    await Bid.findByIdAndUpdate(bidID, { Status }, { new: true });
    await Offer.findByIdAndUpdate(offerID, { Status: 1 });
    const bids = await Bid.find({offerID, Status: 0});
    await bids.forEach( async (bid) => {
       await Bid.findByIdAndUpdate(bid.id, { Status: 2 });
    });

    res.json({message: `Bid with ${bidID} was accepted successfully.`});
  } catch (error) {
    next(error);
  }
});

router.put('/:bidID/decline', isLoggedIn(), async (req, res, next) => {
  try {
    const { Status } = req.body;
    const bidID = req.params.bidID;
    await Bid.findByIdAndUpdate(bidID, { Status }, { new: true });
    res.json({message: `Bid with ${bidID} was declined successfully.`});
  } catch (error) {
    next(error);
  }
});

module.exports = router;
