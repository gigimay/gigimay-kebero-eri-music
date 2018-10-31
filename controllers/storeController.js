const mongoose = require('mongoose');
const Store = mongoose.model('Store'); // coz mongoose use a concept called singltin once we have defined our store in server.js we can call it anywhere n assign it to variable.
const multer = require('multer');//- uses for uploading file
const jimp = require('jimp')//- uses for resize photos
const uuid = require('uuid');//- make file names unique
const fs = require('fs-extra');


const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter: function(req, file, next){
    const isPhoto = file.mimetype.startsWith('image/')//- verifying the type of image
    const isAudio = file.mimetype.startsWith('audio/')//- verifying the type of audio

    if(isPhoto || isAudio){
      next(null, true) // To reject this file pass it (null, false)
    }else{
      next({message: 'That filetype isn\'t allowed!'}, false);
    }
  }
}

exports.upload = multer(multerOptions).fields([
  { name: 'photo', maxCount: 1 },
  { name: 'audio', maxCount: 1 }
])

exports.postmusic = async (req, res, next) => {
  if (!req.files.audio){
    req.flash('error', 'You must supply an audio!!')
    res.redirect('back');
  }

  // console.log(req.files.audio);
  const extension = req.files.audio[0].originalname.split('.')[1]
  req.body.audio = `${uuid.v4()}.${extension}`;

  await fs.writeFile(`./public/uploads/allsnaps/${req.body.audio}`, req.files.audio[0].buffer);
  next();

}

exports.resize = async ( req, res, next) =>{
  // check if there is no file to resize
  if (!req.files.photo){
    next();
    return;
  }
  const extension = req.files.photo[0].mimetype.split('/')[1]
  req.body.photo = `${uuid.v4()}.${extension}`;
  // resizing photos
  const photo = await jimp.read(req.files.photo[0].buffer);
  await photo.resize(800, 600);
  await photo.write(`./public/uploads/allsnaps/${req.body.photo}`);
  // console.log(req.body.photo);
  next(); //keep going
}

exports.addStore = (req, res) => {
  res.render('editstore', {title: 'Add store'});
}

exports.createStore = async (req, res) => {
  req.body.author = req.user._id;
  const store = await(new Store(req.body)).save();
  req.flash('success', `successfully created ${store.name}, care to leave a review for your music? we would appreciate that`);
  res.redirect(`/store/${store.slug}`);
}

exports.musicStore = async (req, res) => {
  const page = req.params.page || 1;
  const limit = 10;
  const skip = (page * limit) - limit;
  //query the database for a list of all stores
  const storesPromise = Store
  .find()
  .skip(skip)
  .limit(limit)
  const countPromise = Store.count();
  const [musicStore, count] = await Promise.all([storesPromise, countPromise]);
  const pages = Math.ceil(count / limit);

  if (!musicStore.length && skip) {
    req.flash('info', `Hello! You have asked for page ${page}. You are out of music so better to enjoy with the previous page ${pages} 😼 ` );
    res.redirect(`/musicStore/page/${pages}`)
    return;
  }
  res.render('musicStore', {title: 'Music Store', musicStore, page, pages, count})
};

const confirmOwner = (store, user) => {
  if (!store.author.equals(user._id)) {
    throw Error('You must own a store in order to edit it!');
  }
};

exports.editStore = async (req, res) => {
  //find the store given by id
  const store = await Store.findOne({ _id: req.params.id})
  //confirm that they are the owners of the store
  confirmOwner(store, req.user);
  //render out the edit form so the user can update their store
  res.render('editstore', {title: `Edit ${store.name}`, store} )
}

exports.updateStore = async (req, res) => {
  const store = await Store.findOneAndUpdate({ _id: req.params.id}, req.body,
  {
    new: true,
    runValidators: true
  }).exec()
  req.flash('success', `successfully edited your music <strong>${store.name}</strong>.<a href="/store/${store.slug}">View Store</a>`);
  res.redirect(`/musicStore/${store._id}/edit`)
}

exports.deleteStore = async (req, res) => {
  const store = await Store.findOneAndRemove({ _id: req.params.id}).exec();
  res.redirect('back')

}

exports.getStoreBySlug = async (req, res, next) => {
  const store = await Store.findOne({slug: req.params.slug}).populate('author reviews')
  //solution for if a store is not found we call next n pass it to 404 page
  if(!store){
    next()
    return;
  }
  const allMusicInStorePage = await Store.find();

  res.render('store', {store, title: store.name, allMusicInStorePage})
}


exports.getStoresByTag = async (req, res) => {
  const tag = req.params.tag;
  const tagQuery = tag || { $exists: true}
  const tagsPromise = await Store.getTagsList();
  const storesPromise = Store.find({ tags: tagQuery});
  const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);

  res.render('tag', { tags, title: 'Tags', tag, stores })
}

exports.searchStores = async (req, res) => {
  const stores = await Store
  //find stores that match the search
  .find({
    $text: {
      $search: req.query.q //q stands for query
    }
  }, {
    score: {
      $meta: 'textScore'
    }
  })
  // sort them by date added
  .sort({
    score: { $meta: 'textScore' }
  })
  // limit the search in five numbers
  .limit(5)
    res.json(stores);
};
