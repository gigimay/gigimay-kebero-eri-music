const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Please input a valid store name!'
  },
  slug: String,
  description:{
    type: String,
    trim: true
  },
  photo: String,
  audio: String,
  tags: [String],
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'You must supply an author'
  }

});

//define our indexes
storeSchema.index({
  name: 'text',
  description: 'text'
});

storeSchema.pre('save', async function(next){
  if(!this.isModified('name')){
    return next();//stop the function from running and skip to the next
  }
  //- check if there are store that have the same store names
  this.slug = slug(this.name)
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i')
  //- in upper line i reffers to case in sensitive
  const storesWithSlug = await this.constructor.find({slug: slugRegEx });
  if(storesWithSlug.length){
    this.slug = `${this.slug}-${storesWithSlug.length + 1}`
  }
  next()
})

storeSchema.statics.getTagsList = function() {
  return this.aggregate([
    { $unwind: '$tags'},
    { $group: { _id: '$tags', count: { $sum: 1 } }},
    { $sort: { count: -1 } }
  ]);
}

//find reviews where the stores _id property === reviews store property
storeSchema.virtual('reviews', {
  ref: 'Review',  //what model to link?
  localField: '_id', // which field on the store?
  foreignField: 'store' // which field on the review?
})

// populating reviews in each and every music
function autopopulate(next) {
  this.populate('reviews')
  next();
}

storeSchema.pre('find', autopopulate);
storeSchema.pre('findOne', autopopulate);

module.exports = mongoose.model('Store', storeSchema);
